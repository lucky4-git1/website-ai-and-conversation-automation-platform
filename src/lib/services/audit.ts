import { getDb } from '@/lib/db';
import crypto from 'node:crypto';

export class AuditService {
  /**
   * Appends an immutable audit log entry
   */
  static logAction(params: {
    tenantId: string;
    userEmail: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    const db = getDb();
    const id = `audit_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_logs (id, tenant_id, user_email, action, target_type, target_id, details_json, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.tenantId,
      params.userEmail,
      params.action,
      params.targetType,
      params.targetId || null,
      JSON.stringify(params.details || {}),
      params.ipAddress || null,
      now
    );
  }

  /**
   * Retrieves audit logs for a tenant
   */
  static getLogs(tenantId: string, limit = 50) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM audit_logs
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(tenantId, limit);
  }
}
