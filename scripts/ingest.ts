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

// ~400 tokens with ~60 token overlap (1 token ≈ 4 characters)
const CHUNK_SIZE = 1600
const CHUNK_OVERLAP = 240

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = start + CHUNK_SIZE
    const chunk = text.slice(start, end).trim()
    if (chunk.length > 50) chunks.push(chunk)
    start = end - CHUNK_OVERLAP
  }

  return chunks
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

async function ingest() {
  const dataDir = path.join(process.cwd(), 'test-data')
  const files = getAllMarkdownFiles(dataDir)

  console.log(`Found ${files.length} files to ingest\n`)

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const chunks = chunkText(content)
    const sourceFile = path.relative(dataDir, filePath)

    console.log(`Processing: ${sourceFile} — ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i],
      })

      const { error } = await supabase.from('documents').insert({
        content: chunks[i],
        embedding: embeddingResponse.data[0].embedding,
        source_file: sourceFile,
        chunk_index: i,
      })

      if (error) console.error(`  ✗ chunk ${i}: ${error.message}`)
    }

    console.log(`  ✓ done`)
  }

  console.log('\nIngestion complete!')
}

ingest().catch(console.error)
