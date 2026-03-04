'use client'

import { useState } from 'react'

interface Source {
  source_file: string
  content: string
  score: number
}

interface SearchResult {
  answer: string
  sources: Source[]
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  async function handleSearch(searchQuery: string = query) {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setResult(data)
      setRecentSearches(prev =>
        [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5)
      )
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

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
        {recentSearches.length > 0 && !result && !loading && (
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
        {result && (
          <div className="mt-8 space-y-6">
            {/* Answer */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3">Answer</p>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>
            </div>

            {/* Sources */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Sources</p>
              <div className="space-y-3">
                {result.sources.map((source, i) => (
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

            {/* New search */}
            <button
              onClick={() => { setResult(null); setQuery('') }}
              className="text-sm text-blue-600 hover:underline"
            >
              ← New search
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
