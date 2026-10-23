import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ConversationService } from '@/lib/services/conversation';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const conv = db.prepare(`
    SELECT c.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone,
           l.company as lead_company, l.score as lead_score, l.qualification_status as lead_qualification,
           u.name as assigned_agent_name
    FROM conversations c
    LEFT JOIN leads l ON c.lead_id = l.id
    LEFT JOIN users u ON c.assigned_user_id = u.id
    WHERE c.id = ?
  `).get(id) as any;

  if (!conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const messages = db.prepare(`
    SELECT id, sender_type, sender_name, content, citations, structured_data, latency_ms, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(id) as any[];

  return NextResponse.json({
    conversation: {
      ...conv,
      metadata: JSON.parse(conv.metadata || '{}')
    },
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.sender_type,
      senderName: m.sender_name,
      content: m.content,
      citations: JSON.parse(m.citations || '[]'),
      structuredData: JSON.parse(m.structured_data || '{}'),
      latencyMs: m.latency_ms,
      createdAt: m.created_at
    }))
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { action, content, userId = 'user_admin_01', operatorName = 'Alex Mercer' } = body;

    if (action === 'REPLY') {
      if (!content || typeof content !== 'string') {
        return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
      }

      const messageId = ConversationService.sendOperatorReply(id, userId, operatorName, content);

      AuditService.logAction({
        tenantId: 'tenant_default_01',
        userEmail: 'alex.mercer@apexsolutions.example.com',
        action: 'CONVERSATION_REPLIED',
        targetType: 'CONVERSATION',
        targetId: id,
        details: { messageId }
      });

      return NextResponse.json({ success: true, messageId, status: 'HUMAN_ACTIVE' });
    }

    if (action === 'ASSIGN') {
      ConversationService.assignOperator(id, userId);
      return NextResponse.json({ success: true, status: 'HUMAN_ACTIVE' });
    }

    if (action === 'RESOLVE') {
      ConversationService.resolveConversation(id);
      return NextResponse.json({ success: true, status: 'RESOLVED' });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
