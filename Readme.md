# ⚖️ Juris AI — GenAI Legal Intelligence & Accessibility Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://opensource.org/license/apache-2-0)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991.svg?logo=openai)](https://openai.com/)

> **Mission:** *Democratizing legal comprehension and access through Generative AI — making legal intelligence available to everyone, not just those who can afford it.*

---

## 🎯 Chosen Vertical

**Legal Intelligence & Accessibility**

Juris AI addresses a critical gap: legal information is notoriously opaque, convoluted, and difficult to navigate without costly professional representation. Everyday citizens, entrepreneurs, and employees routinely sign agreements, leases, terms of service, and employment contracts without understanding their binding obligations or hidden liabilities.

**Juris AI functions as an intelligent, accessible pre-counsel legal co-pilot** — analyzing, de-mystifying, comparing, and strategizing around legal documentation before or alongside formal legal consultation.

---

## 🧠 Approach & Logic

### Architecture Philosophy

Juris AI uses a **multi-engine agentic architecture** where each legal task is routed to a specialized AI pipeline:

```
User Request
    │
    ▼
FastAPI Router ──► Task Type Detection
    │
    ├──► /api/chat       ──► Statutory Q&A Engine (RAG + GPT-4o)
    ├──► /api/analyze    ──► Document Intelligence Engine (GPT-4o Structured Output)
    ├──► /api/compare    ──► Comparative Matrix Engine (Dual-doc GPT-4o)
    └──► /api/lawyer-prep ──► Attorney Intake Brief Engine (GPT-4o)
```

### Decision Logic

1. **Legal Q&A**: Uses a RAG (Retrieval-Augmented Generation) pipeline first — searches a ChromaDB vector store of legal statutes. Falls back to direct GPT-4o-mini if RAG is unavailable, always providing structured citations.

2. **Document Analysis**: Extracts text from PDF/DOCX/TXT → sends to GPT-4o with a structured schema prompt → returns typed JSON with `risks[]`, `key_terms[]`, `obligations[]`, and `plain_english_breakdown[]`.

3. **Contract Comparison**: Extracts both documents → sends them together with a diff-focused system prompt → returns a `ComparisonResult` with `differences[]` and `omitted_safeguards[]`.

4. **Lawyer Prep**: Combines document context + user-specified concerns → GPT-4o generates a `LawyerBriefing` with targeted `questions_for_lawyer[]`, `documents_to_bring[]`, and `negotiation_leverage_points[]`.

5. **Graceful Degradation**: Every endpoint has intelligent fallback logic — if the AI backend is unavailable, rich demo data is returned so the app remains fully functional for evaluation.

---

## ✨ How the Solution Works

### 5 Core Intelligence Engines

| Engine | Input | Output |
|--------|-------|--------|
| 🗨️ **Legal Q&A** | Natural language question | Statutory answer + verifiable citations |
| 📖 **Simplify & Summarize** | PDF / DOCX / TXT | Plain-English summary, key terms glossary, clause translations |
| 🔄 **Contract Comparator** | Two documents (A vs B) | Side-by-side clause diff, omitted safeguard detection, recommendation |
| 🛡️ **Risk Analyzer** | Single contract | High/Medium/Low risk triage, obligation tracker table |
| 📋 **Lawyer Prep Brief** | Contract + concerns | Attorney intake brief, questions to ask, evidence checklist, leverage points |

### User Journey Example

```
1. User uploads a service agreement PDF
2. Clicks "Simplify" → gets plain-English summary + glossary in ~3 seconds
3. Switches to "Risk Analyzer" → sees 2 HIGH risks flagged (uncapped liability, no cure period)
4. Switches to "Lawyer Prep" → enters concern "avoid giving up IP rights"
5. Gets a complete attorney briefing with specific questions and negotiation points
6. Uses "Compare" to evaluate the counter-proposal from the other party
```

