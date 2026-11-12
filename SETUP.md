# Forgot-password (OTP) – setup

## 1. Copy files
Unzip over your project root (the folder that contains `src/`). Files marked NEW are added, MODIFIED replace yours.

NEW
- src/app/forgot-password/page.tsx            (enter email)
- src/app/forgot-password/verify/page.tsx     (enter OTP)
- src/app/forgot-password/reset/page.tsx      (new + confirm password)
- src/app/actions/password-reset.ts
- src/lib/auth/password-reset.ts
- src/lib/notify/gmail.ts
- password-reset.sql  (run in Supabase, not part of src)

MODIFIED
- src/app/login/page.tsx        ("Forgot password?" link + success message)
- src/middleware.ts             (/forgot-password is public)
- src/lib/auth-text.ts          (English + Arabic texts)
- src/lib/notify/templates.ts   (OTP email template added at the bottom)

## 2. Database
Supabase -> SQL Editor -> paste `password-reset.sql` -> Run.

## 3. Gmail sending (from your Gmail account)
Gmail cannot be used with the existing Resend setup, so the OTP mail is sent with the Gmail API (HTTPS, works on Cloudflare too).

1. console.cloud.google.com -> create a project -> APIs & Services -> Library -> enable **Gmail API**.
2. OAuth consent screen -> User type External -> add your Gmail as a test user -> then click **Publish app** (set to "In production"). If you leave it in "Testing", the refresh token dies after 7 days.
3. Credentials -> Create credentials -> OAuth client ID -> type **Web application** -> Authorized redirect URI: `https://developers.google.com/oauthplayground` -> copy Client ID + Client Secret.
4. Open https://developers.google.com/oauthplayground -> gear icon -> tick "Use your own OAuth credentials" -> paste the ID/secret.
   Step 1: in the scope box type `https://www.googleapis.com/auth/gmail.send` -> Authorize APIs -> sign in with the Gmail that will SEND the mails.
   Step 2: Exchange authorization code for tokens -> copy the **Refresh token**.
5. Add these environment variables (local `.env.local` AND your hosting dashboard), then redeploy:

```
GMAIL_SENDER=<the exact Gmail address you signed in with>
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_FROM_NAME=Nexiz AI
```
If GMAIL_* are missing the code falls back to your existing Resend sender (`EMAIL_API_KEY`).

## How it works / security
- Same message for known and unknown emails (nobody can discover which emails have accounts).
- Code: 6 digits, valid 10 min, stored only as an HMAC hash, max 5 wrong tries, new code every 60 s at most, only the newest code works, single use.
- After a correct code the browser gets a 15-minute signed cookie; only then can /forgot-password/reset change the password.
- New password uses the same strong-password rule as registration; a successful reset also clears any login lockout.
