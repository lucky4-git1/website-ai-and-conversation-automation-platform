import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const db = getDb();

  const workflows = db.prepare(`
    SELECT * FROM workflows
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `).all(tenantId) as any[];

  const executions = db.prepare(`
    SELECT we.*, w.name as workflow_name, l.name as lead_name, l.email as lead_email
    FROM workflow_executions we
    JOIN workflows w ON we.workflow_id = w.id
    LEFT JOIN leads l ON we.lead_id = l.id
    WHERE we.tenant_id = ?
    ORDER BY we.created_at DESC
    LIMIT 30
  `).all(tenantId) as any[];

  return NextResponse.json({
    workflows: workflows.map((wf) => ({
      ...wf,
      conditions: JSON.parse(wf.conditions_json || '{}'),
      actions: JSON.parse(wf.actions_json || '[]'),
      quietHours: JSON.parse(wf.quiet_hours_json || '{}'),
      isActive: Boolean(wf.is_active)
    })),
    executions: executions.map((ex) => ({
      ...ex,
      executionHistory: JSON.parse(ex.execution_history || '[]')
    }))
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId = 'tenant_default_01', name, description, triggerEvent, conditions, actions, quietHours } = body;

    if (!name || !triggerEvent) {
      return NextResponse.json({ error: 'Name and triggerEvent are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `wf_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO workflows (id, tenant_id, name, description, trigger_event, conditions_json, actions_json, quiet_hours_json, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      id,
      tenantId,
      name,
      description || '',
      triggerEvent,
      JSON.stringify(conditions || {}),
      JSON.stringify(actions || []),
      JSON.stringify(quietHours || { enabled: true, start: '22:00', end: '08:00' }),
      now,
      now
    );

    AuditService.logAction({
      tenantId,
      userEmail: 'alex.mercer@apexsolutions.example.com',
      action: 'WORKFLOW_CREATED',
      targetType: 'WORKFLOW',
      targetId: id,
      details: { name, triggerEvent }
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
