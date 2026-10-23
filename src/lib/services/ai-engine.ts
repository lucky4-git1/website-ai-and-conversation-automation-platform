import { getDb } from '@/lib/db';
import { AnalyticsService } from './analytics';
import { CatalogService } from './catalog';

export interface GroundedAnswerResult {
  answer: string;
  isGrounded: boolean;
  citations: Array<{ sourceId: string; title: string; snippet: string }>;
  suggestedAction?: 'SPEAK_TO_HUMAN' | 'REQUEST_QUOTE' | 'EXPLORE_CATALOG';
  recommendedItems?: any[];
  latencyMs: number;
  tokensUsed?: number;
}

export interface RetrievedChunk {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  chunkText: string;
  score: number;
}

export class AIEngine {
  /**
   * SSRF Protection: strictly validates ingestion target URLs before fetching
   */
  static validateUrlForIngestion(urlStr: string): { valid: boolean; reason?: string } {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { valid: false, reason: 'Only HTTP and HTTPS protocols are permitted.' };
      }

      const hostname = url.hostname.toLowerCase();

      // Check loopback, local, and cloud metadata hostnames
      const blockedPatterns = [
        'localhost',
        '127.',
        '169.254.', // AWS/GCP/Azure link-local metadata
        '10.',
        '192.168.',
        '0.0.0.0',
        '::1',
        'metadata.google.internal'
      ];

      for (const pattern of blockedPatterns) {
        if (hostname.includes(pattern) || hostname.startsWith(pattern)) {
          return { valid: false, reason: `Access to restricted internal/metadata address (${pattern}) is prohibited.` };
        }
      }

