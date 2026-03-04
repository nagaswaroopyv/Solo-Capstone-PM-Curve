import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { query } = await request.json()

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const t0 = Date.now()

  // Step 1: Embed the query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding
  const t1 = Date.now()

  // Step 2: Hybrid search — semantic + keyword combined
  const { data: chunks, error } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_count: 3,
  })
  const t2 = Date.now()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Step 2b: Relevance threshold — if no chunk scores above 0.80, don't call LLM
  const RELEVANCE_THRESHOLD = 0.50
  const relevantChunks = chunks.filter((c: any) => c.combined_score >= RELEVANCE_THRESHOLD)

  if (relevantChunks.length === 0) {
    return NextResponse.json({
      answer: 'I could not find any documents with sufficient relevance to answer this question. Try rephrasing or check if the topic exists in your connected documents.',
      sources: [],
      latency: { embedding_ms: t1 - t0, search_ms: t2 - t1, llm_ms: 0, total_ms: Date.now() - t0 },
    })
  }

  // Step 3: Pass top chunks + query to GPT-4o mini
  const context = relevantChunks
    .map((c: any, i: number) => `[${i + 1}] Source: ${c.source_file}\n${c.content}`)
    .join('\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for Product Managers. Answer questions using only the provided document chunks. Follow these rules strictly:
- Always cite sources using [1], [2], [3] notation.
- Only state something as a confirmed fact if the document explicitly records it as a decision or commitment.
- If the document describes something as speculative, under consideration, or not yet decided — say so explicitly. Never present uncertain information as fact.
- If the answer is not clearly supported by the provided chunks, say "I could not find a confirmed answer in the available documents." Do not infer or guess.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
  })
  const t3 = Date.now()

  const latency = {
    embedding_ms: t1 - t0,
    search_ms: t2 - t1,
    llm_ms: t3 - t2,
    total_ms: t3 - t0,
  }

  console.log(`[search] query="${query}" | embedding=${latency.embedding_ms}ms | search=${latency.search_ms}ms | llm=${latency.llm_ms}ms | total=${latency.total_ms}ms`)

  // Step 4: Return answer + sources + latency
  return NextResponse.json({
    answer: completion.choices[0].message.content,
    sources: relevantChunks.map((c: any) => ({
      source_file: c.source_file,
      content: c.content,
      score: c.combined_score,
    })),
    latency,
  })
}
