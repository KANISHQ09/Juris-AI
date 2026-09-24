# Security Policy for Juris AI

**Juris AI** is a GenAI-powered legal intelligence platform committed to ensuring the highest levels of security, confidentiality, and integrity for legal documents, query metadata, and artificial intelligence pipelines.

---

## 1. Supported Versions

Security updates and critical patches are actively applied to the following versions:

| Version | Supported | Security Maintenance |
| :--- | :--- | :--- |
| `0.1.x` (current) | :white_check_mark: Yes | Active security patches and vulnerability triage |
| `< 0.1.0` | :x: No | Please upgrade to the latest release |

---

## 2. Reporting a Vulnerability

We take the security of legal data and artificial intelligence infrastructure seriously. If you discover a security vulnerability in Juris AI, please report it responsibly:

1. **Email:** Send details to `security@jurisai.example.com` or `gsreejith828@gmail.com`.
2. **Details to Include:**
   - Description of the vulnerability and attack vector
   - Step-by-step reproduction steps or proof-of-concept (PoC)
   - Affected components (Frontend, Backend, LangGraph agent, Vector store)
   - Potential impact on document confidentiality or service availability
3. **Response Timeline:**
   - **Initial Acknowledgement:** Within **24 hours**
   - **Triage & Assessment:** Within **48 hours**
   - **Patch Release & Advisory:** Within **7 business days** (depending on severity)

Please **do not** report security vulnerabilities via public GitHub issues.

---

## 3. Security Architecture & Guardrails

### 3.1 Document Privacy & Zero-Retention Architecture
- **In-Memory Processing:** Uploaded agreements (PDF, DOCX, TXT) are parsed in memory and never persisted permanently to unencrypted disk storage.
- **Content-Addressable Hashing:** Documents are referenced by their cryptographic SHA-256 digest solely for ephemeral memory caching and deduplication.
- **PII Redaction Safeguards:** Prompt templates instruct underlying LLMs to treat all client-identifying information as confidential and exclude personal identifiers from statutory query indexes.

### 3.2 File Upload Validation & Denial of Service Protection
- **Strict File Size Limits:** All file upload endpoints enforce a strict **10 MB ceiling** (`413 Payload Too Large` rejection) to prevent memory exhaustion and zip-bomb attacks.
- **MIME & Extension Whitelisting:** Only verified `.pdf`, `.docx`, and `.txt` MIME payloads are processed.
- **Path Traversal Sanitization:** Filenames are sanitized using secure basename extraction to prevent path traversal (`../`) attacks.

### 3.3 HTTP Security Headers
All API responses from the FastAPI backend enforce enterprise-grade security headers:
- `Content-Security-Policy`: Default-src 'self' and restricted script/connect directives.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-Frame-Options: DENY`: Prevents clickjacking and framing attacks.
- `Strict-Transport-Security`: Enforces TLS encryption for all client connections.
- `Referrer-Policy: strict-origin-when-cross-origin`.

### 3.4 Rate Limiting & Abuse Prevention
- In-memory sliding window rate limiters protect LLM inference routes from automated brute-force attacks and denial-of-wallet exploitation.

### 3.5 Automated Pipeline Scanning
- **Secret Scanning:** Integrated `Gitleaks` action scans every commit and pull request to ensure zero API keys or credentials are leaked.
- **Static Analysis:** CodeQL and Ruff AST scanners evaluate code on every CI push.
