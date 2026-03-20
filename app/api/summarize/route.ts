import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { source_file, source_name } = await request.json()

  // Fetch all chunks for this document from Supabase
  const { data: chunks, error } = await supabase
    .from('documents')
    .select('content')
    .eq('source_file', source_file)
    .order('id')

  if (error || !chunks || chunks.length === 0) {
    return new Response(JSON.stringify({ error: 'No content found for this document.' }), { status: 404 })
  }

  const fullText = chunks.map((c: any) => c.content).join('\n\n')

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
        content: `Document: ${source_name}\n\n${fullText.slice(0, 12000)}`,
      },
    ],
  })

  const summary = completion.choices[0]?.message?.content || 'Could not generate summary.'

  return new Response(JSON.stringify({ summary }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
