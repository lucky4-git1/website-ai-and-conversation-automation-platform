import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { AuditService } from '@/lib/services/audit';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const source = db.prepare('SELECT * FROM knowledge_sources WHERE id = ?').get(id) as any;
  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM knowledge_chunks WHERE source_id = ?').run(id);
  db.prepare('DELETE FROM knowledge_sources WHERE id = ?').run(id);

  AuditService.logAction({
    tenantId: source.tenant_id,
    userEmail: 'alex.mercer@apexsolutions.example.com',
    action: 'KNOWLEDGE_SOURCE_DELETED',
    targetType: 'KNOWLEDGE_SOURCE',
    targetId: id,
    details: { title: source.title }
  });

  return NextResponse.json({ success: true, message: 'Source deleted.' });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { isPublished } = body;
    const db = getDb();

    db.prepare("UPDATE knowledge_sources SET is_published = ?, updated_at = datetime('now') WHERE id = ?").run(isPublished ? 1 : 0, id);

    return NextResponse.json({ success: true, isPublished });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
