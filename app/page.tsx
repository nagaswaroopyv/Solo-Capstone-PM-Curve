import Link from 'next/link'

const STATS = [
  { value: '83.6%', label: 'Hit Rate' },
  { value: '4.1/5', label: 'Faithfulness' },
  { value: '67',    label: 'Knowledge Chunks' },
  { value: '14',    label: 'Drive Documents' },
]

const FEATURES = [
  {
    icon: 'search',
    title: 'Plain-English Search',
    body: 'Ask questions the way you think them. Hybrid semantic + keyword search surfaces the most relevant passages from your documents.',
  },
  {
    icon: 'folder_shared',
    title: 'Google Drive Connected',
    body: 'OAuth 2.0 integration with your Drive. Documents are indexed automatically — ask about any PRD, roadmap, or meeting note.',
  },
  {
    icon: 'fact_check',
    title: 'Cited, Grounded Answers',
    body: 'Every answer shows exactly which document and passage it came from. No hallucination without evidence — system says "I don\'t know" when unsure.',
  },
  {
    icon: 'summarize',
    title: 'One-Click Summaries',
    body: 'Open any source in the side panel and summarize the full document in seconds — without leaving the search interface.',
  },
  {
    icon: 'sort',
    title: 'Cohere Reranking',
    body: 'Retrieval candidates are reranked by relevance before the answer is generated — reducing noise and improving precision.',
  },
  {
    icon: 'bar_chart',
    title: 'Three-Layer Evals',
    body: 'Automated retrieval eval (F1=0.47), LLM-as-judge, and manual human eval across 19 test cases. Attribution hallucination rate: 28%.',
  },
]

