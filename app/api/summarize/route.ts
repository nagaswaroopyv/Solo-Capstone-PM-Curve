import { google } from 'googleapis'
import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

const drive = google.drive({ version: 'v3', auth: oauth2Client })

function extractFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

export async function POST(request: NextRequest) {
  const { source_file, source_name } = await request.json()

  const fileId = extractFileId(source_file)
  if (!fileId) {
    return new Response(JSON.stringify({ error: 'Invalid Drive URL' }), { status: 400 })
  }

  // Fetch full document text from Drive
  const res = await drive.files.export({ fileId, mimeType: 'text/plain' }, { responseType: 'text' })
  const text = res.data as string

  if (!text || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Document is empty' }), { status: 400 })
  }

  // Summarize with GPT-4o-mini
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for Product Managers. Summarize the provided document concisely.
- Lead with the document's purpose in one sentence.
- Then list the key decisions, outcomes, or requirements as bullet points.
- Keep the summary under 200 words.
- Do not add information not present in the document.`,
      },
      {
        role: 'user',
        content: `Document: ${source_name}\n\n${text.slice(0, 12000)}`,
      },
    ],
  })

  const summary = completion.choices[0]?.message?.content || 'Could not generate summary.'

  return new Response(JSON.stringify({ summary }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
