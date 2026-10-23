import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const db = getDb();

  const items = db.prepare(`
    SELECT * FROM catalog_items
    WHERE tenant_id = ?
    ORDER BY price ASC
  `).all(tenantId) as any[];

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      features: JSON.parse(item.features || '[]'),
      tags: JSON.parse(item.tags || '[]'),
      isActive: Boolean(item.is_active)
    }))
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId = 'tenant_default_01', name, category, price, priceDisplay, description, features, tags, availability, actionUrl } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: 'Name, category, and price are required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `prod_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO catalog_items (id, tenant_id, name, category, price, price_display, description, features, tags, availability, action_url, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      id,
      tenantId,
      name,
      category,
      Number(price),
      priceDisplay || `$${price}`,
      description || '',
      JSON.stringify(features || []),
      JSON.stringify(tags || []),
      availability || 'IN_STOCK',
      actionUrl || '/demo',
      now,
      now
    );

    AuditService.logAction({
      tenantId,
      userEmail: 'alex.mercer@apexsolutions.example.com',
      action: 'CATALOG_ITEM_CREATED',
      targetType: 'CATALOG_ITEM',
      targetId: id,
      details: { name, price }
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
