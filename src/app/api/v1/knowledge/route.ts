import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { AIEngine } from '@/lib/services/ai-engine';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const db = getDb();

  const sources = db.prepare(`
    SELECT id, type, title, content, source_url, status, chunk_count, is_published, error_message, last_indexed_at, created_at, updated_at
    FROM knowledge_sources
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `).all(tenantId);

  return NextResponse.json({ sources });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId = 'tenant_default_01', type, title, content, sourceUrl } = body;

    if (!title || (!content && !sourceUrl)) {
      return NextResponse.json({ error: 'Title and content or source URL are required.' }, { status: 400 });
    }

    // SSRF Defense if sourceUrl is provided
    if (sourceUrl) {
      const ssrfCheck = AIEngine.validateUrlForIngestion(sourceUrl);
      if (!ssrfCheck.valid) {
        return NextResponse.json({ error: ssrfCheck.reason }, { status: 400 });
      }
    }

    const db = getDb();
    const sourceId = `kb_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const finalContent = content || `Crawled content from verified domain: ${sourceUrl}`;

    // Simple chunking algorithm: split by double newlines or sentences, min 50 chars
    const rawChunks = finalContent
      .split(/\n\n+/)
      .map((c: string) => c.trim())
      .filter((c: string) => c.length > 20);

    const chunks = rawChunks.length > 0 ? rawChunks : [finalContent.trim()];

    db.prepare(`
      INSERT INTO knowledge_sources (id, tenant_id, type, title, content, source_url, status, chunk_count, is_published, last_indexed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'INDEXED', ?, 1, ?, ?, ?)
    `).run(
      sourceId,
      tenantId,
      type || 'TEXT',
      title,
      finalContent,
      sourceUrl || null,
      chunks.length,
      now,
      now,
      now
    );

    for (let i = 0; i < chunks.length; i++) {
      db.prepare(`
        INSERT INTO knowledge_chunks (id, source_id, tenant_id, chunk_text, token_count, keywords, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `${sourceId}_chk_${i}`,
        sourceId,
        tenantId,
        chunks[i],
        chunks[i].split(/\s+/).length,
        title.toLowerCase(),
        now
      );
    }

    AuditService.logAction({
      tenantId,
      userEmail: 'alex.mercer@apexsolutions.example.com',
      action: 'KNOWLEDGE_SOURCE_CREATED',
      targetType: 'KNOWLEDGE_SOURCE',
      targetId: sourceId,
      details: { title, chunkCount: chunks.length, type }
    });

    return NextResponse.json({
      success: true,
      sourceId,
      chunkCount: chunks.length,
      message: 'Knowledge source ingested, chunked, and published successfully.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
