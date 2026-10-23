import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppIntegrationService } from '@/lib/services/integrations/whatsapp';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode') || '';
  const token = searchParams.get('hub.verify_token') || '';
  const challenge = searchParams.get('hub.challenge') || '';
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';

  const verification = WhatsAppIntegrationService.verifyWebhookSubscription(tenantId, mode, token, challenge);

  if (verification.verified && verification.challenge) {
    return new Response(verification.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return NextResponse.json({ error: 'Webhook verification challenge failed. Invalid token.' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant_default_01';

    const { config } = WhatsAppIntegrationService.getConfig(tenantId);
    const appSecret = config.appSecret || process.env.WHATSAPP_APP_SECRET || '';

    // Validate signature if configured
    if (appSecret) {
      const isValid = WhatsAppIntegrationService.validateWebhookSignature(rawBody, signature, appSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const result = await WhatsAppIntegrationService.handleWebhookEvent(tenantId, payload);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in WhatsApp webhook POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
