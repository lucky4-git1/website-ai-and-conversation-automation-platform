import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') || 'site_speakforme_01';
  const db = getDb();

  let installation = db.prepare(`
    SELECT * FROM installations WHERE site_id = ?
  `).get(siteId) as any;

  if (!installation) {
    installation = db.prepare('SELECT * FROM installations LIMIT 1').get() as any;
  }

  if (!installation) {
    return NextResponse.json({ error: 'Installation site ID not recognized' }, { status: 404 });
  }

  // Domain allowlist check
  const allowed = (installation.allowed_domains || '').split(',').map((d: string) => d.trim().toLowerCase());
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';

  if (origin && !allowed.includes('*')) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      const isAllowed = allowed.some((d: string) => d === originHost || originHost.endsWith(`.${d}`));
      if (!isAllowed && originHost !== 'localhost' && originHost !== '127.0.0.1') {
        return NextResponse.json({ error: 'Origin domain not permitted for this widget installation' }, { status: 403 });
      }
    } catch {
      // Ignore parse failure on non-url headers in direct calls
    }
  }

  const widgetConfig = JSON.parse(installation.widget_config || '{}');

  return NextResponse.json({
    siteId: installation.site_id,
    tenantId: installation.tenant_id,
    name: installation.name,
    config: widgetConfig
  });
}
