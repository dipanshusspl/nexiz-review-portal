import 'server-only';
import { headers } from 'next/headers';
import { sendEmail } from './email';

export type Message = { to: string; subject: string; html: string; text: string };
export type SendResult = { ok: boolean; channel: string; note?: string };

/**
 * Channel setting (env NOTIFY_CHANNEL, default "email"). SMS and the WhatsApp Business API plug in here later
 * by adding an adapter below; no calling code has to change.
 */
const ADAPTERS: Record<string, (m: Message) => Promise<SendResult>> = {
  email: sendEmail,
  // sms: sendSms,           // needs a registered sender ID in Saudi Arabia (deferred by the client)
  // whatsapp: sendWhatsapp, // WhatsApp Business API (later)
};

export async function notify(msg: Message): Promise<SendResult> {
  const channel = (process.env.NOTIFY_CHANNEL ?? 'email').toLowerCase();
  const adapter = ADAPTERS[channel];
  if (!adapter) return { ok: false, channel, note: `Channel "${channel}" is not implemented yet.` };
  try { return await adapter(msg); } catch (e) { console.error('notify failed', e); return { ok: false, channel, note: 'send failed' }; }
}

/** Public base URL for links inside emails. Set NEXT_PUBLIC_SITE_URL in production. */
export async function siteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/** Pre-filled wa.me link so the field agent can send the confirmation link with one tap. Saudi mobiles starting 05 become 9665... */
export function whatsappLink(mobile: string, text: string): string {
  let d = mobile.replace(/[^\d]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('05') && d.length === 10) d = '966' + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
