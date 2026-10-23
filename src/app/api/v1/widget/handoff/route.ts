import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/lib/services/conversation';
import { LeadService } from '@/lib/services/lead';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, reason = 'Visitor clicked Speak to a Human Agent', email, name, phone } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    ConversationService.requestHumanHandoff(conversationId, reason);

    // If contact info was voluntarily provided along with handoff request
    if (email || phone) {
      LeadService.captureLead({
        tenantId: 'tenant_default_01',
        conversationId,
        email,
        name,
        phone,
        intentSignal: 'CALLBACK_REQUEST',
        consentGiven: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Handoff requested successfully. Conversation queued for live operator attention.',
      status: 'HANDOFF_REQUESTED'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
