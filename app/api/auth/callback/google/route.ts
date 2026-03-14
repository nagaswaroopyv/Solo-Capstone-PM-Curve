import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code returned from Google' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Test: list first 10 files in Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
    });

    return NextResponse.json({
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      files: res.data.files,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
