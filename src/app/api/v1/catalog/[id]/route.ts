import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { AuditService } from '@/lib/services/audit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, category, price, priceDisplay, description, features, tags, availability, actionUrl, isActive } = body;
    const db = getDb();

    db.prepare(`
      UPDATE catalog_items
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          price = COALESCE(?, price),
          price_display = COALESCE(?, price_display),
          description = COALESCE(?, description),
          features = COALESCE(?, features),
          tags = COALESCE(?, tags),
          availability = COALESCE(?, availability),
          action_url = COALESCE(?, action_url),
          is_active = COALESCE(?, is_active),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || null,
      category || null,
      price !== undefined ? Number(price) : null,
      priceDisplay || null,
      description || null,
      features ? JSON.stringify(features) : null,
      tags ? JSON.stringify(tags) : null,
      availability || null,
      actionUrl || null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      id
    );

    return NextResponse.json({ success: true, message: 'Catalog item updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const item = db.prepare('SELECT tenant_id, name FROM catalog_items WHERE id = ?').get(id) as any;
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  db.prepare('DELETE FROM catalog_items WHERE id = ?').run(id);

  AuditService.logAction({
    tenantId: item.tenant_id,
    userEmail: 'alex.mercer@apexsolutions.example.com',
    action: 'CATALOG_ITEM_DELETED',
    targetType: 'CATALOG_ITEM',
    targetId: id,
    details: { name: item.name }
  });

  return NextResponse.json({ success: true, message: 'Item deleted' });
}
