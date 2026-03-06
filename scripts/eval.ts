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

const RELEVANCE_THRESHOLD = 0.40
const MATCH_COUNT = 3

interface QAPair {
  chunk_id: number
  source_file: string
  question: string
  expected_content: string
}

interface EvalResult {
  chunk_id: number
  source_file: string
  question: string
  retrieved_count: number
  hit: boolean       // did expected chunk appear in results?
  precision: number  // relevant retrieved / total retrieved
  recall: number     // relevant retrieved / total relevant (always 1 expected)
  f1: number
}

async function runEvals() {
  const datasetPath = path.join(process.cwd(), 'evals', 'golden-dataset.json')
  if (!fs.existsSync(datasetPath)) {
    console.error('golden-dataset.json not found. Run generate-golden-dataset.ts first.')
    process.exit(1)
  }

  const dataset: QAPair[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
  console.log(`Running evals on ${dataset.length} QA pairs...\n`)

  const results: EvalResult[] = []

  for (let i = 0; i < dataset.length; i++) {
    const pair = dataset[i]
    process.stdout.write(`[${i + 1}/${dataset.length}] ${pair.question.slice(0, 60)}... `)

    // Step 1: Embed the question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: pair.question,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 2: Hybrid search
    const { data: chunks, error } = await supabase.rpc('hybrid_search', {
      query_text: pair.question,
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_count: MATCH_COUNT,
    })

    if (error || !chunks) {
      console.log('✗ search error')
      continue
    }

    // Step 3: Apply relevance threshold
    const retrieved = chunks.filter((c: any) => c.combined_score >= RELEVANCE_THRESHOLD)

    // Step 4: Check if expected chunk is in retrieved results (match by content)
    const hit = retrieved.some(
      (c: any) => c.content.trim() === pair.expected_content.trim()
    )

    const relevantRetrieved = hit ? 1 : 0
    const totalRetrieved = retrieved.length
    const totalRelevant = 1 // golden dataset always has exactly 1 expected chunk

    const precision = totalRetrieved === 0 ? 0 : relevantRetrieved / totalRetrieved
    const recall = relevantRetrieved / totalRelevant
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)

    results.push({
      chunk_id: pair.chunk_id,
      source_file: pair.source_file,
      question: pair.question,
      retrieved_count: totalRetrieved,
      hit,
      precision,
      recall,
      f1,
    })

    console.log(`${hit ? '✓ hit' : '✗ miss'} | P=${precision.toFixed(2)} R=${recall.toFixed(2)} F1=${f1.toFixed(2)}`)
  }

  // Aggregate metrics
  const avgPrecision = results.reduce((s, r) => s + r.precision, 0) / results.length
  const avgRecall = results.reduce((s, r) => s + r.recall, 0) / results.length
  const avgF1 = results.reduce((s, r) => s + r.f1, 0) / results.length
  const hitRate = results.filter(r => r.hit).length / results.length

  console.log('\n' + '='.repeat(50))
  console.log('EVAL RESULTS')
  console.log('='.repeat(50))
  console.log(`Total queries:     ${results.length}`)
  console.log(`Hit rate:          ${(hitRate * 100).toFixed(1)}%`)
  console.log(`Avg Precision:     ${avgPrecision.toFixed(3)}`)
  console.log(`Avg Recall:        ${avgRecall.toFixed(3)}`)
  console.log(`Avg F1:            ${avgF1.toFixed(3)}`)

  // Save detailed results
  const outputPath = path.join(process.cwd(), 'evals', 'eval-results.json')
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ summary: { avgPrecision, avgRecall, avgF1, hitRate }, results }, null, 2)
  )
  console.log(`\nDetailed results saved to evals/eval-results.json`)
}

runEvals().catch(console.error)
