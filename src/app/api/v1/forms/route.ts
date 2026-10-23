import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const db = getDb();

  const forms = db.prepare(`
    SELECT f.*,
           (SELECT COUNT(*) FROM form_submissions WHERE form_id = f.id) as submission_count
    FROM forms f
    WHERE f.tenant_id = ?
    ORDER BY f.created_at DESC
  `).all(tenantId) as any[];

  return NextResponse.json({
    forms: forms.map((f) => ({
      ...f,
      fields: JSON.parse(f.fields_json || '[]'),
      settings: JSON.parse(f.settings_json || '{}'),
      isActive: Boolean(f.is_active)
    }))
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId = 'tenant_default_01', name, slug, description, fields, settings } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `form_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO forms (id, tenant_id, name, slug, description, fields_json, settings_json, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      id,
      tenantId,
      name,
      slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      description || '',
      JSON.stringify(fields || []),
      JSON.stringify(settings || { successMessage: 'Thank you for your submission!' }),
      now,
      now
    );

    AuditService.logAction({
      tenantId,
      userEmail: 'alex.mercer@apexsolutions.example.com',
      action: 'FORM_CREATED',
      targetType: 'FORM',
      targetId: id,
      details: { name, slug }
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
