import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';

  const metrics = AnalyticsService.getMetrics(tenantId);

  return NextResponse.json({
    tenantId,
    metrics,
    generatedAt: new Date().toISOString()
  });
}
