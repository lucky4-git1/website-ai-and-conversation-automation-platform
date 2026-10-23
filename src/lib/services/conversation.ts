import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AnalyticsService } from './analytics';
import { AIEngine } from './ai-engine';
import { LeadService } from './lead';

export type ConversationStatus =
  | 'AI_ACTIVE'
  | 'HANDOFF_REQUESTED'
  | 'HUMAN_ASSIGNED'
  | 'HUMAN_ACTIVE'
  | 'RESOLVED';

export interface SendMessageParams {
  tenantId: string;
  siteId: string;
  conversationId?: string;
  visitorId: string;
  content: string;
  senderType?: 'VISITOR' | 'AI' | 'AGENT' | 'SYSTEM';
  senderName?: string;
  citations?: any[];
  structuredData?: any;
}

export class ConversationService {
  /**
   * Finds an existing active conversation or initiates a new one
   */
  static getOrCreateConversation(tenantId: string, siteId: string, visitorId: string): string {
    const db = getDb();
    const existing = db.prepare(`
      SELECT id FROM conversations
      WHERE tenant_id = ? AND visitor_id = ? AND status != 'RESOLVED'
      ORDER BY updated_at DESC LIMIT 1
    `).get(tenantId, visitorId) as { id: string } | undefined;

    if (existing) {
      return existing.id;
    }

    const conversationId = `conv_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO conversations (id, tenant_id, site_id, visitor_id, status, channel, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'AI_ACTIVE', 'WIDGET', ?, ?)
    `).run(conversationId, tenantId, siteId, visitorId, now, now);

    AnalyticsService.recordEvent({
      tenantId,
      eventType: 'conversation_started',
      sessionId: visitorId,
      conversationId
    });

    return conversationId;
  }

  /**
   * Appends a message to the conversation and updates timestamps
   */
  static appendMessage(params: SendMessageParams): string {
    const db = getDb();
    const messageId = `msg_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_type, sender_name, content, citations, structured_data, latency_ms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      params.conversationId!,
      params.senderType || 'VISITOR',
      params.senderName || 'Visitor',
      params.content,
      JSON.stringify(params.citations || []),
      JSON.stringify(params.structuredData || {}),
      null,
      now
    );

    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(now, params.conversationId!);

    return messageId;
  }

  /**
   * Processes an incoming visitor message:
   * 1. Stores visitor message
   * 2. Checks conversation state: if HUMAN_ACTIVE or HANDOFF_REQUESTED, waits for human operator
   * 3. If AI_ACTIVE, passes query to AIEngine for grounded answer or handoff trigger
   * 4. Updates lead scoring if intent detected
   */
  static async handleVisitorMessage(params: SendMessageParams) {
    const db = getDb();
    const conversationId = params.conversationId || this.getOrCreateConversation(params.tenantId, params.siteId, params.visitorId);
    params.conversationId = conversationId;

    // 1. Store visitor message
    this.appendMessage({
      ...params,
      senderType: 'VISITOR',
      senderName: params.senderName || 'Visitor'
    });

    // 2. Fetch conversation record
    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId) as any;

    // If conversation is already assigned or active with a human, do not generate AI reply
    if (conv.status === 'HUMAN_ACTIVE' || conv.status === 'HUMAN_ASSIGNED') {
      return {
        conversationId,
        status: conv.status,
        reply: null,
        isHumanActive: true
      };
    }

    // 3. Evaluate AI Response
    const aiResult = await AIEngine.generateAnswer(params.tenantId, params.content);

    // 4. If AI triggered human handoff, update state machine
    if (aiResult.suggestedAction === 'SPEAK_TO_HUMAN') {
      this.requestHumanHandoff(conversationId, 'Visitor requested human specialist or ungrounded inquiry');
    }

    // 5. Store AI reply message
    const replyMessageId = `msg_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_type, sender_name, content, citations, structured_data, latency_ms, created_at)
      VALUES (?, ?, 'AI', 'Apex Assistant', ?, ?, ?, ?, ?)
    `).run(
      replyMessageId,
      conversationId,
      aiResult.answer,
      JSON.stringify(aiResult.citations),
      JSON.stringify(aiResult.recommendedItems ? { recommendedItems: aiResult.recommendedItems } : {}),
      aiResult.latencyMs,
      now
    );

    // 6. Progressive lead capture check
    if (params.content.toLowerCase().includes('quote') || params.content.toLowerCase().includes('pricing')) {
      LeadService.captureLead({
        tenantId: params.tenantId,
        conversationId,
        visitorId: params.visitorId,
        intentSignal: 'QUOTE_REQUEST'
      });
    }

    return {
      conversationId,
      status: aiResult.suggestedAction === 'SPEAK_TO_HUMAN' ? 'HANDOFF_REQUESTED' : 'AI_ACTIVE',
      reply: {
        id: replyMessageId,
        content: aiResult.answer,
        citations: aiResult.citations,
        suggestedAction: aiResult.suggestedAction,
        recommendedItems: aiResult.recommendedItems,
        createdAt: now
      }
    };
  }

  /**
   * Request human handoff: transitions conversation to HANDOFF_REQUESTED
   */
  static requestHumanHandoff(conversationId: string, reason: string) {
    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE conversations
      SET status = 'HANDOFF_REQUESTED', handoff_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(reason, now, conversationId);

    const conv = db.prepare('SELECT tenant_id, lead_id FROM conversations WHERE id = ?').get(conversationId) as any;
    if (conv) {
      AnalyticsService.recordEvent({
        tenantId: conv.tenant_id,
        eventType: 'human_handoff_requested',
        conversationId,
        leadId: conv.lead_id || undefined,
        metadata: { reason }
      });

      if (conv.lead_id) {
        LeadService.logActivity(conv.lead_id, 'HANDOFF_REQUESTED', `Visitor requested human operator. Reason: ${reason}`);
      }
    }
  }

  /**
   * Operator assigns and accepts conversation: transitions to HUMAN_ACTIVE
   */
  static assignOperator(conversationId: string, userId: string) {
    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE conversations
      SET status = 'HUMAN_ACTIVE', assigned_user_id = ?, updated_at = ?
      WHERE id = ?
    `).run(userId, now, conversationId);
  }

  /**
   * Operator sends human reply
   */
  static sendOperatorReply(conversationId: string, userId: string, operatorName: string, content: string) {
    const db = getDb();
    const messageId = `msg_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_type, sender_name, content, citations, latency_ms, created_at)
      VALUES (?, ?, 'AGENT', ?, ?, '[]', 150, ?)
    `).run(messageId, conversationId, operatorName, content, now);

    db.prepare(`
      UPDATE conversations
      SET status = 'HUMAN_ACTIVE', assigned_user_id = ?, updated_at = ?
      WHERE id = ?
    `).run(userId, now, conversationId);

    return messageId;
  }

  /**
   * Resolves conversation
   */
  static resolveConversation(conversationId: string) {
    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE conversations
      SET status = 'RESOLVED', resolved_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, conversationId);

    const conv = db.prepare('SELECT tenant_id, lead_id FROM conversations WHERE id = ?').get(conversationId) as any;
    if (conv) {
      AnalyticsService.recordEvent({
        tenantId: conv.tenant_id,
        eventType: 'conversation_resolved',
        conversationId,
        leadId: conv.lead_id || undefined
      });
    }
  }
}
