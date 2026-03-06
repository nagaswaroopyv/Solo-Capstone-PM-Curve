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

async function generateGoldenDataset() {
  console.log('Fetching all chunks from Supabase...')

  const { data: chunks, error } = await supabase
    .from('documents')
    .select('id, content, source_file')
    .order('id')

  if (error || !chunks) {
    console.error('Failed to fetch chunks:', error?.message)
    process.exit(1)
  }

  console.log(`Found ${chunks.length} chunks. Generating questions...\n`)

  const goldenDataset: Array<{
    chunk_id: number
    source_file: string
    question: string
    expected_content: string
  }> = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    console.log(`[${i + 1}/${chunks.length}] chunk_id=${chunk.id} — ${chunk.source_file}`)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an evaluator creating a test dataset. Given a document chunk, generate ONE clear, specific question that this chunk directly answers. The question should be answerable ONLY from this chunk. Return just the question — no explanation, no numbering.',
          },
          {
            role: 'user',
            content: `Document chunk:\n\n${chunk.content}`,
          },
        ],
        temperature: 0.3,
      })

      const question = response.choices[0].message.content?.trim()
      if (!question) throw new Error('Empty response')

      goldenDataset.push({
        chunk_id: chunk.id,
        source_file: chunk.source_file,
        question,
        expected_content: chunk.content,
      })

      console.log(`  ✓ "${question.slice(0, 80)}..."`)
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message}`)
    }
  }

  const outputDir = path.join(process.cwd(), 'evals')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

  const outputPath = path.join(outputDir, 'golden-dataset.json')
  fs.writeFileSync(outputPath, JSON.stringify(goldenDataset, null, 2))

  console.log(`\nDone! ${goldenDataset.length} QA pairs saved to evals/golden-dataset.json`)
}

generateGoldenDataset().catch(console.error)