const PIPELINE = [
  { icon: 'conversion_path', label: 'Embed query' },
  { icon: 'manage_search',   label: 'Hybrid search' },
  { icon: 'sort',            label: 'Rerank (Cohere)' },
  { icon: 'smart_toy',       label: 'Generate (GPT-4o-mini)' },
  { icon: 'chat',            label: 'Cited answer', green: true },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm font-headline">P</span>
          </div>
          <span className="font-headline font-bold text-lg text-text-primary tracking-tight">PM Compass</span>
          <span className="pill bg-brand-dim text-brand">v1 · Prototype</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/nagaswaroopyv/Solo-Capstone-PM-Curve"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-sm font-medium text-text-secondary border border-border rounded-full px-4 py-1.5 hover:bg-surface-low transition-colors"
          >
            GitHub ↗
          </a>
          <Link
            href="/search"
            className="text-sm font-semibold bg-brand text-white rounded-full px-4 py-1.5 hover:brightness-110 transition-all"
          >
            Try Live ↗
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 pill bg-brand-dim text-brand mb-6">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>explore</span>
          Built from scratch · Production-ready · Fully evaluated
        </div>
        <h1 className="font-headline font-bold text-5xl md:text-6xl text-text-primary tracking-tight mb-6 leading-tight">
          AI knowledge assistant<br />
          built for <span className="text-brand">Product Managers</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
          PM Compass connects to your Google Drive and lets you search all your documents by content — not filename.
          Ask questions in plain English. Get cited, grounded answers in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/search"
            className="flex items-center gap-2 bg-brand text-white font-semibold px-7 py-3.5 rounded-full hover:brightness-110 transition-all shadow-lg shadow-brand/20"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
            Try PM Compass
          </Link>
          <a
            href="https://github.com/nagaswaroopyv/Solo-Capstone-PM-Curve"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-border text-text-primary font-semibold px-7 py-3.5 rounded-full hover:bg-surface-low transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>code</span>
            View Source
          </a>
        </div>

        {/* Headline stats */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-border/50 p-5 text-center shadow-sm">
              <p className="font-headline font-bold text-3xl text-brand">{s.value}</p>
              <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live demo callout ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl border border-border/40 shadow-xl overflow-hidden">
          {/* Mock search bar */}
          <div className="px-6 py-5 border-b border-border/30 bg-surface">
            <div className="flex items-center gap-3 bg-white border border-border/50 rounded-xl px-4 py-3 shadow-sm">
              <span className="material-symbols-outlined text-text-muted">search</span>
              <span className="flex-1 text-text-primary text-sm">What are the three architecture options for AI Lead Scoring and which one was selected?</span>
              <Link href="/search" className="bg-brand text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:brightness-110 transition-all">
                Search
              </Link>
            </div>
          </div>
          {/* Mock answer */}
          <div className="px-6 py-5 border-b border-border/20">
            <div className="flex items-center justify-between mb-3">
              <span className="pill bg-brand-dim text-brand">Answer</span>
              <span className="text-xs text-text-muted">Copy</span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed">
              Three architecture options were evaluated for AI Lead Scoring{' '}
              <span className="bg-brand-dim text-brand font-medium rounded px-1 text-xs">[1][2]</span>:<br /><br />
              <strong>Option A — Pure real-time:</strong> Score on every lead creation. Con: $0.12/score = $60K/month at scale.<br /><br />
              <strong>Option B — Batch (hourly):</strong> Cost-efficient at $0.02/score. Con: misses 68% of enterprise customers who respond within 1 hour.<br /><br />
              <strong>Option C — Hybrid (selected):</strong> Lightweight model for instant scoring, full re-score every 4 hours. $0.03/score average. Decision made November 3, 2025.{' '}
              <span className="bg-brand-dim text-brand font-medium rounded px-1 text-xs">[1]</span>
            </p>
          </div>
          {/* Sources */}
          <div className="px-6 py-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Sources — 2 documents retrieved</p>
            <Link href="/search" className="text-sm font-semibold text-brand hover:underline flex items-center gap-1">
              Try it yourself
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-low border-y border-border/30 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="pill bg-brand-dim text-brand mb-3 inline-block">Capabilities</span>
            <h2 className="font-headline font-bold text-4xl text-text-primary tracking-tight">What PM Compass does</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                <div className="w-10 h-10 bg-brand-dim rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-brand" style={{ fontSize: 20 }}>{f.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-sm text-text-primary mb-1">{f.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="pill bg-brand-dim text-brand mb-3 inline-block">How it works</span>
          <h2 className="font-headline font-bold text-4xl text-text-primary tracking-tight">RAG pipeline, end to end</h2>
          <p className="text-text-secondary mt-3 max-w-xl mx-auto">Every search runs through a 4-stage pipeline: embed → hybrid search → rerank → generate. Streaming response starts as soon as the first token is ready.</p>
        </div>
        <div className="bg-white rounded-2xl border border-border/40 p-6 shadow-sm">
          <div className="flex items-center flex-wrap gap-2 justify-between">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`flex flex-col items-center gap-2`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.green ? 'bg-green-50 border border-green-200' : 'bg-brand-dim'}`}>
                    <span className={`material-symbols-outlined ${step.green ? 'text-green-600' : 'text-brand'}`} style={{ fontSize: 22 }}>{step.icon}</span>
                  </div>
                  <span className={`text-xs font-semibold text-center ${step.green ? 'text-green-700' : 'text-text-secondary'}`}>{step.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <span className="material-symbols-outlined text-border mb-4" style={{ fontSize: 20 }}>arrow_forward</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/20 flex flex-wrap gap-6 text-xs text-text-muted">
            <span>Relevance threshold: 0.30</span>
            <span>Top-10 → reranked to top-3</span>
            <span>Streaming response</span>
            <span>Graceful "I don't know" on low confidence</span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20 text-center">
        <div className="bg-brand rounded-3xl p-12">
          <h2 className="font-headline font-bold text-3xl text-white mb-4">Ask your first question</h2>
          <p className="text-brand-light text-base mb-8 max-w-md mx-auto">
            Connected to 14 real PM artifacts — PRDs, roadmaps, meeting notes, and decision logs.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-3.5 rounded-full hover:bg-brand-dim transition-all shadow-lg"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
            Open PM Compass
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs font-headline">P</span>
              </div>
              <span className="font-headline font-bold text-base text-text-primary">PM Compass</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Next.js · TypeScript · Tailwind', 'Supabase pgvector', 'text-embedding-3-small', 'GPT-4o-mini', 'Cohere rerank-v3.5', 'Google Drive API · OAuth 2.0', 'Vercel'].map(t => (
                <span key={t} className="pill bg-surface-mid text-text-secondary">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/search" className="flex items-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all">
              Try Live ↗
            </Link>
            <a
              href="https://github.com/nagaswaroopyv/Solo-Capstone-PM-Curve"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-border text-text-primary font-semibold px-5 py-2.5 rounded-full hover:bg-surface-low transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </footer>

    </main>
  )
}
