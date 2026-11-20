'use server';
// Added 2026-11-19: the "static" Request a Demo / Contact Vendor flow.
// The pop-up form now opens at once (no iframe, no redirect). These two server actions work in the background:
//   logCtaClick  - writes the rv_cta_clicks row (what /go/demo and /go/contact did) and returns its id
//   submitLead   - saves the form to rv_demo_requests (same checks as actions/demo.ts and actions/contact.ts) and returns the Lead ID
// Nothing is redirected: the pop-up shows "Request sent" itself. The old /go/* routes and pages are left as they were.
import { getCurrentUser } from '@/lib/auth/current-user';
import { audit } from '@/lib/audit';
import { isEmail, optional, str } from '@/lib/form';
import { getLang } from '@/lib/i18n';
import { knownBusiness } from '@/lib/lead-profile';
import { rangeValues } from '@/lib/lead-ranges';
import { db } from '@/lib/supabase/admin';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPTIONS = ['pricing', 'info', 'general'];

export type LeadResult = { ok: true; leadId: string } | { ok: false; error: string };

/** One row in rv_cta_clicks. A failed log never matters to the visitor, so this returns null instead of throwing. */
export async function logCtaClick(input: { slug: string; cta: 'demo' | 'contact_vendor'; option?: string }): Promise<string | null> {
  try {
    const slug = String(input.slug ?? '').trim().slice(0, 120);
    if (!slug) return null;
    const cta = input.cta === 'contact_vendor' ? 'contact_vendor' : 'demo';
    const [{ data: sw }, user, lang] = await Promise.all([
      db().from('rv_software').select('id').eq('slug', slug).maybeSingle(),
      getCurrentUser().catch(() => null),
      getLang(),
    ]);
    const row: Record<string, unknown> = { software_id: sw?.id ?? null, software_slug: slug, cta, user_id: user?.id ?? null, lang };
    if (cta === 'contact_vendor') row.option = OPTIONS.includes(input.option ?? '') ? input.option : 'general';
    const { data, error } = await db().from('rv_cta_clicks').insert(row).select('id').single();
    if (error) { console.error('cta click not written:', error.message); return null; }
    return (data?.id as string) ?? null;
  } catch (e) {
    console.error('cta click not written:', e);
    return null;
  }
}

/** Saves the demo form (kind=demo) or the contact-vendor form (kind=contact, with option). */
export async function submitLead(fd: FormData): Promise<LeadResult> {
  const kind = str(fd, 'kind', 10) === 'contact' ? 'contact' : 'demo';
  const option = kind === 'contact' ? str(fd, 'option', 20) : 'demo';
  if (kind === 'contact' && !OPTIONS.includes(option)) return { ok: false, error: 'option' };

  const slug = str(fd, 'slug', 120);
  const name = str(fd, 'name', 120), email = str(fd, 'email', 254).toLowerCase(), company = str(fd, 'company', 120);
  const cr = optional(fd, 'cr_number', 20);
  if (!name || !company) return { ok: false, error: 'required' };
  if (!isEmail(email)) return { ok: false, error: 'email' };
  if (cr && !/^\d{10}$/.test(cr)) return { ok: false, error: 'cr' };       // Saudi CR numbers are 10 digits
  if (fd.get('consent') !== 'on') return { ok: false, error: 'consent' };   // the box starts unchecked

  try {
    const [{ data: sw }, user, lang] = await Promise.all([
      db().from('rv_software').select('id,slug').eq('slug', slug).maybeSingle(),
      getCurrentUser().catch(() => null),
      getLang(),
    ]);
    if (!sw) return { ok: false, error: 'product' };

    // Pricing: the four business details. If we already hold them for this logged-in user, use those.
    let biz: { branches_count: string | null; system_users_count: string | null; employees_count: string | null; business_activity: string | null } =
      { branches_count: null, system_users_count: null, employees_count: null, business_activity: null };
    if (option === 'pricing') {
      const known = user ? await knownBusiness(user.id) : null;
      const pick = (k: 'branches' | 'system_users' | 'employees'): string | null => { const v = str(fd, k, 12); return rangeValues(k).includes(v) ? v : null; };
      biz = known ?? { branches_count: pick('branches'), system_users_count: pick('system_users'), employees_count: pick('employees'), business_activity: optional(fd, 'business_activity', 120) };
      if (biz.branches_count == null || biz.system_users_count == null || biz.employees_count == null || !biz.business_activity) return { ok: false, error: 'pricing' };
    }

    const clickRaw = str(fd, 'click', 40);
    const { data: lead, error } = await db().from('rv_demo_requests').insert({
      software_id: sw.id, software_slug: sw.slug, request_type: option,
      name, email, company, cr_number: cr,
      ...(kind === 'contact' ? { message: optional(fd, 'message', 1000), ...biz } : {}),
      consent_vendor_share: true, consent_at: new Date().toISOString(),
      cta_click_id: UUID.test(clickRaw) ? clickRaw : null,
      user_id: user?.id ?? null, lang,
    }).select('id,lead_id').single();
    if (error || !lead) { console.error('lead not saved:', error?.message); return { ok: false, error: 'save' }; }

    try { await audit(user?.id ?? null, kind === 'contact' ? `contact.${option}` : 'demo.request', 'rv_demo_requests', lead.id, { lead_id: lead.lead_id, software: slug }); }
    catch (e) { console.error('audit not written:', e); }   // the lead is already saved, do not fail the visitor
    return { ok: true, leadId: lead.lead_id as string };
  } catch (e) {
    console.error('lead not saved:', e);
    return { ok: false, error: 'save' };
  }
}