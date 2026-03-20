'use client'

import { useState } from 'react'

interface Source {
  source_file: string
  source_name: string
  content: string
  score: number
}

interface Latency {
  embedding_ms: number
  search_ms: number
  llm_ms: number
  total_ms: number
}

const EXAMPLE_QUERIES = [
  'What was the outcome of the beta customer selection on February 3rd?',
  'What were the top customer feature requests and which made it into Q1 scope?',
  'What are the three architecture options for AI Lead Scoring and which one was selected?',
  'What open questions remain unresolved across Q1 initiatives as of the latest documents?',
  "What's the story with the inbox?",
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [latency, setLatency] = useState<Latency | null>(null)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedChunk, setCopiedChunk] = useState<number | null>(null)
  const [copiedPanel, setCopiedPanel] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [panelTab, setPanelTab] = useState<'chunk' | 'summary'>('chunk')
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  async function handleSearch(searchQuery: string = query) {
    if (!searchQuery.trim()) return

    setLoading(true)
    setStreaming(false)
    setError('')
    setAnswer('')
    setSources([])
    setLatency(null)
    setFeedback(null)
    setCopied(false)
    setSelectedSource(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) throw new Error('Search failed')

      const contentType = response.headers.get('Content-Type') || ''

      if (!contentType.includes('text/event-stream')) {
        const data = await response.json()
        setAnswer(data.answer)
        setSources(data.sources || [])
        setLatency(data.latency || null)
        setRecentSearches(prev =>
          [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5)
        )
        return
      }

      setStreaming(true)
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'sources') {
              setSources(msg.sources)
            } else if (msg.type === 'token') {
              setAnswer(prev => prev + msg.token)
            } else if (msg.type === 'done') {
              if (msg.answer) setAnswer(msg.answer)
              if (msg.latency) setLatency(msg.latency)
            }
          } catch {}
        }
      }

      setRecentSearches(prev =>
        [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5)
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
      setStreaming(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setAnswer('')
    setSources([])
    setLatency(null)
    setQuery('')
    setFeedback(null)
    setCopied(false)
    setSelectedSource(null)
    setSummary(null)
  }

  const hasResult = answer.length > 0

  return (
    <main className="min-h-screen bg-surface">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>P</span>
          </div>
          <span className="font-headline font-bold text-lg text-text-primary tracking-tight">PM Compass</span>
          <span className="pill bg-brand-dim text-brand">v1 · Prototype</span>
        </div>
        <a
          href="https://github.com/nagaswaroopyv/Solo-Capstone-PM-Curve"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex text-sm font-medium text-text-secondary border border-border rounded-full px-4 py-1.5 hover:bg-surface-low transition-colors"
        >
          GitHub ↗
        </a>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* ── Hero (no results) ── */}
        {!hasResult && !loading && (
          <div className="mb-10 text-center fade-up">
            <div className="inline-flex items-center gap-2 pill bg-brand-dim text-brand mb-5">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>explore</span>
              Connected to Google Drive · 14 docs · 67 chunks
            </div>
            <h2 className="font-headline font-bold text-4xl text-text-primary tracking-tight mb-4 leading-tight">
              Search your product knowledge
            </h2>
            <p className="text-base text-text-secondary max-w-lg mx-auto leading-relaxed">
              Ask anything about your PRDs, roadmaps, meeting notes, and decisions.
              PM Compass retrieves the most relevant context and generates a cited answer.
            </p>
          </div>
        )}

        {/* ── Search bar ── */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-white border border-border/60 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand/50 transition-all">
            <span className="material-symbols-outlined text-text-muted shrink-0">search</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. What did we decide about the Unified Inbox?"
              className="flex-1 text-sm text-text-primary placeholder-text-muted bg-transparent focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-text-muted hover:text-text-secondary transition-colors text-lg leading-none shrink-0"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-brand text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-brand/20"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* ── Example queries ── */}
        {!hasResult && !loading && recentSearches.length === 0 && (
          <div className="mt-5 fade-up">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Try these examples</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); handleSearch(q) }}
                  className="text-sm bg-white border border-border/50 rounded-full px-4 py-2 text-text-secondary hover:border-brand/40 hover:text-brand transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent searches ── */}
        {recentSearches.length > 0 && !hasResult && !loading && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s) }}
                  className="text-sm bg-white border border-border/50 rounded-full px-4 py-2 text-text-secondary hover:border-brand/40 hover:text-brand transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && !hasResult && (
          <div className="mt-8 bg-white border border-border/40 rounded-3xl p-6 shadow-sm animate-pulse">
            <div className="h-3 bg-surface-high rounded w-16 mb-5"></div>
            <div className="space-y-3">
              <div className="h-3 bg-surface-mid rounded w-full"></div>
              <div className="h-3 bg-surface-mid rounded w-5/6"></div>
              <div className="h-3 bg-surface-mid rounded w-4/6"></div>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {hasResult && (
          <div className="mt-8 space-y-4 fade-up">

            {/* Answer */}
            <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="pill bg-brand-dim text-brand">Answer</span>
                {!streaming && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {answer}
                {streaming && <span className="cursor-blink ml-0.5 text-brand">▌</span>}
              </p>

              {/* Feedback */}
              {!streaming && (
                <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-3">
                  <p className="text-sm text-text-muted">Was this helpful?</p>
                  <button
                    onClick={() => setFeedback('up')}
                    className={`text-sm px-2 py-1 rounded-lg transition-colors ${feedback === 'up' ? 'bg-green-50 text-green-600' : 'text-text-muted hover:text-green-600'}`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setFeedback('down')}
                    className={`text-sm px-2 py-1 rounded-lg transition-colors ${feedback === 'down' ? 'bg-red-50 text-red-600' : 'text-text-muted hover:text-red-500'}`}
                  >
                    👎
                  </button>
                  {feedback && (
                    <span className="text-sm text-text-muted">
                      {feedback === 'up' ? 'Thanks!' : "Got it — we'll improve this."}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                  Sources — {sources.length} document{sources.length > 1 ? 's' : ''} retrieved
                </p>
                <div className="space-y-3">
                  {sources.map((source, i) => (
                    <div key={i} className="bg-white border border-border/40 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-sm font-semibold text-text-primary truncate">
                            [{i + 1}] {source.source_name || source.source_file.replace(/\\/g, '/')}
                          </span>
                          {source.source_file.startsWith('https://docs.google.com/') && (
                            <a
                              href={source.source_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand hover:underline whitespace-nowrap shrink-0 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span>
                              Drive
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`pill text-[10px] ${
                            source.score >= 0.5 ? 'bg-green-50 text-green-700' :
                            source.score >= 0.35 ? 'bg-yellow-50 text-yellow-700' :
                            'bg-surface-mid text-text-muted'
                          }`}>
                            {(source.score * 100).toFixed(0)}% match
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(source.content)
                              setCopiedChunk(i)
                              setTimeout(() => setCopiedChunk(null), 2000)
                            }}
                            className="text-xs text-text-muted hover:text-text-secondary border border-border/50 rounded-lg px-2 py-0.5 transition-colors"
                          >
                            {copiedChunk === i ? '✓' : 'Copy'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSource(selectedSource?.content === source.content ? null : source)
                              setPanelTab('chunk')
                              setSummary(null)
                            }}
                            className="text-xs text-brand border border-brand/30 hover:bg-brand-dim rounded-lg px-2 py-0.5 transition-colors"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latency */}
            {latency && (
              <div className="bg-white border border-border/30 rounded-2xl px-5 py-3 flex flex-wrap gap-4 text-xs text-text-muted">
                <span className="font-semibold text-text-secondary">Pipeline latency</span>
                <span>Embedding: {latency.embedding_ms}ms</span>
                <span>Search: {latency.search_ms}ms</span>
                <span>LLM: {latency.llm_ms}ms</span>
                <span className="font-semibold text-text-primary">Total: {latency.total_ms}ms</span>
              </div>
            )}

            {/* New search */}
            {!streaming && (
              <button
                onClick={handleReset}
                className="text-sm text-brand hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
                New search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Side panel ── */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedSource(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col h-full border-l border-border/40">

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <div>
                <p className="text-sm font-semibold text-text-primary">{selectedSource.source_name || 'Document'}</p>
                <p className="text-xs text-text-muted mt-0.5">{(selectedSource.score * 100).toFixed(0)}% match</p>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-text-muted hover:text-text-secondary text-xl font-light leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/30 px-6">
              <button
                onClick={() => setPanelTab('chunk')}
                className={`text-sm font-medium py-3 mr-6 border-b-2 transition-colors ${
                  panelTab === 'chunk' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Matching passage
              </button>
              <button
                onClick={async () => {
                  setPanelTab('summary')
                  if (!summary) {
                    setSummaryLoading(true)
                    const res = await fetch('/api/summarize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ source_file: selectedSource.source_file, source_name: selectedSource.source_name }),
                    })
                    const data = await res.json()
                    setSummary(data.summary || 'Could not generate summary.')
                    setSummaryLoading(false)
                  }
                }}
                className={`text-sm font-medium py-3 border-b-2 transition-colors ${
                  panelTab === 'summary' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Summarize doc
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {panelTab === 'chunk' && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Matching passage</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSource.content)
                        setCopiedPanel(true)
                        setTimeout(() => setCopiedPanel(false), 2000)
                      }}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary border border-border/50 rounded-lg px-2 py-0.5 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                        {copiedPanel ? 'check' : 'content_copy'}
                      </span>
                      {copiedPanel ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{selectedSource.content}</p>
                </>
              )}
              {panelTab === 'summary' && (
                summaryLoading
                  ? (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                      Summarizing document…
                    </div>
                  )
                  : <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{summary}</p>
              )}
            </div>

            {/* Panel footer */}
            {selectedSource.source_file.startsWith('https://docs.google.com/') && (
              <div className="px-6 py-5 border-t border-border/30">
                <a
                  href={selectedSource.source_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-brand hover:brightness-110 text-white text-sm font-semibold py-3 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                  Open in Google Drive
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
