import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AnalyticsService } from './analytics';
import { ConsentService } from './consent';

export interface LeadInput {
  tenantId: string;
  conversationId?: string;
  visitorId?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  budgetRange?: string;
  timeline?: string;
  intentSignal?: 'QUOTE_REQUEST' | 'CALLBACK_REQUEST' | 'SERVICE_INQUIRY' | 'GENERAL_QUESTION';
  consentGiven?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  baseScore: number;
  intentBonus: number;
  contactBonus: number;
  serviceBonus: number;
  budgetBonus: number;
  totalScore: number;
  reasons: string[];
}

export class LeadService {
  /**
   * Calculates an explainable lead score grounded in clear business heuristics
   */
  static calculateLeadScore(lead: Partial<LeadInput>): ScoreBreakdown {
    let baseScore = 5; // Standard engagement baseline
    let intentBonus = 0;
    let contactBonus = 0;
    let serviceBonus = 0;
    let budgetBonus = 0;
    const reasons: string[] = ['Baseline website interaction (+5)'];

    if (lead.intentSignal === 'QUOTE_REQUEST') {
      intentBonus += 40;
      reasons.push('Requested enterprise pricing quotation (+40)');
    } else if (lead.intentSignal === 'CALLBACK_REQUEST') {
      intentBonus += 30;
      reasons.push('Requested direct phone callback (+30)');
    } else if (lead.intentSignal === 'SERVICE_INQUIRY') {
      intentBonus += 20;
      reasons.push('Inquired about specific service capability (+20)');
    }

    if (lead.email) {
      contactBonus += 15;
      reasons.push('Provided work email address (+15)');
    }
    if (lead.phone) {
      contactBonus += 15;
      reasons.push('Provided direct telephone number (+15)');
    }
    if (lead.company) {
      contactBonus += 10;
      reasons.push('Identified verified company name (+10)');
    }

    if (lead.serviceInterest) {
      serviceBonus += 15;
      reasons.push(`Targeted specific service domain: ${lead.serviceInterest} (+15)`);
    }

    if (lead.budgetRange && lead.budgetRange !== 'Under $500') {
      budgetBonus += 15;
      reasons.push(`Stated qualified budget range: ${lead.budgetRange} (+15)`);
    }

    const totalScore = Math.min(100, baseScore + intentBonus + contactBonus + serviceBonus + budgetBonus);

    return {
      baseScore,
      intentBonus,
      contactBonus,
      serviceBonus,
      budgetBonus,
      totalScore,
      reasons
    };
  }

  /**
   * Captures or updates a lead with progressive profiling
   */
  static captureLead(input: LeadInput) {
    const db = getDb();
    const now = new Date().toISOString();

    // Check if an existing lead matches by email or conversation
    let existingLead: any = null;
    if (input.email) {
      existingLead = db.prepare('SELECT * FROM leads WHERE tenant_id = ? AND email = ?').get(input.tenantId, input.email);
    }
    if (!existingLead && input.conversationId) {
      existingLead = db.prepare('SELECT * FROM leads WHERE tenant_id = ? AND conversation_id = ?').get(input.tenantId, input.conversationId);
    }

    const scoreData = this.calculateLeadScore(input);
    const qualificationStatus = scoreData.totalScore >= 60 ? 'QUALIFIED' : (scoreData.totalScore >= 30 ? 'NEW' : 'UNQUALIFIED');

    let leadId: string;

    if (existingLead) {
      leadId = existingLead.id;
      const mergedScore = Math.max(existingLead.score, scoreData.totalScore);
      const mergedQualification = mergedScore >= 60 ? 'QUALIFIED' : existingLead.qualification_status;

      db.prepare(`
        UPDATE leads
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            company = COALESCE(?, company),
            service_interest = COALESCE(?, service_interest),
            budget_range = COALESCE(?, budget_range),
            timeline = COALESCE(?, timeline),
            score = ?,
            score_breakdown = ?,
            qualification_status = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        input.name || null,
        input.email || null,
        input.phone || null,
        input.company || null,
        input.serviceInterest || null,
        input.budgetRange || null,
        input.timeline || null,
        mergedScore,
        JSON.stringify(scoreData),
        mergedQualification,
        now,
        leadId
      );

      this.logActivity(leadId, 'SCORE_UPDATED', `Lead profile updated. Score recalculated to ${mergedScore}.`);
    } else {
      leadId = `lead_${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO leads (
          id, tenant_id, conversation_id, name, email, phone, company,
          service_interest, budget_range, timeline, score, score_breakdown,
          qualification_status, sync_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
      `).run(
        leadId,
        input.tenantId,
        input.conversationId || null,
        input.name || 'Anonymous Visitor',
        input.email || null,
        input.phone || null,
        input.company || null,
        input.serviceInterest || null,
        input.budgetRange || null,
        input.timeline || null,
        scoreData.totalScore,
        JSON.stringify(scoreData),
        qualificationStatus,
        now,
        now
      );

      this.logActivity(leadId, 'CONVERSATION_STARTED', 'Initial lead profile captured via conversion widget.');
    }

    // Link lead to conversation if conversationId is provided
    if (input.conversationId) {
      db.prepare('UPDATE conversations SET lead_id = ? WHERE id = ?').run(leadId, input.conversationId);
    }

    // Record consent if provided
    if (input.consentGiven && (input.visitorId || input.email)) {
      ConsentService.recordConsent({
        tenantId: input.tenantId,
        visitorId: input.visitorId || input.email!,
        leadId,
        channel: input.phone ? 'WHATSAPP' : 'EMAIL',
        purpose: 'SERVICE_FOLLOWUP',
        status: 'OPTED_IN',
        source: 'CONVERSATION_WIDGET'
      });
    }

    // Analytics event
    AnalyticsService.recordEvent({
      tenantId: input.tenantId,
      eventType: 'lead_submitted',
      conversationId: input.conversationId,
      leadId,
      metadata: { score: scoreData.totalScore, qualification: qualificationStatus }
    });

    if (qualificationStatus === 'QUALIFIED') {
      AnalyticsService.recordEvent({
        tenantId: input.tenantId,
        eventType: 'lead_qualified',
        conversationId: input.conversationId,
        leadId,
        metadata: { score: scoreData.totalScore }
      });
    }

    // Automatically enqueue CRM sync job
    this.enqueueCrmSync(input.tenantId, leadId);

    return {
      leadId,
      score: scoreData.totalScore,
      qualificationStatus,
      scoreBreakdown: scoreData
    };
  }

  /**
   * Enqueues lead for CRM synchronization with deduplication
   */
  static enqueueCrmSync(tenantId: string, leadId: string) {
    const db = getDb();
    const existing = db.prepare(`
      SELECT id FROM crm_sync_queue
      WHERE tenant_id = ? AND lead_id = ? AND status IN ('PENDING', 'PROCESSING')
    `).get(tenantId, leadId);

    if (!existing) {
      const syncId = `sync_${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);

      db.prepare(`
        INSERT INTO crm_sync_queue (id, tenant_id, lead_id, provider, payload_json, status, created_at)
        VALUES (?, ?, ?, 'HUBSPOT', ?, 'PENDING', ?)
      `).run(syncId, tenantId, leadId, JSON.stringify(lead), now);
    }
  }

  /**
   * Appends an immutable activity record to the lead timeline
   */
  static logActivity(leadId: string, activityType: string, description: string, metadata?: Record<string, unknown>) {
    const db = getDb();
    const id = `act_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO lead_activities (id, lead_id, activity_type, description, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, leadId, activityType, description, JSON.stringify(metadata || {}), now);
  }
}
