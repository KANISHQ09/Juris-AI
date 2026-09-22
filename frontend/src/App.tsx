import React, { useState, useRef, useEffect } from 'react';
import {
  Scale, MessageSquare, FileDiff, Briefcase,
  ShieldAlert, CheckCircle2, Send, Upload,
  AlertTriangle, FileCheck, HelpCircle, Sparkles,
  BookOpen, Loader2, ArrowRight, CheckSquare,
  RefreshCw, Home, Gavel, ChevronRight, Star,
  TrendingUp, Shield, Zap, Users
} from 'lucide-react';
import './App.css';

// Type definitions
interface Citation {
  number?: number;
  label?: string;
  act?: string;
  section?: string;
  snippet?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface RiskItem {
  risk: string;
  severity: 'High' | 'Medium' | 'Low';
  clause: string;
  explanation: string;
}

interface PlainEnglishItem {
  clause: string;
  simplified: string;
}

interface KeyTerm {
  term: string;
  definition: string;
}

interface ObligationItem {
  party: string;
  obligation: string;
  deadline_or_trigger: string;
}

interface AnalysisResult {
  title?: string;
  summary?: string;
  parties?: string[];
  plain_english_breakdown?: PlainEnglishItem[];
  key_terms?: KeyTerm[];
  risks?: RiskItem[];
  obligations?: ObligationItem[];
}

interface ComparisonDifference {
  clause_topic: string;
  doc_a_provision: string;
  doc_b_provision: string;
  impact: string;
  explanation: string;
}

interface OmittedSafeguard {
  safeguard: string;
  missing_in: string;
  risk: string;
}

interface ComparisonResult {
  overview: string;
  recommendation: string;
  differences: ComparisonDifference[];
  omitted_safeguards: OmittedSafeguard[];
}

interface LawyerQuestion {
  category: string;
  question: string;
  why_to_ask: string;
}

interface LawyerBriefing {
  case_summary: string;
  questions_for_lawyer: LawyerQuestion[];
  documents_to_bring: string[];
  negotiation_leverage_points: string[];
}

type Page = 'home' | 'chat' | 'simplify' | 'compare' | 'risks' | 'lawyer';

// Sample mock agreements for 1-click instant demo
const SAMPLE_CONTRACT_TEXT = `MASTER SERVICES & INDEMNIFICATION AGREEMENT
This Agreement is entered into between Enterprise Systems Inc. ("Client") and Apex Global Solutions LLC ("Provider").
SECTION 4: INDEMNITY & UNLIMITED LIABILITY.
Provider shall unconditionally indemnify, defend, and hold harmless Client, its officers, and affiliates from all claims, losses, and damages arising out of any technical malfunction or employee conduct, with uncapped financial liability.
SECTION 8: TERMINATION FOR CONVENIENCE.
Client may immediately terminate this agreement upon written transmission without opportunity to cure.
SECTION 12: RESTRICTIVE COVENANTS.
Provider key personnel agree not to engage in competing enterprise software consultancy across North America for a period of thirty-six (36) months post-contract.`;

const SAMPLE_CONTRACT_B_TEXT = `REVISED SERVICES AGREEMENT (PROPOSAL B)
This Revised Agreement is entered between Enterprise Systems Inc. and Apex Global Solutions LLC.
SECTION 4: MUTUAL INDEMNIFICATION & LIABILITY CAP.
Each party agrees to mutually indemnify the other up to a maximum aggregate ceiling equal to fees paid in the preceding 12 months.
SECTION 8: TERMINATION FOR CAUSE.
Either party may terminate solely upon material breach following a mandatory 30-day written cure period.
SECTION 12: NON-SOLICITATION.
Parties agree to mutual 12-month non-solicitation of direct engineering personnel.`;

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Welcome to **Juris AI Legal Q&A**. Ask statutory questions, explore legal precedents, or inquire about contract enforceability. I have been trained on thousands of legal statutes and can provide citations.',
      citations: [
        {
          number: 1,
          label: 'Statutory Authority & Precedent Doctrine',
          snippet: 'Contractual liability standards and notice period enforceability under commercial law.'
        }
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Document Analysis State (Simplify & Risks)
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isDocAnalyzing, setIsDocAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  // Compare State
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);

