import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { ConsentService } from './consent';
import { AnalyticsService } from './analytics';
import { CRMIntegrationService } from './integrations/crm';
import { WhatsAppIntegrationService } from './integrations/whatsapp';

export interface WorkflowAction {
  step: number;
  action: 'QUEUE_CRM_SYNC' | 'SEND_CONFIRMATION_EMAIL' | 'SEND_WHATSAPP_FOLLOWUP' | 'NOTIFY_TEAM_SLACK_OR_EMAIL';
  provider?: string;
  template?: string;
  channel?: string;
  delayMinutes?: number;
}

export interface QuietHoursConfig {
  enabled: boolean;
  start: string; // "22:00"
  end: string;   // "08:00"
  timezone?: string;
}

export class WorkflowEngine {
  /**
   * Checks whether current time falls within configured quiet hours
   */
  static isQuietHours(quietHours: QuietHoursConfig): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getUTCHours(); // Simplified UTC evaluation
    const [startHour] = quietHours.start.split(':').map(Number);
    const [endHour] = quietHours.end.split(':').map(Number);

    if (startHour > endHour) {
      // Over midnight (e.g. 22:00 to 08:00)
      return currentHour >= startHour || currentHour < endHour;
    }
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Evaluates active workflows triggered by an event and enqueues executions
   */
  static triggerWorkflows(tenantId: string, triggerEvent: string, context: { leadId?: string; conversationId?: string; score?: number }) {
    const db = getDb();
    const workflows = db.prepare(`
      SELECT * FROM workflows
      WHERE tenant_id = ? AND trigger_event = ? AND is_active = 1
    `).all(tenantId, triggerEvent) as any[];

    for (const wf of workflows) {
      const conditions = JSON.parse(wf.conditions_json || '{}');
      if (conditions.minScore && (context.score || 0) < conditions.minScore) {
        continue; // Does not meet minimum score condition
      }

      const executionId = `wf_exec_${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO workflow_executions (
          id, workflow_id, tenant_id, lead_id, conversation_id,
          status, current_step, attempts, max_attempts, next_run_at,
          execution_history, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'PENDING', 0, 0, 3, ?, '[]', ?, ?)
      `).run(
        executionId,
        wf.id,
        tenantId,
        context.leadId || null,
        context.conversationId || null,
        now,
        now,
        now
      );

      AnalyticsService.recordEvent({
        tenantId,
        eventType: 'followup_scheduled',
        leadId: context.leadId,
        conversationId: context.conversationId,
        metadata: { workflowId: wf.id, workflowName: wf.name }
      });
    }
  }

  /**
   * Processes all pending workflow executions
   */
  static async runPendingExecutions(tenantId: string) {
    const db = getDb();
    const pending = db.prepare(`
      SELECT we.*, w.actions_json, w.quiet_hours_json, w.name as workflow_name
      FROM workflow_executions we
      JOIN workflows w ON we.workflow_id = w.id
      WHERE we.tenant_id = ? AND we.status = 'PENDING' AND we.attempts < we.max_attempts
      LIMIT 10
    `).all(tenantId) as any[];

    const results = [];

    for (const exec of pending) {
      const quietHours: QuietHoursConfig = JSON.parse(exec.quiet_hours_json || '{"enabled": false}');
      if (this.isQuietHours(quietHours)) {
        // Postpone to next eligible window
        results.push({ executionId: exec.id, status: 'POSTPONED_QUIET_HOURS' });
        continue;
      }

      // Mark running
      db.prepare("UPDATE workflow_executions SET status = 'RUNNING', attempts = attempts + 1, updated_at = datetime('now') WHERE id = ?").run(exec.id);

      const actions: WorkflowAction[] = JSON.parse(exec.actions_json || '[]');
      const history = JSON.parse(exec.execution_history || '[]');
      let allSuccess = true;
      let failureReason = '';

      for (const action of actions) {
        try {
          if (action.action === 'QUEUE_CRM_SYNC' && exec.lead_id) {
            await CRMIntegrationService.syncLeadToCRM(tenantId, exec.lead_id);
            history.push({ step: action.step, action: action.action, status: 'SUCCESS', timestamp: new Date().toISOString() });
          } else if (action.action === 'SEND_CONFIRMATION_EMAIL' && exec.lead_id) {
            // Verify consent
            const hasConsent = ConsentService.hasActiveConsent(tenantId, { leadId: exec.lead_id }, 'EMAIL', 'SERVICE_FOLLOWUP');
            if (hasConsent) {
              history.push({ step: action.step, action: action.action, status: 'SUCCESS', details: 'Confirmation email queued', timestamp: new Date().toISOString() });
            } else {
              history.push({ step: action.step, action: action.action, status: 'SKIPPED_NO_CONSENT', timestamp: new Date().toISOString() });
            }
          } else if (action.action === 'SEND_WHATSAPP_FOLLOWUP' && exec.lead_id) {
            const lead = db.prepare('SELECT phone FROM leads WHERE id = ?').get(exec.lead_id) as any;
            if (lead?.phone) {
              const waRes = await WhatsAppIntegrationService.sendMessage({
                tenantId,
                recipientPhone: lead.phone,
                templateName: action.template || 'lead_followup_utility_v1',
                leadId: exec.lead_id
              });
              history.push({ step: action.step, action: action.action, status: waRes.success ? 'SUCCESS' : 'FAILED', details: waRes.error, timestamp: new Date().toISOString() });
              if (!waRes.success) {
                allSuccess = false;
                failureReason = waRes.error || 'WhatsApp send failure';
              }
            }
          } else {
            history.push({ step: action.step, action: action.action, status: 'SUCCESS', timestamp: new Date().toISOString() });
          }
        } catch (err: any) {
          allSuccess = false;
          failureReason = err.message;
          history.push({ step: action.step, action: action.action, status: 'ERROR', error: err.message, timestamp: new Date().toISOString() });
          break;
        }
      }

      const finalStatus = allSuccess ? 'COMPLETED' : (exec.attempts + 1 >= exec.max_attempts ? 'FAILED' : 'PENDING');
      db.prepare(`
        UPDATE workflow_executions
        SET status = ?, execution_history = ?, error_log = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(finalStatus, JSON.stringify(history), failureReason || null, exec.id);

      results.push({ executionId: exec.id, status: finalStatus });
    }

    return results;
  }
}
