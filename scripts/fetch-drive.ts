import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

const drive = google.drive({ version: 'v3', auth: oauth2Client })

async function fetchFirstFile() {
  // List files
  const list = await drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType)',
  })

  const files = list.data.files || []
  console.log(`Found ${files.length} files:\n`)
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f.name} (${f.mimeType})`))

  // Pick the first Google Doc
  const doc = files.find(f => f.mimeType === 'application/vnd.google-apps.document')
  if (!doc) {
    console.log('\nNo Google Docs found.')
    return
  }

  console.log(`\nFetching content of: ${doc.name}`)

  // Export as plain text
  const res = await drive.files.export(
    { fileId: doc.id!, mimeType: 'text/plain' },
    { responseType: 'text' }
  )

  const content = res.data as string
  console.log(`\n--- Content (first 500 chars) ---\n`)
  console.log(content.slice(0, 500))
  console.log(`\n--- Total length: ${content.length} characters ---`)
}

fetchFirstFile().catch(console.error)
