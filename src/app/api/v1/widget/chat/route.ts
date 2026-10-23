import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/lib/services/conversation';
import { AnalyticsService } from '@/lib/services/analytics';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteId = 'site_speakforme_01', tenantId = 'tenant_default_01', conversationId, visitorId, content, senderName } = body;

    if (!visitorId || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'visitorId and content string are required.' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message payload exceeds maximum allowable length of 2000 characters.' }, { status: 413 });
    }

    // Record widget open if new session
    if (!conversationId) {
      AnalyticsService.recordEvent({
        tenantId,
        eventType: 'widget_opened',
        sessionId: visitorId
      });
    }

    const result = await ConversationService.handleVisitorMessage({
      tenantId,
      siteId,
      conversationId,
      visitorId,
      content,
      senderName
    });

    return NextResponse.json({
      success: true,
      conversationId: result.conversationId,
      status: result.status,
      reply: result.reply,
      isHumanActive: Boolean(result.isHumanActive)
    });
  } catch (err: any) {
    console.error('Error in /api/v1/widget/chat:', err);
    return NextResponse.json({ error: 'Internal conversation engine error', details: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId parameter is required' }, { status: 400 });
  }

  const db = getDb();
  const messages = db.prepare(`
    SELECT id, sender_type, sender_name, content, citations, structured_data, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(conversationId) as any[];

  const conv = db.prepare('SELECT status, handoff_reason FROM conversations WHERE id = ?').get(conversationId) as any;

  return NextResponse.json({
    conversationId,
    status: conv?.status || 'AI_ACTIVE',
    messages: messages.map((m) => ({
      id: m.id,
      senderType: m.sender_type,
      senderName: m.sender_name,
      content: m.content,
      citations: JSON.parse(m.citations || '[]'),
      structuredData: JSON.parse(m.structured_data || '{}'),
      createdAt: m.created_at
    }))
  });
}
