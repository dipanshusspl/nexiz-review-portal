'use server';
// Added by Prachi, 2026-11-17: saves the "Request a Demo" form to rv_demo_requests (see sql/015_demo_requests_fix.sql).
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { audit } from '@/lib/audit';
import { isEmail, optional, str } from '@/lib/form';
import { getLang } from '@/lib/i18n';
import { db } from '@/lib/supabase/admin';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitDemo(fd: FormData): Promise<void> {
  const slug = str(fd, 'slug', 120);
  const em = str(fd, 'embed', 1) === '1' ? '&embed=1' : '';   // form was opened in the pop-up: stay in the pop-up
  const back = (key: string): never => redirect(`/request-demo?product=${encodeURIComponent(slug)}&error=${key}${em}`);

  const name = str(fd, 'name', 120), email = str(fd, 'email', 254).toLowerCase(), company = str(fd, 'company', 120);
  const cr = optional(fd, 'cr_number', 20);
  if (!name || !company) back('required');
  if (!isEmail(email)) back('email');
  if (cr && !/^\d{10}$/.test(cr)) back('cr');                     // Saudi CR numbers are 10 digits
  if (fd.get('consent') !== 'on') back('consent');                 // the box starts unchecked, so this only passes if the visitor ticked it

  const { data: sw } = await db().from('rv_software').select('id,slug').eq('slug', slug).maybeSingle();
  if (!sw) back('product');

  const clickRaw = str(fd, 'click', 40);
  const user = await getCurrentUser().catch(() => null);
  const lang = await getLang();
  const now = new Date().toISOString();

  const { data: lead, error } = await db().from('rv_demo_requests').insert({
    software_id: sw!.id, software_slug: sw!.slug, request_type: 'demo',
    name, email, company, cr_number: cr,
    consent_vendor_share: true, consent_at: now,
    cta_click_id: UUID.test(clickRaw) ? clickRaw : null,
    user_id: user?.id ?? null, lang,
  }).select('id,lead_id').single();

  if (error || !lead) { console.error('demo request not saved:', error?.message); back('save'); }
  await audit(user?.id ?? null, 'demo.request', 'rv_demo_requests', lead!.id, { lead_id: lead!.lead_id, software: slug });
  redirect(`/request-demo?product=${encodeURIComponent(slug)}&done=${encodeURIComponent(lead!.lead_id as string)}${em}`);
}