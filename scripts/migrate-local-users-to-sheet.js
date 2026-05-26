// Migration script: push local-users.json to deployed Apps Script endpoint
// Usage: node scripts/migrate-local-users-to-sheet.js

const fs = require('fs/promises');
const path = require('path');

async function getScriptUrl() {
  const envPath = path.join(__dirname, '..', '.env.local');
  try {
    const txt = await fs.readFile(envPath, 'utf8');
    const m = txt.match(/^GOOGLE_SHEETS_SCRIPT_URL\s*=\s*"?([^"\n]+)"?/m);
    if (m) return m[1].trim();
  } catch (err) {}
  throw new Error('.env.local not found or GOOGLE_SHEETS_SCRIPT_URL missing');
}

async function main() {
  const scriptUrl = await getScriptUrl();
  const usersPath = path.join(__dirname, '..', 'data', 'local-users.json');
  const raw = await fs.readFile(usersPath, 'utf8');
  const users = JSON.parse(raw);
  console.log(`Found ${users.length} users, posting to ${scriptUrl}`);

  for (const u of users) {
    const payload = {
      action: 'appendUser',
      user: u,
      fullName: u.fullName,
      email: u.email,
      passwordHash: u.passwordHash,
      salt: u.salt,
      createdAt: u.createdAt,
      trialEndsAt: u.trialEndsAt || '',
      membershipStatus: u.membershipStatus || ''
    };

    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log(`Posted ${u.email} -> ${res.status}: ${text}`);
    } catch (err) {
      console.error('Error posting', u.email, err.message || err);
    }

    // small delay to avoid throttling
    await new Promise(r => setTimeout(r, 250));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
