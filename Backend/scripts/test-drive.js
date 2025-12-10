// Quick Google Drive connectivity test
// Usage: node scripts/test-drive.js
// Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
// Optional: GOOGLE_DRIVE_FOLDER_ID to scope listing

const { google } = require('googleapis');

async function main() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    console.error('Missing Google credentials. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    // Verify token works
    await drive.files.list({ pageSize: 1 });
    console.log('✅ Drive auth OK');
  } catch (err) {
    console.error('❌ Drive auth failed:', err.message);
    process.exit(1);
  }

  try {
    const listParams = {
      pageSize: 10,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime)',
      q: GOOGLE_DRIVE_FOLDER_ID ? `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false` : 'trashed = false'
    };

    const { data } = await drive.files.list(listParams);
    if (!data.files || data.files.length === 0) {
      console.log('⚠️ No files found in Drive (check folder ID or uploads)');
    } else {
      console.log('📂 Files:');
      data.files.forEach((f) => {
        console.log(`- ${f.name} (${f.id}) type=${f.mimeType}`);
        console.log(`  webViewLink: ${f.webViewLink}`);
        console.log(`  webContentLink: ${f.webContentLink}`);
      });
    }
  } catch (err) {
    console.error('❌ Drive list failed:', err.message);
    process.exit(1);
  }
}

main();
