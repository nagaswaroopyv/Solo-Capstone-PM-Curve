import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { CohereClient } from 'cohere-ai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { query } = await request.json()

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 })
  }

  const t0 = Date.now()

  // Step 1: Embed the query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding
  const t1 = Date.now()

  // Step 2: Hybrid search — semantic + keyword combined, fetch top 10 candidates
  const { data: chunks, error } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_count: 10,
  })
  const t2 = Date.now()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // Step 2b: Relevance threshold
  const RELEVANCE_THRESHOLD = 0.30
  const thresholdChunks = chunks.filter((c: any) => c.combined_score >= RELEVANCE_THRESHOLD)

  // Step 2c: Rerank — re-score candidates by true semantic relevance, take top 3
  let relevantChunks = thresholdChunks
  if (thresholdChunks.length > 1) {
    const rerankResponse = await cohere.rerank({
      model: 'rerank-v3.5',
      query,
      documents: thresholdChunks.map((c: any) => c.content),
      topN: 3,
    })
    relevantChunks = rerankResponse.results.map(
      (r: any) => thresholdChunks[r.index]
    )
  }

  // Step 2c: Fetch source_name separately (RPC doesn't reliably return it)
  const chunkIds = relevantChunks.map((c: any) => c.id)
  const { data: sourceNames } = await supabase
    .from('documents')
    .select('id, source_name')
    .in('id', chunkIds)
  const sourceNameMap = Object.fromEntries(
    (sourceNames || []).map((r: any) => [r.id, r.source_name])
  )

  if (relevantChunks.length === 0) {
    const payload = JSON.stringify({
      type: 'done',
      answer: 'I could not find any documents with sufficient relevance to answer this question. Try rephrasing or check if the topic exists in your connected documents.',
      sources: [],
      latency: { embedding_ms: t1 - t0, search_ms: t2 - t1, llm_ms: 0, total_ms: Date.now() - t0 },
    })
    return new Response(payload, { headers: { 'Content-Type': 'application/json' } })
  }

  // Step 3: Stream LLM response
  const context = relevantChunks
    .map((c: any, i: number) => `[${i + 1}] Source: ${c.source_file}\n${c.content}`)
    .join('\n\n')

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for Product Managers. Answer questions using only the provided document chunks. Follow these rules strictly:
- Always cite sources using [1], [2], [3] notation.
- Only state something as a confirmed fact if the document explicitly records it as a decision or commitment.
- If the document describes something as speculative, under consideration, or not yet decided — say so explicitly. Never present uncertain information as fact.
- If the answer is not clearly supported by the provided chunks, say "I could not find a confirmed answer in the available documents." Do not infer or guess.
- Do not perform calculations, derive totals, or aggregate numbers. Only report figures that are explicitly stated in the documents.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      // First send sources immediately so UI can render them while answer streams
      const sourcesPayload = JSON.stringify({
        type: 'sources',
        sources: relevantChunks.map((c: any) => ({
          source_file: c.source_file,
          source_name: sourceNameMap[c.id] || c.source_name,
          content: c.content,
          score: c.combined_score,
        })),
        latency_so_far: { embedding_ms: t1 - t0, search_ms: t2 - t1 },
      })
      controller.enqueue(encoder.encode(sourcesPayload + '\n'))

      // Then stream answer tokens
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content
        if (token) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'token', token }) + '\n'))
        }
      }

      // Finally send latency
      const t3 = Date.now()
      const donePayload = JSON.stringify({
        type: 'done',
        latency: { embedding_ms: t1 - t0, search_ms: t2 - t1, llm_ms: t3 - t2, total_ms: t3 - t0 },
      })
      controller.enqueue(encoder.encode(donePayload + '\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
