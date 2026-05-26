Deploying the Google Apps Script

1. Open https://script.google.com and create a new project.
2. Replace the default Code.gs with the file `Code.gs` in this folder.
3. Edit `SPREADSHEET_ID` at the top of `Code.gs` with your spreadsheet id (the long id from the sheet URL).
4. (Optional) Edit `SHEET_NAME` if you want a specific sheet inside the spreadsheet.
5. Save and choose **Deploy > New deployment**.
   - Select **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone** or **Anyone, even anonymous** (so your dev server can call it).
6. Deploy and copy the Web App URL into your `.env.local` as `GOOGLE_SHEETS_SCRIPT_URL`.

Column mapping (the script appends rows in this exact order):
- Full Name
- Email
- PasswordHash
- Salt
- CreatedAt
- TrialEndsAt
- MembershipStatus
- AppendedAt (timestamp)

If your sheet already has headers, ensure the header row matches these names or adjust accordingly.

After deploying, restart your Next.js server and sign up to validate full data is appended.
