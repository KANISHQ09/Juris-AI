# Contributing to Juris AI

Thanks for your interest in contributing to **Juris AI** — a GenAI-powered legal intelligence platform! This document covers how to get set up, contribution expectations, and how the review process works.

---

## Getting Started

```bash
git clone https://github.com/KANISHQ09/Juris-AI.git
cd Juris-AI
```

### Backend Setup

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your OpenAI API key. **Never commit `.env`** — it's gitignored.

```bash
cp .env.example .env
# Edit .env and set: OPENAI_API_KEY=sk-...
```

Start the backend:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:8000`.

---

## Running Tests

```bash
pytest tests/ -v
```

All PRs must pass CI (tests + lint) before merge. Please run tests locally before opening a PR.

---

## Before You Open a PR

- **Check open issues first.** If you're planning a non-trivial change, open or comment on an issue describing what you want to do before writing code. This avoids duplicated work.
- **Keep PRs focused.** One logical change per PR. If your change touches multiple unrelated things, split it up.
- **Know what's in scope.** Check the issues list for active priorities. If your PR doesn't map to an open issue or discussion, expect it to take longer to review or be asked to open one first.

---

## PR Expectations

Every PR should include:

- **What it does** — a clear description of the change
- **What it doesn't do** — explicit non-goals, especially if it's part of a larger staged effort
- **Test plan** — what you tested, how, and any results (screenshots, eval numbers, etc. where relevant)
- **Related issues** — link with `Related to #N` or `Closes #N`

Use the PR template — it'll pre-fill these sections for you.

---

## Scope Guidelines

- Changes to core AI pipelines (`backend/document_service.py`, `backend/main.py`, `backend/retrieval.py`) receive closer scrutiny than eval-only, docs-only, or test-only additions. Clearly explain in your PR why you touched these files.
- Frontend changes to `App.tsx` or `App.css` should maintain the existing dark glassmorphic design system — don't introduce external CSS frameworks without discussion.
- New Python dependencies must be justified in the PR description — we keep the dependency footprint intentionally lean.
- **No API keys, credentials, or secrets in any commit**, including test fixtures or example configs. Use placeholders like `sk-your-key-here`.

### Key Files

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI routes — all 5 AI endpoints |
| `backend/document_service.py` | GPT-4o document analysis, comparison, lawyer prep |
| `backend/retrieval.py` | RAG pipeline — ChromaDB + LangChain |
| `frontend/src/App.tsx` | Main React app — all 6 pages |
| `frontend/src/App.css` | Design system — modify with care |
| `tests/` | Evaluation and retrieval tests |

---

## Review Process

- We aim to give an initial response within a few days. If it's been longer, a polite nudge on the PR is fine.
- CI must pass (tests, lint, secret scan) before we'll merge.
- At least one maintainer approval is required.
- We default to **squash-merge** to keep `main` history clean — make sure each commit message is informative.

---

## Code Style

### Python

We use `ruff` for linting and formatting:

```bash
ruff check .
ruff format .
```

### TypeScript / React

We use the project's built-in ESLint config:

```bash
cd frontend
npm run lint
```

Follow existing patterns in `App.tsx` — typed interfaces for all data, no `any`, async/await over `.then()`.

---

## Contribution Ideas

Looking for a place to start? Here are some good first areas:

- **New AI engine** — Add a new legal tool (e.g., jurisdiction detector, clause explainer)
- **Improved prompts** — Better system prompts for more accurate structured output from GPT-4o
- **Expanded tests** — More golden Q&A pairs in `eval/golden_qa.json`
- **Accessibility** — Improve keyboard navigation, ARIA labels, or screen reader support
- **Mobile UX** — Enhance responsive layout for smaller screens

---

## Legal Notice

By contributing to Juris AI, you agree that your contributions will be licensed under the [Apache 2.0 License](LICENSE.md).

---

## Questions?

Open a [GitHub Discussion](https://github.com/KANISHQ09/Juris-AI/discussions) or comment on the relevant issue. Thanks for contributing! ⚖️
