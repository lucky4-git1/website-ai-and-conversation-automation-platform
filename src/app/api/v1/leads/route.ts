import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const qualification = searchParams.get('qualification');
  const query = searchParams.get('q');
  const db = getDb();

  let sql = `
    SELECT 
      id, name, email, phone, company, service_interest, budget_range, timeline,
      score, qualification_status, sync_status, external_crm_id, last_crm_sync_error,
      created_at, updated_at
    FROM leads
    WHERE tenant_id = ?
  `;
  const params: any[] = [tenantId];

  if (qualification && qualification !== 'ALL') {
    sql += ' AND qualification_status = ?';
    params.push(qualification);
  }

  if (query) {
    sql += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
    const term = `%${query}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY score DESC, created_at DESC LIMIT 50';

  const leads = db.prepare(sql).all(...params);

  return NextResponse.json({
    leads
  });
}
