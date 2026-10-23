import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const status = searchParams.get('status');
  const db = getDb();

  let query = `
    SELECT 
      c.id, c.site_id, c.visitor_id, c.status, c.channel, c.handoff_reason,
      c.created_at, c.updated_at, c.resolved_at,
      l.id as lead_id, l.name as lead_name, l.email as lead_email, l.score as lead_score,
      u.name as assigned_agent_name,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_message_at
    FROM conversations c
    LEFT JOIN leads l ON c.lead_id = l.id
    LEFT JOIN users u ON c.assigned_user_id = u.id
    WHERE c.tenant_id = ?
  `;
  const params: any[] = [tenantId];

  if (status && status !== 'ALL') {
    query += ' AND c.status = ?';
    params.push(status);
  }

  query += ' ORDER BY c.updated_at DESC LIMIT 50';

  const rows = db.prepare(query).all(...params);

  return NextResponse.json({
    conversations: rows
  });
}