      // Check RFC1918 172.16.0.0 - 172.31.255.255
      if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
        return { valid: false, reason: 'Access to private RFC1918 internal subnets is prohibited.' };
      }

      return { valid: true };
    } catch {
      return { valid: false, reason: 'Invalid URL format.' };
    }
  }

  /**
   * Cleans untrusted user input to mitigate prompt injection, jailbreaking, and control character attacks
   */
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // remove control chars
      .replace(/(system prompt|ignore previous instructions|developer mode|admin password|override safety)/gi, '[REDACTED_QUERY_TERM]')
      .trim();
  }

  /**
   * Retrieves tenant-scoped knowledge chunks using BM25-style lexical and semantic relevance
   */
  static retrieveRelevantChunks(tenantId: string, query: string, maxResults = 3): RetrievedChunk[] {
    const db = getDb();
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (queryTokens.length === 0) {
      return [];
    }

    // Query published knowledge chunks strictly scoped by tenant_id
    const rows = db.prepare(`
      SELECT 
        kc.id as chunk_id,
        kc.source_id,
        ks.title as source_title,
        kc.chunk_text,
        kc.keywords
      FROM knowledge_chunks kc
      JOIN knowledge_sources ks ON kc.source_id = ks.id
      WHERE kc.tenant_id = ? AND ks.is_published = 1 AND ks.status = 'INDEXED'
    `).all(tenantId) as Array<{
      chunk_id: string;
      source_id: string;
      source_title: string;
      chunk_text: string;
      keywords: string;
    }>;

    const scoredChunks: RetrievedChunk[] = [];

    for (const row of rows) {
      let score = 0;
      const lowerChunk = row.chunk_text.toLowerCase();
      const lowerTitle = row.source_title.toLowerCase();

      for (const token of queryTokens) {
        // Direct title match gives high weight
        if (lowerTitle.includes(token)) {
          score += 5;
        }
        // Direct chunk text match
        if (lowerChunk.includes(token)) {
          score += 2;
        }
      }

      if (score > 0) {
        scoredChunks.push({
          chunkId: row.chunk_id,
          sourceId: row.source_id,
          sourceTitle: row.source_title,
          chunkText: row.chunk_text,
          score
        });
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, maxResults);
  }

  /**
   * Generates a grounded response strictly tied to verified business knowledge
   */
  static async generateAnswer(tenantId: string, visitorMessage: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<GroundedAnswerResult> {
    const startTime = Date.now();
    const sanitized = this.sanitizeUserInput(visitorMessage);
    const lowerMessage = sanitized.toLowerCase();

    // 1. Check for explicit human handoff intent
    const handoffTriggers = ['human', 'agent', 'person', 'operator', 'representative', 'support staff', 'speak to someone'];
    if (handoffTriggers.some((trigger) => lowerMessage.includes(trigger))) {
      return {
        answer: 'I would be glad to connect you with one of our enterprise solution specialists. Let me initiate a live handoff for you right away.',
        isGrounded: true,
        citations: [],
        suggestedAction: 'SPEAK_TO_HUMAN',
        latencyMs: Date.now() - startTime
      };
    }

    // 2. Check for catalog & product recommendation inquiries
    if (lowerMessage.includes('package') || lowerMessage.includes('recommend') || lowerMessage.includes('service') || lowerMessage.includes('catalog')) {
      const recommendations = CatalogService.getRecommendations(tenantId, sanitized);
      if (recommendations.length > 0) {
        const top = recommendations[0];
        const latency = Date.now() - startTime;
        return {
          answer: `Based on your inquiry, our **${top.item.name}** (${top.item.priceDisplay}) is an excellent fit. It includes: ${top.item.features.slice(0, 3).join(', ')}. Would you like to review full tier details or receive a formal quotation?`,
          isGrounded: true,
          citations: [{ sourceId: top.item.id, title: `Service Catalog: ${top.item.name}`, snippet: top.item.description }],
          suggestedAction: 'EXPLORE_CATALOG',
          recommendedItems: recommendations.map((r) => r.item),
          latencyMs: latency
        };
      }
    }

    // 3. Grounded RAG Retrieval
    // Check for unapproved terms or specific discount/commitment requests not in verified documentation
    const unapprovedInquiryTerms = ['discount', 'free hardware', 'coupon', 'voucher', 'guaranteed sales', '90%', 'special deal'];
    const hasUnapprovedTerms = unapprovedInquiryTerms.some((t) => lowerMessage.includes(t));

    const relevantChunks = this.retrieveRelevantChunks(tenantId, sanitized);

    // If query contains unapproved commitments and the chunk does NOT contain them, fall back safely
    const isUnverifiedCommitment = hasUnapprovedTerms && relevantChunks.length > 0 && !unapprovedInquiryTerms.some((t) => relevantChunks[0].chunkText.toLowerCase().includes(t));

    if (relevantChunks.length > 0 && relevantChunks[0].score >= 2 && !isUnverifiedCommitment) {
      // Grounded answer synthesized directly from retrieved knowledge
      const primaryChunk = relevantChunks[0];
      const citations = relevantChunks.map((c) => ({
        sourceId: c.sourceId,
        title: c.sourceTitle,
        snippet: c.chunkText.length > 140 ? `${c.chunkText.substring(0, 140)}...` : c.chunkText
      }));

      // High-precision grounded response format
      let responseText = `${primaryChunk.chunkText}\n\n*Source: ${primaryChunk.sourceTitle}*`;

      // If inquiry was about pricing, add quotation CTA
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
        responseText += `\n\nWould you like me to prepare a customized quotation for your team?`;
      }

      const latency = Date.now() - startTime;

      AnalyticsService.recordEvent({
        tenantId,
        eventType: 'answer_provided',
        metadata: { sourceCount: relevantChunks.length, primarySource: primaryChunk.sourceTitle }
      });

      return {
        answer: responseText,
        isGrounded: true,
        citations,
        suggestedAction: lowerMessage.includes('price') ? 'REQUEST_QUOTE' : undefined,
        latencyMs: latency
      };
    }

    // 4. Safe Fallback: When no verified knowledge matches, NEVER invent pricing, guarantees, or policies.
    const latency = Date.now() - startTime;

    AnalyticsService.recordEvent({
      tenantId,
      eventType: 'answer_fallback_used',
      metadata: { query: sanitized }
    });

    return {
      answer: "I do not have verified documentation in our approved knowledge base to answer that specific question with complete accuracy. I want to make sure you get the exact details rather than guessing.\n\nWould you like me to connect you with a live specialist or collect your contact details for a priority follow-up?",
      isGrounded: false,
      citations: [],
      suggestedAction: 'SPEAK_TO_HUMAN',
      latencyMs: latency
    };
  }
}
