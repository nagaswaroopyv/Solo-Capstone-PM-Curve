import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RELEVANCE_THRESHOLD = 0.30
const MATCH_COUNT = 3

interface QAPair {
  chunk_id: string
  source_file: string
  question: string
  expected_content: string
}

interface JudgeResult {
  question: string
  source_file: string
  answer: string
  faithfulness: number       // 1-5: is every claim in the answer supported by the chunks?
  answer_relevance: number   // 1-5: does the answer actually address the question?
  faithfulness_reason: string
  answer_relevance_reason: string
}

async function getAnswerFromRAG(question: string): Promise<{ answer: string; chunks: string[] } | null> {
  // Embed the question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  // Hybrid search
  const { data: chunks, error } = await supabase.rpc('hybrid_search', {
    query_text: question,
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_count: MATCH_COUNT,
  })

  if (error || !chunks) return null

  // Apply threshold
  const relevant = chunks.filter((c: any) => c.combined_score >= RELEVANCE_THRESHOLD)
  if (relevant.length === 0) return null

  const context = relevant
    .map((c: any, i: number) => `[${i + 1}] Source: ${c.source_file}\n${c.content}`)
    .join('\n\n')

  // Generate answer
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for Product Managers. Answer questions using only the provided document chunks. Follow these rules strictly:
- Always cite sources using [1], [2], [3] notation.
- Only state something as a confirmed fact if the document explicitly records it as a decision or commitment.
- If the document describes something as speculative, under consideration, or not yet decided — say so explicitly.
- If the answer is not clearly supported by the provided chunks, say "I could not find a confirmed answer in the available documents." Do not infer or guess.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  })

  const answer = completion.choices[0].message.content ?? ''
  const chunkTexts = relevant.map((c: any) => c.content)

  return { answer, chunks: chunkTexts }
}

async function judgeAnswer(
  question: string,
  answer: string,
  chunks: string[]
): Promise<{ faithfulness: number; faithfulness_reason: string; answer_relevance: number; answer_relevance_reason: string }> {
  const chunksText = chunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an evaluation judge for a RAG system. Score the answer on two dimensions.

FAITHFULNESS (1-5): Is every claim in the answer supported by the retrieved chunks?
- 5: All claims are directly supported by the chunks. No hallucinations.
- 3: Most claims supported, minor unsupported details.
- 1: Major claims not supported by chunks. Significant hallucination.

ANSWER RELEVANCE (1-5): Does the answer actually address the question asked?
- 5: Directly and completely answers the question.
- 3: Partially answers but misses key aspects.
- 1: Does not answer the question asked.

Return JSON with keys: faithfulness, faithfulness_reason, answer_relevance, answer_relevance_reason`,
      },
      {
        role: 'user',
        content: `QUESTION: ${question}

RETRIEVED CHUNKS:
${chunksText}

ANSWER:
${answer}`,
      },
    ],
  })

  return JSON.parse(completion.choices[0].message.content ?? '{}')
}

async function runLLMJudge() {
  const datasetPath = path.join(process.cwd(), 'evals', 'golden-dataset.json')
  if (!fs.existsSync(datasetPath)) {
    console.error('golden-dataset.json not found.')
    process.exit(1)
  }

  const dataset: QAPair[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))

  // Run on a sample of 20 to keep cost/time reasonable
  const sample = dataset.slice(0, 20)
  console.log(`Running LLM-as-judge eval on ${sample.length} questions...\n`)

  const results: JudgeResult[] = []
  let skipped = 0

  for (let i = 0; i < sample.length; i++) {
    const pair = sample[i]
    process.stdout.write(`[${i + 1}/${sample.length}] ${pair.question.slice(0, 60)}... `)

    const ragResult = await getAnswerFromRAG(pair.question)

    if (!ragResult) {
      console.log('skipped (no chunks retrieved)')
      skipped++
      continue
    }

    const scores = await judgeAnswer(pair.question, ragResult.answer, ragResult.chunks)

    results.push({
      question: pair.question,
      source_file: pair.source_file,
      answer: ragResult.answer,
      faithfulness: scores.faithfulness,
      faithfulness_reason: scores.faithfulness_reason,
      answer_relevance: scores.answer_relevance,
      answer_relevance_reason: scores.answer_relevance_reason,
    })

    console.log(`faithfulness=${scores.faithfulness}/5  relevance=${scores.answer_relevance}/5`)
  }

  // Aggregate
  const avgFaithfulness = results.reduce((s, r) => s + r.faithfulness, 0) / results.length
  const avgRelevance = results.reduce((s, r) => s + r.answer_relevance, 0) / results.length

  console.log('\n' + '='.repeat(50))
  console.log('LLM-AS-JUDGE RESULTS')
  console.log('='.repeat(50))
  console.log(`Questions evaluated: ${results.length}`)
  console.log(`Skipped (no retrieval): ${skipped}`)
  console.log(`Avg Faithfulness:    ${avgFaithfulness.toFixed(2)} / 5`)
  console.log(`Avg Answer Relevance: ${avgRelevance.toFixed(2)} / 5`)

  const outputPath = path.join(process.cwd(), 'evals', 'llm-judge-results.json')
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ summary: { avgFaithfulness, avgRelevance, evaluated: results.length, skipped }, results }, null, 2)
  )
  console.log(`\nDetailed results saved to evals/llm-judge-results.json`)
}

runLLMJudge().catch(console.error)
