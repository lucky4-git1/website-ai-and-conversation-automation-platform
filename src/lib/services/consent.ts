import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AnalyticsService } from './analytics';

export type ConsentChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';
export type ConsentPurpose = 'MARKETING' | 'SERVICE_FOLLOWUP' | 'TRANSACTIONAL';
export type ConsentStatus = 'OPTED_IN' | 'OPTED_OUT';

export interface ConsentRecordParams {
  tenantId: string;
  visitorId: string;
  leadId?: string;
  channel: ConsentChannel;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  source: string;
  policyVersion?: string;
}

export class ConsentService {
  /**
   * Records or updates explicit consent for a visitor/lead
   */
  static recordConsent(params: ConsentRecordParams): void {
    const db = getDb();
    const now = new Date().toISOString();
    const revokedAt = params.status === 'OPTED_OUT' ? now : null;

    // Check for existing preference
    const existing = db.prepare(`
      SELECT id FROM consent_preferences
      WHERE tenant_id = ? AND visitor_id = ? AND channel = ? AND purpose = ?
    `).get(params.tenantId, params.visitorId, params.channel, params.purpose) as { id: string } | undefined;

    if (existing) {
      db.prepare(`
        UPDATE consent_preferences
        SET status = ?, source = ?, policy_version = ?, updated_at = ?, revoked_at = ?, lead_id = COALESCE(?, lead_id)
        WHERE id = ?
      `).run(
        params.status,
        params.source,
        params.policyVersion || 'v1.0',
        now,
        revokedAt,
        params.leadId || null,
        existing.id
      );
    } else {
      const id = `cns_${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO consent_preferences (id, tenant_id, lead_id, visitor_id, channel, purpose, status, source, policy_version, created_at, updated_at, revoked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        params.tenantId,
        params.leadId || null,
        params.visitorId,
        params.channel,
        params.purpose,
        params.status,
        params.source,
        params.policyVersion || 'v1.0',
        now,
        now,
        revokedAt
      );
    }

    // Telemetry
    AnalyticsService.recordEvent({
      tenantId: params.tenantId,
      eventType: 'consent_updated',
      sessionId: params.visitorId,
      leadId: params.leadId,
      metadata: {
        channel: params.channel,
        purpose: params.purpose,
        status: params.status,
        source: params.source
      }
    });

    // If opted out, terminate any active queued workflows for this visitor/lead
    if (params.status === 'OPTED_OUT') {
      this.cancelPendingFollowUpsOnOptOut(params.tenantId, params.leadId, params.visitorId);
    }
  }

  /**
   * Checks if an outbound message is permissible given consent records
   */
  static hasActiveConsent(tenantId: string, identifier: { visitorId?: string; leadId?: string }, channel: ConsentChannel, purpose: ConsentPurpose): boolean {
    const db = getDb();

    if (identifier.leadId) {
      const record = db.prepare(`
        SELECT status FROM consent_preferences
        WHERE tenant_id = ? AND lead_id = ? AND channel = ? AND purpose = ?
        ORDER BY updated_at DESC LIMIT 1
      `).get(tenantId, identifier.leadId, channel, purpose) as { status: string } | undefined;

      if (record) {
        return record.status === 'OPTED_IN';
      }
    }

    if (identifier.visitorId) {
      const record = db.prepare(`
        SELECT status FROM consent_preferences
        WHERE tenant_id = ? AND visitor_id = ? AND channel = ? AND purpose = ?
        ORDER BY updated_at DESC LIMIT 1
      `).get(tenantId, identifier.visitorId, channel, purpose) as { status: string } | undefined;

      if (record) {
        return record.status === 'OPTED_IN';
      }
    }

    // Default: transactional / direct service confirmations are allowed if legally permitted, but marketing requires explicit opt-in
    return purpose === 'TRANSACTIONAL';
  }

  /**
   * When an opt-out is received (e.g. WhatsApp STOP or preference unsubscribe), immediately cancel pending workflows
   */
  private static cancelPendingFollowUpsOnOptOut(tenantId: string, leadId?: string, visitorId?: string) {
    const db = getDb();
    const now = new Date().toISOString();

    if (leadId) {
      db.prepare(`
        UPDATE workflow_executions
        SET status = 'CANCELLED', error_log = 'Automatically cancelled due to user opt-out revocation', updated_at = ?
        WHERE tenant_id = ? AND lead_id = ? AND status IN ('PENDING', 'RUNNING')
      `).run(now, tenantId, leadId);
    }
  }
}
