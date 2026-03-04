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

  // Step 1: Embed the query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  // Step 2: Hybrid search — semantic + keyword combined
  const { data: chunks, error } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: queryEmbedding,
    match_count: 3,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Step 3: Pass top chunks + query to GPT-4o mini
  const context = chunks
    .map((c: any, i: number) => `[${i + 1}] Source: ${c.source_file}\n${c.content}`)
    .join('\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for Product Managers. Answer questions using only the provided document chunks. Always cite sources using [1], [2], [3] notation. If the answer is not in the provided chunks, say so clearly — never make up information.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
  })

  // Step 4: Return answer + sources
  return NextResponse.json({
    answer: completion.choices[0].message.content,
    sources: chunks.map((c: any) => ({
      source_file: c.source_file,
      content: c.content,
      score: c.combined_score,
    })),
  })
}
