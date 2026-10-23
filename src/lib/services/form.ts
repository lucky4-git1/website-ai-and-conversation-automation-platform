import { getDb } from '@/lib/db';
import crypto from 'node:crypto';
import { LeadService } from './lead';
import { WorkflowEngine } from './workflow';
import { AnalyticsService } from './analytics';

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface SubmitFormData {
  tenantId: string;
  formSlug: string;
  data: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class FormService {
  /**
   * Retrieves an active form by slug
   */
  static getFormBySlug(tenantId: string, slug: string) {
    const db = getDb();
    const row = db.prepare(`
      SELECT * FROM forms
      WHERE tenant_id = ? AND slug = ? AND is_active = 1
    `).get(tenantId, slug) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      fields: JSON.parse(row.fields_json || '[]') as FormFieldDefinition[],
      settings: JSON.parse(row.settings_json || '{}')
    };
  }

  /**
   * Submits a form with strict server-side validation, lead creation, and workflow triggers
   */
  static async submitForm(params: SubmitFormData): Promise<{ success: boolean; submissionId?: string; leadId?: string; errors?: Record<string, string>; message?: string }> {
    const form = this.getFormBySlug(params.tenantId, params.formSlug);
    if (!form) {
      return { success: false, errors: { form: 'Form not found or inactive.' } };
    }

    // 1. Server-side validation
    const errors: Record<string, string> = {};
    for (const field of form.fields) {
      const val = params.data[field.id];

      if (field.required) {
        if (field.type === 'checkbox' && !val) {
          errors[field.id] = `${field.label} must be accepted.`;
        } else if (!val || String(val).trim() === '') {
          errors[field.id] = `${field.label} is required.`;
        }
      }

      if (val && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val))) {
          errors[field.id] = 'Please provide a valid email address.';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // 2. Extract normalized lead data from form fields
    let leadEmail: string | undefined;
    let leadName: string | undefined;
    let leadPhone: string | undefined;
    let leadCompany: string | undefined;
    let serviceInterest: string | undefined;
    let budgetRange: string | undefined;
    let timeline: string | undefined;
    let consentGiven = false;

    for (const field of form.fields) {
      const val = params.data[field.id];
      if (field.type === 'email') leadEmail = String(val);
      if (field.type === 'tel') leadPhone = String(val);
      if (field.id.includes('name')) leadName = String(val);
      if (field.id.includes('company')) leadCompany = String(val);
      if (field.id.includes('tier') || field.id.includes('service')) serviceInterest = String(val);
      if (field.id.includes('budget')) budgetRange = String(val);
      if (field.id.includes('timeline')) timeline = String(val);
      if (field.type === 'checkbox' && field.id.includes('consent')) consentGiven = Boolean(val);
    }

    // 3. Persist Lead via LeadService
    const leadCapture = LeadService.captureLead({
      tenantId: params.tenantId,
      name: leadName || 'Form Respondent',
      email: leadEmail,
      phone: leadPhone,
      company: leadCompany,
      serviceInterest,
      budgetRange,
      timeline,
      intentSignal: 'QUOTE_REQUEST',
      consentGiven
    });

    // 4. Record submission in form_submissions table
    const db = getDb();
    const submissionId = `sub_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO form_submissions (id, form_id, tenant_id, lead_id, data_json, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      submissionId,
      form.id,
      params.tenantId,
      leadCapture.leadId,
      JSON.stringify(params.data),
      params.ipAddress || null,
      params.userAgent || null,
      now
    );

    // 5. Trigger Workflow Engine
    WorkflowEngine.triggerWorkflows(params.tenantId, 'LEAD_CAPTURED', {
      leadId: leadCapture.leadId,
      score: leadCapture.score
    });

    // 6. Analytics event
    AnalyticsService.recordEvent({
      tenantId: params.tenantId,
      eventType: 'form_submitted',
      leadId: leadCapture.leadId,
      metadata: { formSlug: params.formSlug, score: leadCapture.score }
    });

    return {
      success: true,
      submissionId,
      leadId: leadCapture.leadId,
      message: form.settings.successMessage || 'Submission received successfully.'
    };
  }
}
