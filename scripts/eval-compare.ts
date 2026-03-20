import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { CohereClient } from 'cohere-ai'
import * as fs from 'fs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RELEVANCE_THRESHOLD = 0.30

// Your 19 manual eval questions + manual scores
const manualEval = [
  { question: 'Who facilitated the Sprint 2 Retrospective?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'What was the outcome of the beta customer selection on February 3rd?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'Which model is used by the AI Reply Engine?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'What is the file name of the Workflow Automation PRD?', manual_faith: 5, manual_ar: 3, manual_hall: 'Y', manual_pass: 'Partial Pass' },
  { question: 'What were the top customer feature requests and which made it into Q1 scope?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'Why did we prioritize Workflow Automation over Customer 360 in Q2 and was there any pushback?', manual_faith: 5, manual_ar: 2, manual_hall: 'Y', manual_pass: 'Fail' },
  { question: 'What are the three architecture options for AI Lead Scoring and which one was selected?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'What is the total engineering effort in story points for the Dashboard Builder broken down by epic?', manual_faith: 5, manual_ar: 0, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'Across the build vs buy analysis for the Workflow Engine which option had the better cost-to-timeline ratio?', manual_faith: 5, manual_ar: 0, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'What is the projected compute cost for the hybrid AI Lead Scoring approach in Year 1?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'How did delivery problems in the last sprint affect what we committed to stakeholders?', manual_faith: 3, manual_ar: 3, manual_hall: 'Y', manual_pass: 'Partial Pass' },
  { question: 'How does the system make sure the AI doesn\'t fabricate information in its answers?', manual_faith: 0, manual_ar: 0, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'How are we handling the situation where a new customer doesn\'t have enough historical data for the scoring model?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'Across all Q1 PRDs what NFR targets are defined and do any of them conflict?', manual_faith: 0, manual_ar: 0, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'What open questions remain unresolved across Q1 initiatives as of the latest documents?', manual_faith: 5, manual_ar: 5, manual_hall: 'N', manual_pass: 'Pass' },
  { question: 'Why did Aisha Patel recommend a 2 week delay for the launch of the Facebook Messenger', manual_faith: 5, manual_ar: 1, manual_hall: 'Y', manual_pass: 'Fail' },
  { question: 'What are the social jobs to be done for Dashboard builder?', manual_faith: 5, manual_ar: 2, manual_hall: 'Y', manual_pass: 'Fail' },
  { question: 'What are the two dependencies of the custom dashboard builder', manual_faith: 3, manual_ar: 5, manual_hall: 'N', manual_pass: 'Partial Pass' },
  { question: "What's the story with the inbox?", manual_faith: 2, manual_ar: 3, manual_hall: 'Y', manual_pass: 'Fail' },
]

async function getAnswerFromRAG(question: string): Promise<{ answer: string; chunks: string[] } | null> {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  const { data: chunks, error } = await supabase.rpc('hybrid_search', {
    query_text: question,
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_count: 10,
  })

  if (error || !chunks) return null

  const thresholdChunks = chunks.filter((c: any) => c.combined_score >= RELEVANCE_THRESHOLD)
  if (thresholdChunks.length === 0) return null

  // Rerank
  let relevantChunks = thresholdChunks
  if (thresholdChunks.length > 1) {
    const rerankResponse = await cohere.rerank({
      model: 'rerank-v3.5',
      query: question,
      documents: thresholdChunks.map((c: any) => c.content),
      topN: 3,
    })
    relevantChunks = rerankResponse.results.map((r: any) => thresholdChunks[r.index])
  }

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
- If the answer is not clearly supported by the provided chunks, say "I could not find a confirmed answer in the available documents." Do not infer or guess.
- Do not perform calculations, derive totals, or aggregate numbers. Only report figures that are explicitly stated in the documents.`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  })

  const answer = completion.choices[0].message.content ?? ''
  return { answer, chunks: relevantChunks.map((c: any) => c.content) }
}

async function judgeAnswer(question: string, answer: string, chunks: string[]) {
  const chunksText = chunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an evaluation judge for a RAG system. Score the answer on two dimensions.

FAITHFULNESS (1-5): Is every claim in the answer supported by the retrieved chunks?
- 5: All claims directly supported. No hallucinations.
- 3: Most claims supported, minor unsupported details.
- 1: Major claims not supported. Significant hallucination.

ANSWER RELEVANCE (1-5): Does the answer actually address the question asked?
- 5: Directly and completely answers the question.
- 3: Partially answers but misses key aspects.
- 1: Does not answer the question asked.

Return JSON: { "faithfulness": number, "faithfulness_reason": string, "answer_relevance": number, "answer_relevance_reason": string }`,
      },
      {
        role: 'user',
        content: `QUESTION: ${question}\n\nRETRIEVED CHUNKS:\n${chunksText}\n\nANSWER:\n${answer}`,
      },
    ],
  })

  return JSON.parse(completion.choices[0].message.content ?? '{}')
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

