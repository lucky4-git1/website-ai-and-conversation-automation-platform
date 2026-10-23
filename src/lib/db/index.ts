import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'platform.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode and foreign keys for high performance and integrity
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Read and apply schema
  const schemaPath = path.resolve(process.cwd(), 'src/lib/db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Check and seed default baseline tenant if not present
  seedInitialData(db);

  dbInstance = db;
  return dbInstance;
}

function seedInitialData(db: DatabaseSync) {
  const checkTenant = db.prepare('SELECT id FROM tenants WHERE id = ?');
  const existing = checkTenant.get('tenant_default_01');

  if (!existing) {
    const now = new Date().toISOString();
    // 1. Default Tenant
    db.prepare(`
      INSERT INTO tenants (id, name, slug, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('tenant_default_01', 'Apex Enterprise Solutions', 'apex-solutions', now, now);

    // 2. Default User / Admin
    db.prepare(`
      INSERT INTO users (id, tenant_id, name, email, role, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('user_admin_01', 'tenant_default_01', 'Alex Mercer (Lead Solutions Architect)', 'alex.mercer@apexsolutions.example.com', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80', now);

    // 3. Default Installation
    const defaultWidgetConfig = JSON.stringify({
      primaryColor: '#0284c7', // Sky 600
      title: 'Apex AI Concierge',
      welcomeMessage: 'Hi there! 👋 Welcome to Apex Enterprise Solutions. How can I help you accelerate your business operations today?',
      suggestedQuestions: [
        'What enterprise AI services do you offer?',
        'Can I get pricing for CRM integration?',
        'How does live-chat handoff work?',
        'Speak to a human consultant'
      ],
      requireEmailForHandoff: true,
      botAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&q=80',
      position: 'bottom-right'
    });

    db.prepare(`
      INSERT INTO installations (id, tenant_id, site_id, name, allowed_domains, widget_config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('inst_01', 'tenant_default_01', 'site_apex_live_01', 'Apex Main Web Portal', 'localhost,127.0.0.1,example.com', defaultWidgetConfig, now, now);

    // 4. Seed Verified Knowledge Base
    const sources = [
      {
        id: 'kb_01',
        title: 'Apex Enterprise Services & Capabilities Overview',
        type: 'TEXT',
        content: `Apex Enterprise Solutions delivers 3 flagship enterprise service tiers:
1. Conversational AI & Omnichannel Automation: Custom RAG-based AI assistants grounded in your business catalog and docs, with real-time live human handoff, sub-second latency, and WhatsApp Business API integration.
2. CRM & Pipeline Synchronization: Bi-directional synchronization between website conversions, HubSpot CRM, and custom webhooks with automated lead scoring and retry queues.
3. Conversion Journey & Workflow Engine: Interactive multi-step lead qualification, dynamic smart forms, and consent-aware automated follow-up sequences observing strict quiet hours.`,
        chunks: [
          'Apex Enterprise Solutions delivers 3 flagship enterprise service tiers: Conversational AI & Omnichannel Automation, CRM & Pipeline Synchronization, and Conversion Journey & Workflow Engine.',
          'Conversational AI & Omnichannel Automation features custom RAG-based AI assistants grounded in business catalogs and docs, with real-time live human handoff and WhatsApp Business API integration.',
          'CRM & Pipeline Synchronization provides bi-directional sync with HubSpot CRM and custom webhooks with automated lead scoring and retry queues.'
        ]
      },
      {
        id: 'kb_02',
        title: 'Apex Transparent Pricing & Service Tiers',
        type: 'FAQ',
        content: `Q: What are your pricing plans?
A: Apex offers 3 transparent investment plans:
- Growth Plan: $499/month. Includes up to 5,000 monthly conversations, custom AI knowledge grounding, embeddable website widget, and standard email follow-up workflows.
- Professional Plan: $1,299/month. Includes up to 25,000 monthly conversations, WhatsApp Business Cloud API integration, real-time live agent handoff inbox, and HubSpot CRM bi-directional sync.
- Enterprise Custom: Starting from $2,999/month. Unlimited conversations, dedicated SLA, custom ERP integrations, multi-tenant isolation, on-premise deployment options, and bespoke AI tuning.

Q: Are there any hidden setup fees?
A: No. Growth and Professional tiers have zero setup fees. Enterprise implementations have a one-time onboarding and custom integration fee of $1,500.

Q: What is your refund or cancellation policy?
A: We provide a 30-day money-back satisfaction guarantee on all monthly plans. You can cancel at any time with 1-click in the billing settings.`,
        chunks: [
          'Apex offers 3 pricing plans: Growth Plan at $499/month (5k conversations, custom AI grounding, website widget), Professional Plan at $1,299/month (25k conversations, WhatsApp Business API, live agent handoff, HubSpot sync), and Enterprise Custom starting from $2,999/month.',
          'Zero setup fees on Growth and Professional tiers. Enterprise onboarding has a one-time integration fee of $1,500. 30-day money-back satisfaction guarantee on all monthly plans.'
        ]
      },
      {
        id: 'kb_03',
        title: 'Business Hours, SLA & Support Protocols',
        type: 'FAQ',
        content: `Q: What are your live agent business hours?
A: Live human operators are available Monday through Friday from 8:00 AM to 8:00 PM EST. During off-hours, the AI Assistant remains fully active 24/7 to answer grounded inquiries and collect qualified leads for priority morning follow-up.

Q: How does human handoff work?
A: At any point during a conversation, visitors can click 'Speak to a human' or type 'human agent'. If operators are online, the chat transitions to HUMAN_ACTIVE within 60 seconds. If offline, the visitor is offered a priority callback form.`,
        chunks: [
          'Live human operators are available Monday through Friday from 8:00 AM to 8:00 PM EST. During off-hours, the AI Assistant operates 24/7 to answer inquiries and schedule follow-ups.',
          'Visitors can request a human agent at any time. When operators are online, handoff occurs within 60 seconds. When offline, a priority callback form is provided.'
        ]
      }
    ];

    for (const src of sources) {
      db.prepare(`
        INSERT INTO knowledge_sources (id, tenant_id, type, title, content, status, chunk_count, is_published, last_indexed_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'INDEXED', ?, 1, ?, ?, ?)
      `).run(src.id, 'tenant_default_01', src.type, src.title, src.content, src.chunks.length, now, now, now);

      for (let i = 0; i < src.chunks.length; i++) {
        db.prepare(`
          INSERT INTO knowledge_chunks (id, source_id, tenant_id, chunk_text, token_count, keywords, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(`${src.id}_chunk_${i}`, src.id, 'tenant_default_01', src.chunks[i], src.chunks[i].split(' ').length, src.title.toLowerCase(), now);
      }
    }

    // 5. Seed Product & Service Catalog
    const catalog = [
      {
        id: 'prod_01',
        name: 'Growth Conversational AI Package',
        category: 'Conversational AI',
        price: 499.0,
        price_display: '$499 / month',
        description: 'Complete website conversion assistant with approved FAQ grounding, embeddable widget, and automated lead capture.',
        features: JSON.stringify(['Up to 5,000 monthly conversations', 'Strict zero-hallucination FAQ answering', 'Customizable widget styling', 'Email notifications for leads']),
        tags: JSON.stringify(['starter', 'smb', 'lead-capture']),
        availability: 'IN_STOCK',
        action_url: '/demo#growth'
      },
      {
        id: 'prod_02',
        name: 'Professional Omnichannel & CRM Suite',
        category: 'Omnichannel & CRM',
        price: 1299.0,
        price_display: '$1,299 / month',
        description: 'Advanced conversion system with WhatsApp Cloud API, Live Agent Handoff inbox, and HubSpot CRM bi-directional synchronization.',
        features: JSON.stringify(['Up to 25,000 monthly conversations', 'Official WhatsApp Business Cloud API', 'Live agent queue & real-time messaging', 'Bi-directional HubSpot synchronization', 'Consent-aware automated follow-up workflows']),
        tags: JSON.stringify(['popular', 'crm', 'whatsapp', 'live-chat']),
        availability: 'IN_STOCK',
        action_url: '/demo#pro'
      },
      {
        id: 'prod_03',
        name: 'Enterprise Bespoke Automation Infrastructure',
        category: 'Enterprise Solutions',
        price: 2999.0,
        price_display: 'Starting at $2,999 / month',
        description: 'Custom AI models, dedicated SLA, on-premise database support, and bespoke ERP integrations.',
        features: JSON.stringify(['Unlimited conversations', 'Custom LLM fine-tuning & domain embeddings', 'Dedicated Solutions Architect', '99.99% Uptime SLA', 'SOC2 and HIPAA compliance assistance']),
        tags: JSON.stringify(['enterprise', 'custom', 'sla']),
        availability: 'ON_DEMAND',
        action_url: '/demo#enterprise'
      }
    ];

    for (const item of catalog) {
      db.prepare(`
        INSERT INTO catalog_items (id, tenant_id, name, category, price, price_display, description, features, tags, availability, action_url, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(item.id, 'tenant_default_01', item.name, item.category, item.price, item.price_display, item.description, item.features, item.tags, item.availability, item.action_url, now, now);
    }

    // 6. Seed Default Forms
    const quoteFormFields = JSON.stringify([
      { id: 'f_name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Sarah Connor' },
      { id: 'f_email', label: 'Work Email', type: 'email', required: true, placeholder: 'sarah@cyberdyne.example.com' },
      { id: 'f_phone', label: 'Phone Number', type: 'tel', required: false, placeholder: '+1 (555) 019-2834' },
      { id: 'f_company', label: 'Company Name', type: 'text', required: true, placeholder: 'Cyberdyne Systems' },
      { id: 'f_tier', label: 'Interested Plan', type: 'select', required: true, options: ['Growth ($499/mo)', 'Professional ($1,299/mo)', 'Enterprise (Custom)'] },
      { id: 'f_timeline', label: 'Target Launch Timeline', type: 'select', required: true, options: ['Immediate (Within 2 weeks)', 'This Quarter (1-3 months)', 'Exploring / Planning'] },
      { id: 'f_consent', label: 'I agree to receive communications regarding this quotation in accordance with the Privacy Policy.', type: 'checkbox', required: true }
    ]);

    db.prepare(`
      INSERT INTO forms (id, tenant_id, name, slug, description, fields_json, settings_json, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run('form_quote_01', 'tenant_default_01', 'Enterprise Quotation Request', 'enterprise-quote', 'Official quotation request form for high-intent visitors.', quoteFormFields, JSON.stringify({ successMessage: 'Thank you! Your quotation request has been routed to our enterprise team.', redirectUrl: '' }), now, now);

    // 7. Seed Default Workflows
    const leadFollowupWorkflow = {
      id: 'wf_01',
      name: 'High-Intent Lead Immediate Confirmation & CRM Sync',
      description: 'Triggers when a lead scores 60+ or submits a quotation request. Enforces consent, queues CRM sync, and sends instant email confirmation.',
      trigger_event: 'LEAD_CAPTURED',
      conditions_json: JSON.stringify({ minScore: 40 }),
      actions_json: JSON.stringify([
        { step: 1, action: 'QUEUE_CRM_SYNC', provider: 'HUBSPOT' },
        { step: 2, action: 'SEND_CONFIRMATION_EMAIL', template: 'quote_received_v1' },
        { step: 3, action: 'NOTIFY_TEAM_SLACK_OR_EMAIL', channel: 'sales-alerts' }
      ]),
      quiet_hours_json: JSON.stringify({ enabled: true, start: '22:00', end: '07:30', timezone: 'America/New_York' })
    };

    db.prepare(`
      INSERT INTO workflows (id, tenant_id, name, description, trigger_event, conditions_json, actions_json, quiet_hours_json, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(leadFollowupWorkflow.id, 'tenant_default_01', leadFollowupWorkflow.name, leadFollowupWorkflow.description, leadFollowupWorkflow.trigger_event, leadFollowupWorkflow.conditions_json, leadFollowupWorkflow.actions_json, leadFollowupWorkflow.quiet_hours_json, now, now);

    // 8. Seed Integration Configurations (Honest Setup Required States)
    db.prepare(`
      INSERT INTO integration_configs (id, tenant_id, provider, status, config_json, is_verified, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run('int_wa_01', 'tenant_default_01', 'WHATSAPP', 'DISCONNECTED', JSON.stringify({
      phoneNumberId: '',
      wabaId: '',
      webhookVerifyToken: 'apex_secure_verify_token_2026',
      templates: ['lead_followup_utility_v1', 'appointment_reminder_v1']
    }), now);

    db.prepare(`
      INSERT INTO integration_configs (id, tenant_id, provider, status, config_json, is_verified, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run('int_hs_01', 'tenant_default_01', 'HUBSPOT', 'DISCONNECTED', JSON.stringify({
      portalId: '',
      connectedAccount: '',
      fieldMappings: {
        email: 'email',
        name: 'firstname',
        company: 'company',
        score: 'lead_score',
        serviceInterest: 'service_interest'
      }
    }), now);
  }
}