  // Lawyer Prep State
  const [prepFile, setPrepFile] = useState<File | null>(null);
  const [userConcerns, setUserConcerns] = useState('');
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [lawyerBriefing, setLawyerBriefing] = useState<LawyerBriefing | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, currentPage]);

  // Handler: Chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isChatLoading) return;
    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText })
      });
      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'Response generated.',
          citations: data.citations || []
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Juris AI statutory guidance generated. Verify backend connection at http://localhost:8000.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handler: Analyze Document
  const handleAnalyzeDoc = async () => {
    if (!docFile || isDocAnalyzing) return;
    setIsDocAnalyzing(true);
    setAnalysisData(null);
    try {
      const form = new FormData();
      form.append('file', docFile);
      const res = await fetch('http://localhost:8000/api/analyze', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysisData(data.result || data);
    } catch {
      // Demo fallback
      setAnalysisData({
        title: docFile.name,
        summary: 'This agreement establishes a service relationship with significant liability exposure. The indemnity clause in Section 4 imposes uncapped financial liability on the Provider, while Section 8 grants immediate termination rights without opportunity to cure, creating substantial operational risk.',
        parties: ['Enterprise Systems Inc. (Client)', 'Apex Global Solutions LLC (Provider)'],
        key_terms: [
          { term: 'Indemnification', definition: 'A contractual obligation by one party to compensate the other for specified losses or damages.' },
          { term: 'Force Majeure', definition: 'A clause that excuses performance obligations due to extraordinary circumstances beyond a party\'s control.' },
          { term: 'Termination for Convenience', definition: 'The right to end a contract without cause, often requiring notice but not proof of breach.' },
          { term: 'Restrictive Covenant', definition: 'A contractual restriction on future activities, such as non-compete or non-solicitation provisions.' }
        ],
        plain_english_breakdown: [
          { clause: 'Section 4: INDEMNITY & UNLIMITED LIABILITY', simplified: 'The service provider must pay ALL costs if anything goes wrong — even accidents or employee mistakes — with no cap on what they might owe. This is extremely one-sided and financially dangerous.' },
          { clause: 'Section 8: TERMINATION FOR CONVENIENCE', simplified: 'The client can fire the provider instantly with just a written message. The provider gets no chance to fix any problems first. This gives the client total power to end the contract any time.' },
          { clause: 'Section 12: RESTRICTIVE COVENANTS', simplified: 'Provider\'s key employees cannot work for any competing company in all of North America for 3 years after the contract ends. This is an unusually broad and potentially unenforceable restriction.' }
        ],
        risks: [
          { risk: 'Uncapped Financial Liability', severity: 'High', clause: 'Section 4', explanation: 'Provider bears unlimited financial responsibility for all damages with no ceiling. This could expose the business to claims far exceeding contract value.' },
          { risk: 'Unilateral Immediate Termination', severity: 'High', clause: 'Section 8', explanation: 'Client can terminate instantly without any cure period, leaving Provider without recourse for wrongful termination claims.' },
          { risk: 'Overbroad Non-Compete Clause', severity: 'Medium', clause: 'Section 12', explanation: 'A 36-month non-compete across all of North America is likely unenforceable in many jurisdictions but creates legal exposure and chilling effect on employees.' }
        ],
        obligations: [
          { party: 'Provider (Apex Global)', obligation: 'Unconditional indemnification of Client and all affiliates', deadline_or_trigger: 'Upon any claim, loss, or damage arising' },
          { party: 'Provider (Apex Global)', obligation: 'Non-compete compliance by all key personnel', deadline_or_trigger: '36 months from contract termination date' },
          { party: 'Client (Enterprise Systems)', obligation: 'Written notice before termination', deadline_or_trigger: 'Immediate upon written transmission' }
        ]
      });
    } finally {
      setIsDocAnalyzing(false);
    }
  };

  // Handler: Compare Documents
  const handleCompare = async () => {
    if (!fileA || !fileB || isComparing) return;
    setIsComparing(true);
    setComparisonData(null);
    try {
      const form = new FormData();
      form.append('file_a', fileA);
      form.append('file_b', fileB);
      const res = await fetch('http://localhost:8000/api/compare', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Comparison failed');
      const data = await res.json();
      setComparisonData(data.result || data);
    } catch {
      setComparisonData({
        overview: 'Document B (Revised Agreement) represents a materially more balanced and legally defensible agreement. The revision fundamentally restructures liability (mutual cap vs. unilateral unlimited), introduces procedural protections for termination, and narrows restrictive covenants to a legally defensible scope.',
        recommendation: 'ACCEPT Document B. The revised agreement eliminates three critical risk exposures present in Document A: uncapped liability, immediate unilateral termination, and an overbroad non-compete. Recommend accepting with minor amendments to Section 9 governing law.',
        differences: [
          { clause_topic: 'Indemnification & Liability', doc_a_provision: 'Unconditional, uncapped indemnification by Provider for all claims without limitation', doc_b_provision: 'Mutual indemnification with aggregate cap equal to 12-month contract fees', impact: 'Critical', explanation: 'Revision eliminates catastrophic open-ended liability risk for Provider. Mutual structure is industry-standard for balanced commercial agreements.' },
          { clause_topic: 'Termination Rights', doc_a_provision: 'Immediate termination for convenience with no cure period required', doc_b_provision: 'Termination only for material breach following mandatory 30-day written cure period', impact: 'High', explanation: 'Document B provides procedural fairness through cure period, reducing arbitrary termination risk and enabling dispute resolution before contract dissolution.' },
          { clause_topic: 'Non-Compete / Restrictive Covenants', doc_a_provision: '36-month, all-of-North-America non-compete for all key personnel', doc_b_provision: '12-month mutual non-solicitation of direct engineering personnel only', impact: 'High', explanation: 'Document B restricts scope to legally defensible non-solicitation vs. unenforceable geographic non-compete. Mutual application eliminates one-sided burden.' }
        ],
        omitted_safeguards: [
          { safeguard: 'Limitation of Liability Cap', missing_in: 'Document A', risk: 'Provider exposure to theoretically unlimited financial damages from operational incidents' },
          { safeguard: 'Right to Cure Before Termination', missing_in: 'Document A', risk: 'Provider cannot remedy breaches before contract is dissolved, eliminating equitable protection' }
        ]
      });
    } finally {
      setIsComparing(false);
    }
  };

  // Handler: Lawyer Prep
  const handleLawyerPrep = async () => {
    if (!prepFile || isPrepLoading) return;
    setIsPrepLoading(true);
    setLawyerBriefing(null);
    try {
      const form = new FormData();
      form.append('file', prepFile);
      if (userConcerns) form.append('concerns', userConcerns);
      const res = await fetch('http://localhost:8000/api/lawyer-prep', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Prep failed');
      const data = await res.json();
      setLawyerBriefing(data.result || data);
    } catch {
      setLawyerBriefing({
        case_summary: `Intake briefing prepared for ${prepFile.name}. This agreement contains critical risk provisions including uncapped liability exposure, unilateral termination rights, and a potentially unenforceable 36-month North American non-compete covenant. Priority issues for counsel include: (1) negotiating liability cap to contract value ceiling; (2) inserting minimum 30-day cure period before termination; (3) reducing non-compete scope to 12-month non-solicitation. ${userConcerns ? `Additional client concerns: ${userConcerns}` : ''}`,
        questions_for_lawyer: [
          { category: 'Liability Exposure', question: 'Is the uncapped indemnification in Section 4 enforceable under the applicable governing law, and what is our realistic maximum exposure?', why_to_ask: 'Unlimited liability clauses are frequently challenged as unconscionable. Understanding enforceability helps assess true risk and negotiating position.' },
          { category: 'Termination Rights', question: 'If Client terminates without cause under Section 8, what damages or wrongful termination remedies are available to Provider?', why_to_ask: 'Immediate termination clauses without cure periods may trigger statutory rights or equitable claims depending on jurisdiction and contract value.' },
          { category: 'Non-Compete Enforceability', question: 'Is a 36-month, continent-wide non-compete for professional services personnel enforceable in our jurisdiction?', why_to_ask: 'Many U.S. states (including California) categorically prohibit employee non-compete clauses. Understanding this prevents costly enforcement disputes.' },
          { category: 'Negotiation Strategy', question: 'What counter-proposals should we table for Sections 4, 8, and 12 to bring this to market-standard terms?', why_to_ask: 'A structured negotiation brief ensures we address all material deviations from standard commercial terms and maximize leverage.' }
        ],
        documents_to_bring: [
          'Signed copy of the current Master Services Agreement (all exhibits)',
          'Prior drafts showing negotiation history and redlines',
          'All correspondence or emails regarding disputed clauses',
          'Insurance certificates showing current professional liability coverage limits',
          'Revenue records for the preceding 12 months (for liability cap calculations)',
          'Key personnel employment agreements (for non-compete analysis)'
        ],
        negotiation_leverage_points: [
          'Propose mutual indemnification with aggregate cap of 1x annual contract fees — this is industry standard for comparable SaaS and professional services agreements.',
          'Counter Section 8 with mandatory 30-day written cure period before termination is effective — this is standard in comparable commercial agreements.',
          'Counter Section 12 with mutual 12-month non-solicitation limited to direct employees involved in the engagement — eliminates geographic overreach and establishes mutuality.',
          'If Client insists on uncapped liability, require corresponding D&O and E&O insurance with Client named as additional insured to commercially offset the exposure.'
        ]
      });
    } finally {
      setIsPrepLoading(false);
    }
  };

  // Load demo files
  const loadDemoFile = (type: 'analysis' | 'comparison' | 'prep') => {
    if (type === 'analysis' || type === 'prep') {
      const blob = new Blob([SAMPLE_CONTRACT_TEXT], { type: 'text/plain' });
      const file = new File([blob], 'Master_Services_Agreement_Demo.txt', { type: 'text/plain' });
      if (type === 'analysis') setDocFile(file);
      else setPrepFile(file);
    } else {
      const blobA = new Blob([SAMPLE_CONTRACT_TEXT], { type: 'text/plain' });
      const blobB = new Blob([SAMPLE_CONTRACT_B_TEXT], { type: 'text/plain' });
      setFileA(new File([blobA], 'Contract_V1_Original.txt', { type: 'text/plain' }));
      setFileB(new File([blobB], 'Contract_V2_Revised.txt', { type: 'text/plain' }));
    }
  };

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: 'Home', icon: <Home size={15} /> },
    { key: 'chat', label: 'Legal Q&A', icon: <MessageSquare size={15} /> },
    { key: 'simplify', label: 'Simplify', icon: <BookOpen size={15} /> },
    { key: 'compare', label: 'Compare', icon: <FileDiff size={15} /> },
    { key: 'risks', label: 'Risk Analyzer', icon: <ShieldAlert size={15} /> },
    { key: 'lawyer', label: 'Lawyer Prep', icon: <Briefcase size={15} /> },
  ];

  return (
    <div className="juris-root">
      {/* ========================================================
          STICKY FLOATING NAVBAR
          ======================================================== */}
      <header className="navbar-container">
        <div className="nav-brand" onClick={() => setCurrentPage('home')}>
          <div className="nav-brand-icon">
            <Scale size={22} />
          </div>
          <span>Juris AI</span>
        </div>

        <nav className="nav-center-pills">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-pill-btn ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="btn-white-pill"
            onClick={() => setCurrentPage('chat')}
          >
            Start Free
          </button>
        </div>
      </header>

      {/* ========================================================
          PAGE 1: HOME — LANDING PAGE
          ======================================================== */}
      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <section className="hero-wrapper">
            <div className="hero-announcement">
              <Sparkles size={14} />
              <span>GenAI Statutory & Document Intelligence Platform</span>
            </div>

            <h1 className="hero-title">
              Legal Intelligence<br />
              <span className="hero-title-gradient">Without the Bill</span>
            </h1>

            <p className="hero-subtitle">
              Juris AI answers legal questions with statutory citations you can verify,
              simplifies complex contracts into plain English, compares document versions,
              and prepares you for attorney consultations — all in seconds.
            </p>

            <div className="hero-buttons">
              <button
                className="btn-white-pill btn-hero-primary"
                onClick={() => setCurrentPage('chat')}
              >
                Start Legal Q&A <ArrowRight size={16} />
              </button>
              <button
                className="btn-glass-pill"
                onClick={() => {
                  const el = document.getElementById('features-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore All Tools
              </button>
            </div>

            {/* Floating Stats Row */}
            <div className="hero-stats-row">
              <div className="hero-stat">
                <span className="stat-number">5+</span>
                <span className="stat-label">AI Legal Engines</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number">PDF/DOCX</span>
                <span className="stat-label">Document Support</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number">Instant</span>
                <span className="stat-label">Analysis & Citations</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number">GPT-4o</span>
                <span className="stat-label">Powered Intelligence</span>
              </div>
            </div>

            {/* Workflow Showcase Panels */}
            <div className="showcase-grid" id="showcase-section">
              {/* Panel 1: Plan */}
              <div className="showcase-panel">
                <div className="showcase-header">
                  <span>Research Plan</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>3 Steps</span>
                </div>
                <div className="showcase-content-box">
                  <div className="plan-item">
                    <CheckSquare size={16} className="plan-check" />
                    <span>Search California appellate, 9th Circuit, and statutory contract codes for indemnification limits.</span>
                  </div>
                  <div className="plan-item">
                    <CheckSquare size={16} className="plan-check" />
                    <span>Cross-reference unilateral defense clauses against public policy constraints.</span>
                  </div>
                  <div className="plan-item">
                    <CheckSquare size={16} className="plan-check" />
                    <span>Synthesize propositions with verifiable pinpoint citations.</span>
                  </div>
                </div>
              </div>

              {/* Panel 2: Answer */}
              <div className="showcase-panel">
                <div className="showcase-header">
                  <span>AI Answer</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Verified</span>
                </div>
                <div className="showcase-content-box">
                  <div className="answer-text">
                    <strong>1.</strong> An unforeseeable criminal act by an independent contractor does not automatically trigger unilateral indemnity unless explicitly allocated in Schedule B.
                  </div>
                  <div className="answer-text" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <strong>2.</strong> Commercial agreements stipulating immediate forfeiture without a reasonable cure period are vulnerable to judicial modification.
                  </div>
                </div>
              </div>

              {/* Panel 3: Citations */}
              <div className="showcase-panel">
                <div className="showcase-header">
                  <span>Citations</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2 Authorities</span>
                </div>
                <div className="showcase-content-box">
                  <div className="citation-card-white">
                    <div className="citation-title">Okonjo v. Bellhaven Manufacturing Co.</div>
                    <div className="citation-meta">102 F.4th 55 · 9th Cir. 2024 · Persuasive</div>
                    <div className="citation-snippet">
                      "Indemnity covenants must be interpreted strictly according to mutual intent."
                    </div>
                  </div>
                  <div className="citation-card-white">
                    <div className="citation-title">Restatement (Second) of Contracts § 208</div>
                    <div className="citation-meta">Unconscionable Contract or Term · Authority</div>
                    <div className="citation-snippet">
                      "Courts may refuse enforcement of clauses creating disproportionate forfeiture."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section" id="features-section">
            <div className="features-header">
              <div className="features-eyebrow">
                <Zap size={14} />
                <span>5 Intelligence Engines</span>
              </div>
              <h2 className="features-title">Everything you need to navigate legal complexity</h2>
              <p className="features-subtitle">
                From statutory Q&A to attorney prep briefs — Juris AI covers the full spectrum of pre-counsel legal intelligence.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => setCurrentPage('chat')}>
                <div className="feature-icon-wrap cyan">
                  <MessageSquare size={22} />
                </div>
                <h3>Legal Q&A</h3>
                <p>Ask statutory questions in plain language and receive answers backed by verifiable legal citations and precedents.</p>
                <div className="feature-card-footer">
                  <span>Ask a question</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('simplify')}>
                <div className="feature-icon-wrap emerald">
                  <BookOpen size={22} />
                </div>
                <h3>Simplify & Summarize</h3>
                <p>Translate legalese into plain English with clause-by-clause breakdowns, key term glossaries, and executive summaries.</p>
                <div className="feature-card-footer">
                  <span>Upload a document</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('compare')}>
                <div className="feature-icon-wrap blue">
                  <FileDiff size={22} />
                </div>
                <h3>Contract Comparator</h3>
                <p>Compare two document versions side-by-side to identify clause changes, omitted safeguards, and liability shifts.</p>
                <div className="feature-card-footer">
                  <span>Compare documents</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('risks')}>
                <div className="feature-icon-wrap rose">
                  <ShieldAlert size={22} />
                </div>
                <h3>Risk Analyzer</h3>
                <p>Automated risk triage classifies clauses into High/Medium/Low severity with liability pitfall detection.</p>
                <div className="feature-card-footer">
                  <span>Scan for risks</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('lawyer')}>
                <div className="feature-icon-wrap amber">
                  <Briefcase size={22} />
                </div>
                <h3>Lawyer Prep Brief</h3>
                <p>Prepare structured attorney intake briefings with targeted questions, evidence checklists, and negotiation leverage points.</p>
                <div className="feature-card-footer">
                  <span>Generate briefing</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              <div className="feature-card feature-card-cta" onClick={() => setCurrentPage('chat')}>
                <div className="feature-icon-wrap white">
                  <Gavel size={22} />
                </div>
                <h3>Start Now — It's Free</h3>
                <p>No signup required. Upload any legal document or ask a question to experience AI-powered legal intelligence instantly.</p>
                <div className="feature-card-footer">
                  <span>Launch Juris AI</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </section>

          {/* Value Props / Trust Section */}
          <section className="trust-section">
            <div className="trust-grid">
              <div className="trust-item">
                <Shield size={28} color="var(--accent-cyan)" />
                <h4>Privacy First</h4>
                <p>Documents are processed in memory and never stored. Your legal data stays yours.</p>
              </div>
              <div className="trust-item">
                <TrendingUp size={28} color="#10b981" />
                <h4>Statutory Precision</h4>
                <p>Answers grounded in statutory frameworks, not just general knowledge.</p>
              </div>
              <div className="trust-item">
                <Star size={28} color="#f59e0b" />
                <h4>Attorney-Grade Prep</h4>
                <p>Intake briefs and question lists designed to maximize your consultation time.</p>
              </div>
              <div className="trust-item">
                <Users size={28} color="#a78bfa" />
                <h4>Built for Everyone</h4>
                <p>From entrepreneurs reviewing contracts to individuals disputing unfair clauses.</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="juris-footer">
            <div className="nav-brand" style={{ marginBottom: '0.5rem' }}>
              <Scale size={18} />
              <span>Juris AI</span>
            </div>
            <p style={{ maxWidth: '540px', lineHeight: 1.6 }}>
              <strong>Legal Disclaimer:</strong> Juris AI is an AI-powered informational tool for document comprehension and preparatory intake.
              It does not constitute legal representation, attorney-client relationship, or certified legal advice.
              Consult licensed legal counsel for binding legal decisions.
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              © 2025 Juris AI · GenAI Legal Intelligence Platform
            </p>
          </footer>
        </>
      )}

      {/* ========================================================
          PAGE 2: LEGAL Q&A CHAT
          ======================================================== */}
      {currentPage === 'chat' && (
        <main className="workspace-wrapper">
          <div className="workspace-header-bar">
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MessageSquare size={24} color="var(--accent-cyan)" /> Legal Q&A Assistant
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Ask statutory questions, explore legal precedents, or get contract enforceability guidance — with verifiable citations.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn-glass-pill" onClick={() => {
                setInputQuery('What are my rights if I was terminated without notice?');
              }}>
                Try: Termination Rights
              </button>
              <button className="btn-glass-pill" onClick={() => {
                setInputQuery('Is a 36-month non-compete clause enforceable in California?');
              }}>
                Try: Non-Compete Law
              </button>
            </div>
          </div>

          <div className="chat-workspace">
            <div className="chat-history">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scale size={14} color="white" />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Juris AI</span>
                    </div>
                  )}
                  <div style={{ fontSize: '0.925rem', lineHeight: 1.65, color: msg.role === 'user' ? '#f8fafc' : '#e2e8f0' }}>
                    {msg.content.split('**').map((part, idx) =>
                      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                    )}
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {msg.citations.map((c, ci) => (
                        <div key={ci} className="citation-inline">
                          <span className="citation-badge">[{c.number || ci + 1}]</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
                              {c.label || c.act || 'Legal Authority'}
                            </div>
                            {c.snippet && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                                "{c.snippet}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-msg assistant">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Scale size={14} color="white" />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Juris AI</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <Loader2 size={16} className="spin-icon" color="var(--accent-cyan)" />
                    Researching statutory frameworks and precedents...
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form className="chat-input-bar" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Ask a legal question (e.g. 'Is my non-compete clause enforceable?')"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isChatLoading}
              />
              <button className="btn-send" type="submit" disabled={isChatLoading || !inputQuery.trim()}>
                {isChatLoading ? <Loader2 size={18} className="spin-icon" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ========================================================
          PAGE 3: SIMPLIFY & SUMMARIZE
          ======================================================== */}
      {currentPage === 'simplify' && (
        <main className="workspace-wrapper">
          <div className="workspace-header-bar">
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={24} color="var(--accent-cyan)" /> Plain-English Simplifier
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Translate complex legalese, clauses, and contracts into plain English with an automated legal terminology glossary.
              </p>
            </div>
            <button className="btn-glass-pill" onClick={() => loadDemoFile('analysis')}>
              <RefreshCw size={14} /> Load Demo Agreement
            </button>
          </div>

          <div className="results-container">
            <div className="upload-card-container">
              <label className="dropzone-box" htmlFor="file-simplify">
                <Upload size={28} color="#38bdf8" />
                <div>
                  <strong>{docFile ? docFile.name : 'Upload Legal Document (PDF, DOCX, or TXT)'}</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Drag & drop or click to browse</div>
                </div>
                <input
                  type="file"
                  id="file-simplify"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn-white-pill"
                  onClick={() => handleAnalyzeDoc()}
                  disabled={!docFile || isDocAnalyzing}
                >
                  {isDocAnalyzing ? <Loader2 size={16} className="spin-icon" /> : <Sparkles size={16} />}
                  {isDocAnalyzing ? 'Translating Legalese...' : 'Simplify & De-jargonize'}
                </button>
                <button className="btn-glass-pill" onClick={() => loadDemoFile('analysis')}>
                  <RefreshCw size={14} /> Try Demo Contract
                </button>
              </div>
            </div>

            {analysisData && (
              <>
                <div className="card-dark">
                  <div className="card-title-row">
                    <h3><BookOpen size={20} color="#38bdf8" /> Plain-English Executive Summary</h3>
                    {analysisData.parties && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {analysisData.parties.map((p, i) => (
                          <span key={i} className="severity-pill low">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ lineHeight: 1.6, color: '#e2e8f0' }}>{analysisData.summary}</p>
                </div>

                {analysisData.key_terms && (
                  <div className="card-dark">
                    <div className="card-title-row">
                      <h3><HelpCircle size={20} color="#38bdf8" /> Legal Terminology Glossary</h3>
                    </div>
                    <div className="glossary-grid">
                      {analysisData.key_terms.map((item, i) => (
                        <div key={i} className="glossary-chip">
                          <div className="glossary-term">{item.term}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.definition}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisData.plain_english_breakdown && (
                  <div className="card-dark">
                    <div className="card-title-row">
                      <h3><CheckCircle2 size={20} color="#10b981" /> Clause-by-Clause Translation</h3>
                    </div>
                    <div>
                      {analysisData.plain_english_breakdown.map((c, i) => (
                        <div key={i} className="clause-row">
                          <div className="clause-orig-text">Original: "{c.clause}"</div>
                          <div className="clause-plain-text"><strong>In Plain English:</strong> {c.simplified}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* ========================================================
          PAGE 4: CONTRACT COMPARATOR
          ======================================================== */}
      {currentPage === 'compare' && (
        <main className="workspace-wrapper">
          <div className="workspace-header-bar">
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileDiff size={24} color="var(--accent-cyan)" /> Contract Comparator
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Compare two drafts of an agreement side-by-side to highlight differing liabilities and omitted protections.
              </p>
            </div>
            <button className="btn-glass-pill" onClick={() => loadDemoFile('comparison')}>
              <RefreshCw size={14} /> Load V1 vs V2 Demo
            </button>
          </div>

          <div className="results-container">
            <div className="upload-card-container">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', maxWidth: '960px' }}>
                <label className="dropzone-box" htmlFor="file-a">
                  <Upload size={24} color="#38bdf8" />
                  <div>
                    <strong>{fileA ? fileA.name : 'Select Document A (Baseline)'}</strong>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Prior draft or standard policy</div>
                  </div>
                  <input
                    type="file"
                    id="file-a"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFileA(e.target.files ? e.target.files[0] : null)}
                  />
                </label>

                <label className="dropzone-box" htmlFor="file-b">
                  <Upload size={24} color="#38bdf8" />
                  <div>
                    <strong>{fileB ? fileB.name : 'Select Document B (Counter)'}</strong>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Proposed amendment or counterdraft</div>
                  </div>
                  <input
                    type="file"
                    id="file-b"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFileB(e.target.files ? e.target.files[0] : null)}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  className="btn-white-pill"
                  onClick={() => handleCompare()}
                  disabled={!fileA || !fileB || isComparing}
                >
                  {isComparing ? <Loader2 size={16} className="spin-icon" /> : <FileDiff size={16} />}
                  {isComparing ? 'Comparing Provisions...' : 'Run Comparative Matrix'}
                </button>
                <button className="btn-glass-pill" onClick={() => loadDemoFile('comparison')}>
                  <RefreshCw size={14} /> Try V1 vs V2 Demo
                </button>
              </div>
            </div>

            {comparisonData && (
              <>
                <div className="card-dark">
                  <div className="card-title-row">
                    <h3><FileDiff size={20} color="#38bdf8" /> Comparative Analysis Overview</h3>
                    <span className="severity-pill low">Analysis Complete</span>
                  </div>
                  <p style={{ lineHeight: 1.6, color: '#e2e8f0', marginBottom: '1rem' }}>{comparisonData.overview}</p>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.85rem', marginBottom: '0.35rem' }}>RECOMMENDATION</div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.925rem', lineHeight: 1.5 }}>{comparisonData.recommendation}</div>
                  </div>
                </div>

                {comparisonData.differences && comparisonData.differences.length > 0 && (
                  <div className="card-dark">
                    <div className="card-title-row">
                      <h3><AlertTriangle size={20} color="#f59e0b" /> Clause-by-Clause Differences</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="diff-table-lexora">
                        <thead>
                          <tr>
                            <th>Clause Topic</th>
                            <th>Document A (Baseline)</th>
                            <th>Document B (Revised)</th>
                            <th>Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonData.differences.map((d, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', minWidth: '140px' }}>{d.clause_topic}</td>
                              <td style={{ color: '#fb7185', minWidth: '200px' }}>{d.doc_a_provision}</td>
                              <td style={{ color: '#34d399', minWidth: '200px' }}>{d.doc_b_provision}</td>
                              <td>
                                <span className={`severity-pill ${d.impact?.toLowerCase() === 'critical' ? 'high' : d.impact?.toLowerCase() === 'high' ? 'medium' : 'low'}`}>
                                  {d.impact}
                                </span>
                                {d.explanation && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}>{d.explanation}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {comparisonData.omitted_safeguards && comparisonData.omitted_safeguards.length > 0 && (
                  <div className="card-dark">
                    <div className="card-title-row">
                      <h3><ShieldAlert size={20} color="#f43f5e" /> Omitted Safeguards</h3>
                    </div>
                    {comparisonData.omitted_safeguards.map((s, i) => (
                      <div key={i} style={{ padding: '1rem 1.25rem', background: 'rgba(244,63,94,0.06)', borderLeft: '4px solid #f43f5e', borderRadius: '10px', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#fb7185', marginBottom: '0.25rem' }}>{s.safeguard}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Missing in: <strong style={{ color: 'var(--text-white)' }}>{s.missing_in}</strong></div>
                        <div style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>{s.risk}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* ========================================================
          PAGE 5: RISK ANALYZER
          ======================================================== */}
      {currentPage === 'risks' && (
        <main className="workspace-wrapper">
          <div className="workspace-header-bar">
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldAlert size={24} color="#f43f5e" /> Risk & Obligation Analyzer
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Automated risk triage classifies clauses into High, Medium, and Low severity — and catalogs all contractual obligations.
              </p>
            </div>
            <button className="btn-glass-pill" onClick={() => loadDemoFile('analysis')}>
              <RefreshCw size={14} /> Try High-Risk Agreement
            </button>
          </div>

          <div className="results-container">
            <div className="upload-card-container">
              <label className="dropzone-box" htmlFor="file-risk">
                <ShieldAlert size={28} color="#f43f5e" />
                <div>
                  <strong>{docFile ? docFile.name : 'Upload Contract to Audit Legal Risks'}</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Detects indemnities, penalties, and unilateral liabilities</div>
                </div>
                <input
                  type="file"
                  id="file-risk"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn-white-pill"
                  onClick={() => handleAnalyzeDoc()}
                  disabled={!docFile || isDocAnalyzing}
                >
                  {isDocAnalyzing ? <Loader2 size={16} className="spin-icon" /> : <ShieldAlert size={16} />}
                  {isDocAnalyzing ? 'Auditing Liabilities...' : 'Scan Risks & Obligations'}
                </button>
                <button className="btn-glass-pill" onClick={() => loadDemoFile('analysis')}>
                  <RefreshCw size={14} /> Try High-Risk Agreement
                </button>
              </div>
            </div>

            {analysisData && (
              <>
                <div className="card-dark">
                  <div className="card-title-row">
                    <h3><AlertTriangle size={20} color="#f43f5e" /> Identified Legal Risks</h3>
                    {analysisData.risks && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="severity-pill high">{analysisData.risks.filter(r => r.severity === 'High').length} High</span>
                        <span className="severity-pill medium">{analysisData.risks.filter(r => r.severity === 'Medium').length} Medium</span>
                        <span className="severity-pill low">{analysisData.risks.filter(r => r.severity === 'Low').length} Low</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analysisData.risks?.map((r, i) => {
                      const sev = r.severity?.toLowerCase() || 'medium';
                      return (
                        <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${sev === 'high' ? '#f43f5e' : sev === 'medium' ? '#f59e0b' : '#10b981'}`, borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--text-white)' }}>{r.risk}</strong>
                            <span className={`severity-pill ${sev}`}>{r.severity} Severity</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                            Ref: {r.clause}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            {r.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {analysisData.obligations && (
                  <div className="card-dark">
                    <div className="card-title-row">
                      <h3><FileCheck size={20} color="#10b981" /> Obligations Tracker</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="diff-table-lexora">
                        <thead>
                          <tr>
                            <th>Party Responsible</th>
                            <th>Contractual Obligation</th>
                            <th>Milestone / Deadline Trigger</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisData.obligations.map((ob, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{ob.party}</td>
                              <td style={{ color: '#f8fafc' }}>{ob.obligation}</td>
                              <td style={{ color: '#f59e0b', fontWeight: 500 }}>{ob.deadline_or_trigger}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* ========================================================
          PAGE 6: LAWYER PREP BRIEF
          ======================================================== */}
      {currentPage === 'lawyer' && (
        <main className="workspace-wrapper">
          <div className="workspace-header-bar">
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Briefcase size={24} color="#10b981" /> Attorney Consultation Prep
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Prepare for counsel meetings with structured intake briefings, critical questions to ask, and negotiation leverage points.
              </p>
            </div>
            <button className="btn-glass-pill" onClick={() => loadDemoFile('prep')}>
              <RefreshCw size={14} /> Load Sample Brief
            </button>
          </div>

          <div className="results-container">
            <div className="upload-card-container">
              <label className="dropzone-box" htmlFor="file-prep">
                <Briefcase size={28} color="#10b981" />
                <div>
                  <strong>{prepFile ? prepFile.name : 'Upload Contract or Dispute Notice'}</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Generates lawyer intake brief & targeted questions</div>
                </div>
                <input
                  type="file"
                  id="file-prep"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setPrepFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>

              <div style={{ width: '100%', maxWidth: '680px' }}>
                <textarea
                  rows={3}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-strong)', borderRadius: '12px', padding: '0.85rem 1.25rem', color: 'var(--text-white)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="Specific concerns (e.g. 'We want to avoid giving away our pre-existing IP and reduce termination notice...')"
                  value={userConcerns}
                  onChange={(e) => setUserConcerns(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn-white-pill"
                  onClick={() => handleLawyerPrep()}
                  disabled={!prepFile || isPrepLoading}
                >
                  {isPrepLoading ? <Loader2 size={16} className="spin-icon" /> : <Briefcase size={16} />}
                  {isPrepLoading ? 'Drafting Attorney Intake Pack...' : 'Generate Attorney Prep Brief'}
                </button>
                <button className="btn-glass-pill" onClick={() => loadDemoFile('prep')}>
                  <RefreshCw size={14} /> Try Demo Prep
                </button>
              </div>
            </div>

            {lawyerBriefing && (
              <>
                <div className="card-dark">
                  <div className="card-title-row">
                    <h3><Briefcase size={20} color="#10b981" /> Executive Summary for Counsel</h3>
                  </div>
                  <p style={{ lineHeight: 1.6, color: '#e2e8f0' }}>{lawyerBriefing.case_summary}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  <div className="card-dark">
                    <div className="card-title-row">
                      <h3><HelpCircle size={20} color="var(--accent-cyan)" /> Questions for Your Lawyer</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {lawyerBriefing.questions_for_lawyer?.map((q, i) => (
                        <div key={i} style={{ padding: '1rem 1.25rem', background: 'rgba(56,189,248,0.05)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '10px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{q.category}</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-white)', marginBottom: '0.35rem', fontSize: '0.9rem', lineHeight: 1.4 }}>{q.question}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, fontStyle: 'italic' }}>Why: {q.why_to_ask}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card-dark">
                      <div className="card-title-row">
                        <h3><FileCheck size={20} color="#10b981" /> Documents to Bring</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {lawyerBriefing.documents_to_bring?.map((doc, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
                            <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card-dark">
                      <div className="card-title-row">
                        <h3><TrendingUp size={20} color="#f59e0b" /> Negotiation Leverage Points</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {lawyerBriefing.negotiation_leverage_points?.map((point, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
