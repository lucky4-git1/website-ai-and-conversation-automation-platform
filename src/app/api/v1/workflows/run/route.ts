import { NextRequest, NextResponse } from 'next/server';
import { WorkflowEngine } from '@/lib/services/workflow';
import { CRMIntegrationService } from '@/lib/services/integrations/crm';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant_default_01';

    // 1. Process pending workflow executions
    const workflowResults = await WorkflowEngine.runPendingExecutions(tenantId);

    // 2. Process pending CRM sync queue
    const crmResults = await CRMIntegrationService.processSyncQueue(tenantId);

    return NextResponse.json({
      success: true,
      processedWorkflows: workflowResults.length,
      workflowResults,
      processedCrmSyncs: crmResults.length,
      crmResults
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