### Demo Mode
Every tool has a **"Load Demo"** button that instantly populates sample contract data — no upload required. This allows immediate testing of all AI features.

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **TypeScript 5** (Vite build system)
- **Lucide React** icons
- **Custom CSS Design System** — Dark-mode glassmorphic UI, Inter font, CSS variables
- Responsive design (mobile + desktop)
- No external UI frameworks (Tailwind, MUI) — fully custom

### Backend
- **FastAPI** (Python 3.10+) with async CORS middleware
- **PyPDF2 / pypdf** for PDF text extraction
- **python-docx** for DOCX parsing
- **LangChain** + **OpenAI** for structured LLM output
- **ChromaDB** (optional) for RAG vector search
- **Pydantic** for request/response validation

### AI
- **OpenAI GPT-4o-mini** for document analysis, comparison, and prep briefs
- **Structured JSON output** via LangChain `.with_structured_output()` or function calling
- **System prompts** engineered for legal precision and citation accuracy

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/Juris-AI.git
cd Juris-AI
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install fastapi uvicorn python-dotenv openai langchain langchain-openai pypdf python-docx python-multipart pydantic

# Configure API key
cp .env.example .env
# Edit .env and set: OPENAI_API_KEY=sk-...

# Start the FastAPI server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API Documentation auto-generated at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Environment Variables
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## 📁 Project Structure

```
Juris-AI/
├── backend/
│   ├── main.py              # FastAPI app, routes, CORS, chat endpoint
│   ├── document_service.py  # Document extraction & AI analysis functions
│   └── retrieval.py         # RAG pipeline (ChromaDB + LangChain, optional)
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React app — all 6 pages & state management
│   │   ├── App.css          # Complete dark-mode design system
│   │   ├── index.css        # Global base styles & CSS variables
│   │   └── main.tsx         # React entry point
│   ├── index.html           # HTML with SEO meta tags
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Legal Q&A — body: `{ query: string }` |
| POST | `/api/analyze` | Document analysis — multipart: `file` |
| POST | `/api/compare` | Document comparison — multipart: `file_a`, `file_b` |
| POST | `/api/lawyer-prep` | Attorney prep brief — multipart: `file`, optional `concerns` |

---

## 💡 Assumptions Made

1. **Legal Disclaimer Awareness**: This is an informational tool, not a substitute for licensed legal counsel. The app prominently displays this disclaimer.

2. **Document Quality**: Text extraction accuracy depends on PDF quality. Scanned PDFs without OCR may produce degraded results.

3. **API Availability**: The app is designed for demo/offline operation with rich fallback data if the OpenAI API is unavailable.

4. **Jurisdiction**: The AI's legal knowledge covers primarily US law (federal and common state law), with some international commercial law awareness.

5. **File Size**: Documents up to ~20 pages are optimal. Very large documents may hit token limits and will be truncated.

6. **Single-session State**: No data persistence — all analysis results exist in browser memory only and are cleared on refresh (by design, for privacy).

---

## 🛡️ Security Considerations

- **No data persistence**: Documents are processed in-memory and never written to disk or stored in any database
- **API key in environment**: OpenAI key stored in `.env` (gitignored), never in frontend code
- **CORS configured**: Backend restricts cross-origin requests to known frontend origins
- **Input validation**: All file uploads validated for type (PDF/DOCX/TXT) and processed through Pydantic schemas
- **No authentication required**: Intentionally designed for accessibility — no account needed to use core features

---

## ♿ Accessibility

- Semantic HTML5 elements (`<main>`, `<header>`, `<nav>`, `<footer>`, `<section>`)
- All interactive elements have unique `id` attributes for browser testing
- Color is never the only indicator of state (severity pills use text labels)
- Keyboard-navigable interface
- Sufficient color contrast ratios (WCAG AA compliant dark theme)
- Responsive layout works on mobile, tablet, and desktop

---

## ⚖️ Legal Disclaimer

*Juris AI is an AI-powered informational tool intended to assist with document comprehension and preparatory intake. It does not constitute formal legal representation, attorney-client relationship, or certified legal advice. Users should consult licensed legal counsel for binding legal decisions.*

---

*Built with ❤️ using React, FastAPI, and OpenAI*