async function run() {
  console.log('Running auto eval on 19 questions...\n')

  const results: any[] = []

  for (let i = 0; i < manualEval.length; i++) {
    const item = manualEval[i]
    process.stdout.write(`[${i + 1}/19] ${item.question.slice(0, 55)}... `)

    let ragResult: { answer: string; chunks: string[] } | null = null
    try {
      ragResult = await withTimeout(getAnswerFromRAG(item.question), 25000)
    } catch (e: any) {
      console.log('TIMEOUT/ERROR — skipping')
      results.push({ question: item.question, auto_faith: 'TIMEOUT', auto_ar: 'TIMEOUT', manual_faith: item.manual_faith, manual_ar: item.manual_ar, manual_hall: item.manual_hall, manual_pass: item.manual_pass, faith_diff: 'N/A', ar_diff: 'N/A' })
      fs.writeFileSync('evals/eval-compare-results.json', JSON.stringify({ results }, null, 2))
      continue
    }

    if (!ragResult) {
      console.log('GRACEFUL FAILURE (no chunks retrieved)')
      results.push({
        question: item.question,
        auto_faith: 'N/A',
        auto_ar: 'N/A',
        auto_faith_reason: 'No chunks retrieved',
        auto_ar_reason: 'No chunks retrieved',
        manual_faith: item.manual_faith,
        manual_ar: item.manual_ar,
        manual_hall: item.manual_hall,
        manual_pass: item.manual_pass,
        faith_diff: 'N/A',
        ar_diff: 'N/A',
      })
      continue
    }

    let scores: any = {}
    try {
      scores = await withTimeout(judgeAnswer(item.question, ragResult.answer, ragResult.chunks), 25000)
    } catch (e) {
      console.log('JUDGE TIMEOUT — skipping')
      results.push({ question: item.question, auto_faith: 'TIMEOUT', auto_ar: 'TIMEOUT', manual_faith: item.manual_faith, manual_ar: item.manual_ar, manual_hall: item.manual_hall, manual_pass: item.manual_pass, faith_diff: 'N/A', ar_diff: 'N/A' })
      fs.writeFileSync('evals/eval-compare-results.json', JSON.stringify({ results }, null, 2))
      continue
    }

    const faithDiff = typeof scores.faithfulness === 'number' ? scores.faithfulness - item.manual_faith : 'N/A'
    const arDiff = typeof scores.answer_relevance === 'number' ? scores.answer_relevance - item.manual_ar : 'N/A'

    const faithSign = typeof faithDiff === 'number' && faithDiff > 0 ? '+' : ''
    const arSign = typeof arDiff === 'number' && arDiff > 0 ? '+' : ''
    console.log(`auto F=${scores.faithfulness}/5 AR=${scores.answer_relevance}/5  |  manual F=${item.manual_faith}/5 AR=${item.manual_ar}/5  |  diff F=${faithSign}${faithDiff} AR=${arSign}${arDiff}`)

    results.push({
      question: item.question,
      auto_faith: scores.faithfulness,
      auto_ar: scores.answer_relevance,
      auto_faith_reason: scores.faithfulness_reason,
      auto_ar_reason: scores.answer_relevance_reason,
      manual_faith: item.manual_faith,
      manual_ar: item.manual_ar,
      manual_hall: item.manual_hall,
      manual_pass: item.manual_pass,
      faith_diff: faithDiff,
      ar_diff: arDiff,
    })
    // Save after every question
    fs.writeFileSync('evals/eval-compare-results.json', JSON.stringify({ results }, null, 2))
  }

  // Aggregate auto scores (excluding graceful failures)
  const scored = results.filter(r => r.auto_faith !== 'N/A')
  const avgAutoFaith = scored.reduce((s, r) => s + r.auto_faith, 0) / scored.length
  const avgAutoAR = scored.reduce((s, r) => s + r.auto_ar, 0) / scored.length
  const avgManualFaith = scored.reduce((s, r) => s + r.manual_faith, 0) / scored.length
  const avgManualAR = scored.reduce((s, r) => s + r.manual_ar, 0) / scored.length

  console.log('\n' + '='.repeat(60))
  console.log('COMPARISON SUMMARY (excluding graceful failures)')
  console.log('='.repeat(60))
  console.log(`                  AUTO     MANUAL    DIFF`)
  console.log(`Faithfulness:     ${avgAutoFaith.toFixed(2)}/5   ${avgManualFaith.toFixed(2)}/5   ${(avgAutoFaith - avgManualFaith) > 0 ? '+' : ''}${(avgAutoFaith - avgManualFaith).toFixed(2)}`)
  console.log(`Answer Relevance: ${avgAutoAR.toFixed(2)}/5   ${avgManualAR.toFixed(2)}/5   ${(avgAutoAR - avgManualAR) > 0 ? '+' : ''}${(avgAutoAR - avgManualAR).toFixed(2)}`)

  fs.writeFileSync('evals/eval-compare-results.json', JSON.stringify({ summary: { avgAutoFaith, avgAutoAR, avgManualFaith, avgManualAR }, results }, null, 2))
  console.log('\nDetailed results saved to evals/eval-compare-results.json')
}

run().catch(console.error)
