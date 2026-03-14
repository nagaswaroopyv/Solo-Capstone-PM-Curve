import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const questions = [
  'What is the new monthly price for the Starter plan effective February 1, 2026?',
  'What is the earliest start date for the AI Lead Scoring Engine?',
  'What was the decision made regarding the Workflow Automation Engine on November 12, 2025?',
]

async function main() {
  for (const q of questions) {
    console.log(`\nQ: ${q}`)
    const emb = await openai.embeddings.create({ model: 'text-embedding-3-small', input: q })
    const { data } = await supabase.rpc('hybrid_search', {
      query_text: q,
      query_embedding: `[${emb.data[0].embedding.join(',')}]`,
      match_count: 5,
    })
    data?.forEach((c: any) => {
      console.log(`  score=${c.combined_score.toFixed(3)} | ${c.source_file}`)
    })
  }
}

main().catch(console.error)
