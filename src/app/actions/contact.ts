'use server';
// Added by Prachi, 2026-11-17: saves the "Contact Vendor" form (pricing / info / general) to rv_demo_requests.
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { audit } from '@/lib/audit';
import { isEmail, optional, str } from '@/lib/form';
import { getLang } from '@/lib/i18n';
import { knownBusiness } from '@/lib/lead-profile';
import { rangeValues } from '@/lib/lead-ranges';
import { db } from '@/lib/supabase/admin';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPTIONS = ['pricing', 'info', 'general'];

export async function submitContact(fd: FormData): Promise<void> {
  const slug = str(fd, 'slug', 120);
  const option = str(fd, 'option', 20);
  const em = str(fd, 'embed', 1) === '1' ? '&embed=1' : '';   // form was opened in the pop-up: stay in the pop-up
  const path = `/contact-vendor/${OPTIONS.includes(option) ? option : 'general'}`;
  const back = (key: string): never => redirect(`${path}?product=${encodeURIComponent(slug)}&error=${key}${em}`);

  if (!OPTIONS.includes(option)) back('option');
  const name = str(fd, 'name', 120), email = str(fd, 'email', 254).toLowerCase(), company = str(fd, 'company', 120);
  const cr = optional(fd, 'cr_number', 20);
  if (!name || !company) back('required');
  if (!isEmail(email)) back('email');
  if (cr && !/^\d{10}$/.test(cr)) back('cr');
  if (fd.get('consent') !== 'on') back('consent');

  const { data: sw } = await db().from('rv_software').select('id,slug').eq('slug', slug).maybeSingle();
  if (!sw) back('product');

  const user = await getCurrentUser().catch(() => null);

  // Pricing: the four business details. If we already hold them for this logged-in user, use those (the form did not ask).
  let biz: { branches_count: string | null; system_users_count: string | null; employees_count: string | null; business_activity: string | null } =
    { branches_count: null, system_users_count: null, employees_count: null, business_activity: null };
  if (option === 'pricing') {
    const known = user ? await knownBusiness(user.id) : null;
    const pick = (k: 'branches' | 'system_users' | 'employees'): string | null => { const v = str(fd, k, 12); return rangeValues(k).includes(v) ? v : null; };
    biz = known ?? { branches_count: pick('branches'), system_users_count: pick('system_users'), employees_count: pick('employees'), business_activity: optional(fd, 'business_activity', 120) };
    if (biz.branches_count == null || biz.system_users_count == null || biz.employees_count == null || !biz.business_activity) back('pricing');
  }

  const clickRaw = str(fd, 'click', 40);
  const lang = await getLang();
  const { data: lead, error } = await db().from('rv_demo_requests').insert({
    software_id: sw!.id, software_slug: sw!.slug, request_type: option,
    name, email, company, cr_number: cr, message: optional(fd, 'message', 1000),
    ...biz,
    consent_vendor_share: true, consent_at: new Date().toISOString(),
    cta_click_id: UUID.test(clickRaw) ? clickRaw : null,
    user_id: user?.id ?? null, lang,
  }).select('id,lead_id').single();

  if (error || !lead) { console.error('contact request not saved:', error?.message); back('save'); }
  await audit(user?.id ?? null, `contact.${option}`, 'rv_demo_requests', lead!.id, { lead_id: lead!.lead_id, software: slug });
  redirect(`${path}?product=${encodeURIComponent(slug)}&done=${encodeURIComponent(lead!.lead_id as string)}${em}`);
}