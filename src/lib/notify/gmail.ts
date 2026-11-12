import 'server-only';
import type { Message, SendResult } from './index';

/**
 * Sends email FROM a Gmail / Google Workspace mailbox through the Gmail API (plain HTTPS, so it also works on Cloudflare Workers).
 * Env: GMAIL_SENDER (the mailbox), GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, optional GMAIL_FROM_NAME.
 * See SETUP.md for how to create these.
 */
export const gmailConfigured = () =>
  !!(process.env.GMAIL_SENDER && process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN);

let token: { value: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && token.exp > Date.now() + 30_000) return token.value;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!, client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!, grant_type: 'refresh_token',
    }),
  });
  const j = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !j.access_token) throw new Error(`Google token request failed (${res.status} ${j.error ?? ''})`);
  token = { value: j.access_token, exp: Date.now() + (j.expires_in ?? 3000) * 1000 };
  return token.value;
}

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const wrap76 = (s: string) => s.replace(/.{1,76}/g, '$&\r\n').trimEnd();
const word = (s: string) => `=?UTF-8?B?${b64(s)}?=`; // RFC 2047, keeps Arabic / non-ASCII safe in headers
const clean = (s: string) => s.replace(/[\r\n]+/g, ' ');

function mime(m: Message): string {
  const boundary = `nx_${crypto.randomUUID().replace(/-/g, '')}`;
  const from = `${word(process.env.GMAIL_FROM_NAME || 'Nexiz AI')} <${process.env.GMAIL_SENDER}>`;
  return [
    `From: ${from}`, `To: ${clean(m.to)}`, `Subject: ${word(clean(m.subject))}`, 'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`, '',
    `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: base64', '', wrap76(b64(m.text)),
    `--${boundary}`, 'Content-Type: text/html; charset="UTF-8"', 'Content-Transfer-Encoding: base64', '', wrap76(b64(m.html)),
    `--${boundary}--`, '',
  ].join('\r\n');
}

export async function sendGmail(m: Message): Promise<SendResult> {
  try {
    const raw = b64(mime(m)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) {
      console.error('[gmail] send failed', res.status, await res.text().catch(() => ''));
      return { ok: false, channel: 'gmail', note: `Gmail returned ${res.status}` };
    }
    return { ok: true, channel: 'gmail' };
  } catch (e) {
    console.error('[gmail] error', e);
    return { ok: false, channel: 'gmail', note: 'send failed' };
  }
}
