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
  'What was the build vs buy decision for the Unified Inbox?',
  'What are the Q1 2026 initiatives and their owners?',
  'What did we decide on AI Lead Scoring architecture?',
  'What are the key risks on the product roadmap?',
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
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
  }

  const hasResult = answer.length > 0

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-base font-bold">P</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">PM Compass</h1>
            <p className="text-xs text-gray-400">AI knowledge assistant for Product Managers</p>
          </div>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-3 py-1 font-medium">
          v1 — Prototype
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Landing hero */}
        {!hasResult && !loading && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              Search your product knowledge
            </h2>
            <p className="text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
              Ask anything about your PRDs, roadmaps, meeting notes, and decisions.
              PM Compass retrieves the most relevant context and generates a cited answer.
            </p>
          </div>
        )}

        {/* Search bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. What did we decide about the Unified Inbox?"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Example queries */}
        {!hasResult && !loading && recentSearches.length === 0 && (
          <div className="mt-5">
            <p className="text-sm text-gray-400 mb-2">Try these examples</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); handleSearch(q) }}
                  className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent searches */}
        {recentSearches.length > 0 && !hasResult && !loading && (
          <div className="mt-5">
            <p className="text-sm text-gray-400 mb-2">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s) }}
                  className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-base text-red-700">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !hasResult && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {hasResult && (
          <div className="mt-8 space-y-6">

            {/* Answer */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Answer</p>
                {!streaming && (
                  <button
                    onClick={handleCopy}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {answer}
                {streaming && <span className="animate-pulse">▌</span>}
              </p>

              {/* Feedback */}
              {!streaming && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <p className="text-sm text-gray-400">Was this helpful?</p>
                  <button
                    onClick={() => setFeedback('up')}
                    className={`text-sm px-2 py-1 rounded transition-colors ${feedback === 'up' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setFeedback('down')}
                    className={`text-sm px-2 py-1 rounded transition-colors ${feedback === 'down' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                  >
                    👎
                  </button>
                  {feedback && (
                    <span className="text-sm text-gray-400">
                      {feedback === 'up' ? 'Thanks for the feedback!' : "Got it — we'll work on improving this."}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Sources — {sources.length} document{sources.length > 1 ? 's' : ''} retrieved
                </p>
                <div className="space-y-3">
                  {sources.map((source, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            [{i + 1}] {source.source_name || source.source_file.replace(/\\/g, '/')}
                          </span>
                          {source.source_file.startsWith('https://docs.google.com/') && (
                            <a
                              href={source.source_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:text-blue-700 whitespace-nowrap shrink-0"
                            >
                              Open in Drive ↗
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            source.score >= 0.5 ? 'bg-green-50 text-green-600' :
                            source.score >= 0.35 ? 'bg-yellow-50 text-yellow-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {(source.score * 100).toFixed(0)}% match
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(source.content)
                              setCopiedChunk(i)
                              setTimeout(() => setCopiedChunk(null), 2000)
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded px-2 py-0.5 transition-colors"
                          >
                            {copiedChunk === i ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSource(selectedSource?.content === source.content ? null : source)
                              setPanelTab('chunk')
                              setSummary(null)
                            }}
                            className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded px-2 py-0.5 transition-colors"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latency breakdown */}
            {latency && (
              <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="font-medium text-gray-500">Pipeline latency</span>
                <span>Embedding: {latency.embedding_ms}ms</span>
                <span>Search: {latency.search_ms}ms</span>
                <span>LLM: {latency.llm_ms}ms</span>
                <span className="font-medium text-gray-600">Total: {latency.total_ms}ms</span>
              </div>
            )}

            {/* New search */}
            {!streaming && (
              <button
                onClick={handleReset}
                className="text-base text-blue-600 hover:underline"
              >
                ← New search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedSource(null)} />
          <div className="relative bg-white w-full max-w-md shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div>
                <p className="text-base font-semibold text-gray-900">{selectedSource.source_name || 'Document'}</p>
                <p className="text-sm text-gray-400 mt-0.5">{(selectedSource.score * 100).toFixed(0)}% match</p>
              </div>
              <button onClick={() => setSelectedSource(null)} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              <button
                onClick={() => setPanelTab('chunk')}
                className={`text-sm font-medium py-3 mr-6 border-b-2 transition-colors ${panelTab === 'chunk' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
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
                className={`text-sm font-medium py-3 border-b-2 transition-colors ${panelTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Summarize doc
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {panelTab === 'chunk' && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Matching passage</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSource.content)
                        setCopiedPanel(true)
                        setTimeout(() => setCopiedPanel(false), 2000)
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 rounded px-2 py-0.5 transition-colors"
                    >
                      {copiedPanel ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedSource.content}</p>
                </>
              )}
              {panelTab === 'summary' && (
                summaryLoading
                  ? <p className="text-sm text-gray-400 animate-pulse">Summarizing document...</p>
                  : <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
              )}
            </div>
            {selectedSource.source_file.startsWith('https://docs.google.com/') && (
              <div className="px-6 py-5 border-t border-gray-200">
                <a
                  href={selectedSource.source_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-base font-medium py-3 rounded-lg transition-colors"
                >
                  Open in Google Drive ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
