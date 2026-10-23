import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { CRMIntegrationService } from '@/lib/services/integrations/crm';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as any;
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const activities = db.prepare(`
    SELECT * FROM lead_activities
    WHERE lead_id = ?
    ORDER BY created_at DESC
  `).all(id) as any[];

  const consentRecords = db.prepare(`
    SELECT * FROM consent_preferences
    WHERE lead_id = ? OR visitor_id = ?
    ORDER BY created_at DESC
  `).all(id, lead.email || id) as any[];

  return NextResponse.json({
    lead: {
      ...lead,
      scoreBreakdown: JSON.parse(lead.score_breakdown || '{}'),
      metadata: JSON.parse(lead.metadata || '{}')
    },
    activities: activities.map((a) => ({
      ...a,
      metadata: JSON.parse(a.metadata || '{}')
    })),
    consentRecords
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { action, qualificationStatus } = body;
    const db = getDb();

    if (action === 'RESYNC_CRM') {
      const lead = db.prepare('SELECT tenant_id FROM leads WHERE id = ?').get(id) as any;
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

      const syncResult = await CRMIntegrationService.syncLeadToCRM(lead.tenant_id, id);

      AuditService.logAction({
        tenantId: lead.tenant_id,
        userEmail: 'alex.mercer@apexsolutions.example.com',
        action: 'LEAD_CRM_RESYNC',
        targetType: 'LEAD',
        targetId: id,
        details: { result: syncResult }
      });

      return NextResponse.json({ success: syncResult.success, result: syncResult });
    }

    if (action === 'UPDATE_STATUS' && qualificationStatus) {
      db.prepare("UPDATE leads SET qualification_status = ?, updated_at = datetime('now') WHERE id = ?").run(qualificationStatus, id);
      return NextResponse.json({ success: true, qualificationStatus });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
