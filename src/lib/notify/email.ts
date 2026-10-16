import 'server-only';
import type { Message, SendResult } from './index';

/**
 * Transactional email through Resend's HTTP API (swap this file for Postmark/SES if you prefer; the interface is the same).
 * Env: EMAIL_API_KEY, EMAIL_FROM (e.g. "Nexiz <no-reply@nexiz.ai>", needs SPF + DKIM on nexiz.ai).
 * TESTING: set EMAIL_TEST_RECIPIENT and every email is redirected to that address. Remove it in production.
 */
export async function sendEmail(m: Message): Promise<SendResult> {
  const key = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Nexiz <onboarding@resend.dev>';
  const testTo = process.env.EMAIL_TEST_RECIPIENT;
  const to = testTo || m.to;
  const banner = testTo ? `<p style="background:#fdf3e3;padding:8px;font-size:12px">TEST MODE - this email was meant for: ${escapeHtml(m.to)}</p>` : '';
  const subject = testTo ? `[TEST] ${m.subject}` : m.subject;
  if (!key) {
    console.warn(`[email] EMAIL_API_KEY is not set. Would have sent to ${to}: ${m.subject}\n${m.text}`);
    return { ok: false, channel: 'email', note: 'EMAIL_API_KEY is not set (link printed in the server log)' };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html: banner + m.html, text: (testTo ? `TEST MODE - meant for ${m.to}\n\n` : '') + m.text }),
  });
  if (!res.ok) {
    console.error('[email] provider error', res.status, await res.text().catch(() => ''));
    return { ok: false, channel: 'email', note: `provider returned ${res.status}` };
  }
  return { ok: true, channel: 'email', note: testTo ? `sent to test address ${testTo}` : undefined };
}

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
