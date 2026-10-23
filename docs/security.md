# Security Architecture and Threat Mitigation

## 1. Threat Modeling and Controls

| Threat Vector | Potential Impact | Implemented Mitigation |
| :--- | :--- | :--- |
| **Cross-Tenant Data Leakage** | Tenant A accesses Tenant B's leads, chats, or knowledge | Explicit `tenant_id` scoping in every SQL query and service method; session validation middleware. |
| **Server-Side Request Forgery (SSRF)** | Attacker inputs `http://169.254.169.254/` in Knowledge URL crawler | Strict URL validation rejecting private IPs (RFC 1918, RFC 3927, loopback 127.0.0.1, IPv6 `::1`, and link-local). |
| **Prompt Injection & System Jailbreak** | Visitor crafts prompt to reveal system prompts, competitor comparisons, or false pricing | Strict context framing, input sanitizer stripping instruction delimiters, and deterministic grounding. |
| **Cross-Site Scripting (XSS)** | Malicious chat message or form input executes JavaScript in admin dashboard | React virtual DOM auto-escaping + HTML sanitization on any rich text and links (`rel="noopener noreferrer"`). |
| **Widget Abuse & Denial of Service** | Bot floods chat widget creating thousands of sessions | Token bucket IP rate limiting, message length capping, and origin domain verification. |
| **Secret & Credential Exposure** | WhatsApp tokens, HubSpot API keys leaked to browser | Secrets stored exclusively in server environment / encrypted storage; never exposed in public widget APIs. |
| **Webhook Spoofing & Replay** | Attacker posts fake WhatsApp deliveries | Cryptographic HMAC SHA256 signature verification and message ID deduplication table. |
| **Insecure Direct Object Reference (IDOR)** | Visitor accesses another conversation by incrementing ID | UUIDv4 identifiers for public session tokens; validation of ownership. |

---

## 2. Ingestion Defense & SSRF Protection

All knowledge ingestion URLs pass through the SSRF Validator:
1. Protocol must be `http:` or `https:`.
2. Hostname must resolve to a valid public IP address.
3. Private IP ranges are blocked:
   - `10.0.0.0/8`
   - `172.16.0.0/12`
   - `192.168.0.0/16`
   - `127.0.0.0/8`
   - `169.254.0.0/16` (Cloud Metadata endpoints)
   - `::1` and IPv6 site-local / link-local addresses.
4. Response body size is capped (max 2MB per document).

---

## 3. Privacy, Consent & Data Governance

1. **Explicit Purpose Specification**: Consent records store specific channel and purpose (`MARKETING`, `SERVICE_FOLLOWUP`, `SUPPORT`).
2. **Immediate Revocation**: When opt-out is received, active queued marketing jobs are terminated immediately.
3. **Data Redaction**: Sensitive authorization headers and passwords are sanitized from application logs.
4. **Audit Logging**: Immutable audit logs record all administrative actions, data exports, source modifications, and configuration changes.
