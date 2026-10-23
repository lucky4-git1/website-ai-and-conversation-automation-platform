import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logs = AuditService.getLogs(tenantId, limit);

  return NextResponse.json({
    logs: (logs as any[]).map((log) => ({
      ...log,
      details: JSON.parse(log.details_json || '{}')
    }))
  });
}
