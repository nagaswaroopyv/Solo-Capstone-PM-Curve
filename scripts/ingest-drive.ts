import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

const drive = google.drive({ version: 'v3', auth: oauth2Client })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

async function getAllDriveFiles() {
  const files = []
  let pageToken: string | undefined

  do {
    const res = await drive.files.list({
      pageSize: 100,
      fields: 'nextPageToken, files(id, name, mimeType)',
      ...(pageToken ? { pageToken } : {}),
    })
    files.push(...(res.data.files || []))
    pageToken = res.data.nextPageToken || undefined
  } while (pageToken)

  return files.filter(f => f.mimeType === 'application/vnd.google-apps.document')
}

async function ingestDrive() {
  console.log('Clearing existing Drive documents from Supabase...')
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .like('source_file', 'https://docs.google.com/%')

  if (deleteError) {
    console.error('Delete error:', deleteError.message)
    return
  }

  console.log('Fetching files from Google Drive...\n')
  const files = await getAllDriveFiles()
  console.log(`Found ${files.length} Google Docs\n`)

  let totalChunks = 0

  for (const file of files) {
    const driveUrl = `https://docs.google.com/document/d/${file.id}/edit`

    console.log(`Processing: ${file.name}`)

    // Export as plain text
    const res = await drive.files.export(
      { fileId: file.id!, mimeType: 'text/plain' },
      { responseType: 'text' }
    )

    const content = res.data as string
    const chunks = chunkText(content)
    console.log(`  ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i],
      })

      const { error } = await supabase.from('documents').insert({
        content: chunks[i],
        embedding: embeddingResponse.data[0].embedding,
        source_file: driveUrl,
        source_name: file.name,
        chunk_index: i,
      })

      if (error) console.error(`  ✗ chunk ${i}: ${error.message}`)
    }

    totalChunks += chunks.length
    console.log(`  ✓ done`)
  }

  console.log(`\nIngestion complete! ${files.length} files, ${totalChunks} total chunks`)
}

ingestDrive().catch(console.error)
