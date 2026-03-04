'use client'

import { useState } from 'react'

interface Source {
  source_file: string
  content: string
  score: number
}

interface Latency {
  embedding_ms: number
  search_ms: number
  llm_ms: number
  total_ms: number
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [latency, setLatency] = useState<Latency | null>(null)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  async function handleSearch(searchQuery: string = query) {
    if (!searchQuery.trim()) return

    setLoading(true)
    setStreaming(false)
    setError('')
    setAnswer('')
    setSources([])
    setLatency(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) throw new Error('Search failed')

      const contentType = response.headers.get('Content-Type') || ''

      // Non-streaming response (no results case)
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

      // Streaming response
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

  const hasResult = answer.length > 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">PM Compass</h1>
        <p className="text-sm text-gray-500">Search your product documents</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Search bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="What are you looking for? e.g. what did we decide about pricing?"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && !hasResult && !loading && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s) }}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {hasResult && (
          <div className="mt-8 space-y-6">
            {/* Answer — streams in word by word */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3">Answer</p>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {answer}
                {streaming && <span className="animate-pulse">▌</span>}
              </p>
            </div>

            {/* Sources — appear as soon as retrieval completes */}
            {sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Sources</p>
                <div className="space-y-3">
                  {sources.map((source, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          [{i + 1}] {source.source_file.replace(/\\/g, '/')}
                        </span>
                        <span className="text-xs text-gray-400">
                          Relevance: {(source.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latency — appears after stream completes */}
            {latency && (
              <div className="text-xs text-gray-400 flex gap-4">
                <span>Total: {latency.total_ms}ms</span>
                <span>Embedding: {latency.embedding_ms}ms</span>
                <span>Search: {latency.search_ms}ms</span>
                <span>LLM: {latency.llm_ms}ms</span>
              </div>
            )}

            {/* New search */}
            {!streaming && (
              <button
                onClick={() => { setAnswer(''); setSources([]); setLatency(null); setQuery('') }}
                className="text-sm text-blue-600 hover:underline"
              >
                ← New search
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
