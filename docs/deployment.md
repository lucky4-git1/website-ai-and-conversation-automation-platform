# Deployment and Operational Runbook

## 1. Environment Configuration

Copy `.env.example` to `.env` and configure appropriate variables:

```bash
# Server & App Environment
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Database
DATABASE_URL=file:./data/production.db

# Master Admin / Security Keys
APP_SECRET=replace-with-a-secure-32-byte-secret-hex
ENCRYPTION_KEY=replace-with-a-secure-32-byte-hex-key

# AI Provider Configuration (Optional for Cloud LLM, falls back gracefully to Grounded Local Engine)
AI_PROVIDER=grounded_local # options: grounded_local, openai, anthropic
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# WhatsApp Cloud API (Required for live WhatsApp channel)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=

# CRM Integration (Required for live HubSpot sync)
HUBSPOT_ACCESS_TOKEN=
CRM_WEBHOOK_URL=
```

---

## 2. Local Setup and Build Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the platform.

3. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

4. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

## 3. Background Job & Worker Lifecycle

The platform includes an in-process, durable workflow runner for scheduled follow-ups, CRM retries, and quiet-hours evaluation. In production containerized deployments, background processing runs safely alongside Next.js route handlers with database-backed lock leases.

---

## 4. Health Checks and Monitoring

- Health Probe: `GET /api/v1/health`
- Metrics & Telemetry: `GET /api/v1/analytics/overview`
- Database Backup: Perform online hot backups using SQLite VACUUM INTO or file copy of WAL database.
