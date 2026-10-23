import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@/lib/services/form';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const { tenantId = 'tenant_default_01', data = {} } = body;

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    const result = await FormService.submitForm({
      tenantId,
      formSlug: slug,
      data,
      ipAddress,
      userAgent
    });

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_default_01';

  const form = FormService.getFormBySlug(tenantId, slug);
  if (!form) {
    return NextResponse.json({ error: 'Form not found or inactive.' }, { status: 404 });
  }

  return NextResponse.json({ form });
}
