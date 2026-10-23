import { NextRequest, NextResponse } from 'next/server';
import { LeadService } from '@/lib/services/lead';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantId = 'tenant_default_01',
      conversationId,
      visitorId,
      name,
      email,
      phone,
      company,
      serviceInterest,
      budgetRange,
      timeline,
      intentSignal = 'SERVICE_INQUIRY',
      consentGiven = true
    } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: 'At least an email address or phone number must be provided.' }, { status: 400 });
    }

    const leadResult = LeadService.captureLead({
      tenantId,
      conversationId,
      visitorId,
      name,
      email,
      phone,
      company,
      serviceInterest,
      budgetRange,
      timeline,
      intentSignal,
      consentGiven
    });

    return NextResponse.json({
      success: true,
      leadId: leadResult.leadId,
      score: leadResult.score,
      qualificationStatus: leadResult.qualificationStatus,
      scoreBreakdown: leadResult.scoreBreakdown
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
