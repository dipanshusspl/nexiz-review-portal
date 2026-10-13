import 'server-only';
import { db, IMAGE_BUCKET } from '@/lib/supabase/admin';
import type { CurrentUser } from '@/lib/auth/current-user';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
type Opt = { code: string; ar: string; en: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isOther = (code: string) => code.toLowerCase() === 'other';

export class ExpertInputError extends Error {}

/* --------------------------------------------------------------------------------------------
 * Small helpers
 * ------------------------------------------------------------------------------------------ */
const obj = (v: unknown): Row => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Row) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const txt = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const nul = (s: string): string | null => s || null;
const normalize = (s: string) => s.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');

function rating(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}
function year(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1950 && n <= 2100 ? n : null;
}
function httpUrl(v: unknown, max = 400): string | null {
  const s = txt(v, max);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString().slice(0, max) : null;
  } catch { return null; }
}

async function all(table: string, cols: string, order = 'sort_order'): Promise<Row[]> {
  const { data, error } = await db().from(table).select(cols).order(order);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as unknown as Row[];
}

/* --------------------------------------------------------------------------------------------
 * Lookups (small tables that rarely change, cached for 30 s per server instance)
 * ------------------------------------------------------------------------------------------ */
type Lookups = {
  roles: Opt[]; experience: Opt[]; expertise: Opt[]; services: Opt[];
  countries: (Opt & { id: string })[]; cities: (Opt & { id: string; country_id: string })[];
  options: (Opt & { group_code: string })[];
};
let lkCache: { at: number; data: Lookups } | null = null;

const opt = (r: Row): Opt => ({ code: r.code, ar: r.name_ar, en: r.name_en });

async function lookups(): Promise<Lookups> {
  if (lkCache && Date.now() - lkCache.at < 30_000) return lkCache.data;
  const [roles, experience, expertise, services, countries, cities, options] = await Promise.all([
    all('rv_lk_professional_roles', 'code,name_en,name_ar'),
    all('rv_lk_experience_ranges', 'code,name_en,name_ar'),
    all('rv_lk_expertise_areas', 'code,name_en,name_ar'),
    all('rv_lk_services', 'code,name_en,name_ar'),
    all('rv_lk_countries', 'id,code,name_en,name_ar'),
    all('rv_lk_cities', 'id,country_id,code,name_en,name_ar'),
    all('rv_lk_options', 'code,group_code,name_en,name_ar'),
  ]);
  const data: Lookups = {
    roles: roles.map(opt), experience: experience.map(opt), expertise: expertise.map(opt), services: services.map(opt),
    countries: countries.map((r) => ({ ...opt(r), id: r.id })),
    cities: cities.map((r) => ({ ...opt(r), id: r.id, country_id: r.country_id })),
    options: options.map((r) => ({ ...opt(r), group_code: r.group_code })),
  };
  lkCache = { at: Date.now(), data };
  return data;
}

/* --------------------------------------------------------------------------------------------
 * Catalog sent to the browser: categories, software and every dropdown list
 * ------------------------------------------------------------------------------------------ */
export async function loadCatalog() {
  const [lk, cats, sw] = await Promise.all([
    lookups(),
    all('rv_categories', 'id,name_en,name_ar'),
    all('rv_software', 'id,category_id,name'),
  ]);
  const OPTIONS: Record<string, Opt[]> = {
    professional_role: lk.roles, experience: lk.experience, expertise: lk.expertise, service: lk.services,
    country: lk.countries.filter((c) => !isOther(c.code)).map(({ code, ar, en }) => ({ code, ar, en })),
  };
  for (const o of lk.options) (OPTIONS[o.group_code] ??= []).push({ code: o.code, ar: o.ar, en: o.en });

  const countryCode = new Map(lk.countries.map((c) => [c.id, c.code]));
  const CITIES: Record<string, Opt[]> = {};
  for (const c of lk.cities) {
    const cc = countryCode.get(c.country_id);
    if (!cc || isOther(c.code)) continue;
    (CITIES[cc] ??= []).push({ code: c.code, ar: c.ar, en: c.en });
  }
  const SOFTWARE: Record<string, { id: string; ar: string; en: string }[]> = {};
  for (const s of sw) (SOFTWARE[s.category_id] ??= []).push({ id: s.id, ar: s.name, en: s.name });

  return {
    CATEGORIES: cats.map((c) => ({ id: c.id, ar: c.name_ar || c.name_en, en: c.name_en })),
    SOFTWARE, OPTIONS, CITIES,
  };
}

/* --------------------------------------------------------------------------------------------
 * Load the saved profile in the exact shape the screen's script expects
 * ------------------------------------------------------------------------------------------ */
export async function loadExpertState(user: CurrentUser) {
  const lk = await lookups();
  const blank = {
    saved: false, status: 'draft',
    profile: { language: 'ar', full_name: user.fullName, email: user.email },
    selected: [] as string[], extras: [] as Row[], values: {} as Row,
    certificates: [] as Row[], projects: [] as Row[], avatar: '', specialties: [] as string[], services: [] as string[],
  };

  const { data: p, error } = await db().from('rv_expert_profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!p) return blank;

  const [exp, svc, certs, projs, revs, cats] = await Promise.all([
    db().from('rv_expert_profile_expertise').select('expertise_code,other_text').eq('profile_id', p.id),
    db().from('rv_expert_profile_services').select('service_code,other_text').eq('profile_id', p.id),
    db().from('rv_expert_certificates').select('*').eq('profile_id', p.id).order('sort_order'),
    db().from('rv_expert_projects').select('*').eq('profile_id', p.id).order('sort_order'),
    db().from('rv_expert_software_reviews').select('*').eq('profile_id', p.id).order('sort_order'),
    all('rv_categories', 'id,name_en,name_ar'),
  ]);
  for (const r of [exp, svc, certs, projs, revs]) if (r.error) throw new Error(r.error.message);

  const countryCode = new Map(lk.countries.map((c) => [c.id, c.code]));
  const cityCode = new Map(lk.cities.map((c) => [c.id, c.code]));
  const catLabel = new Map(cats.map((c) => [c.id, c.name_ar || c.name_en]));
  const s = (v: unknown) => (v == null ? '' : String(v));

  const selected: string[] = [];
  const extras: Row[] = [];
  const values: Row = {};
  for (const r of revs.data ?? []) {
    let key: string;
    if (r.software_id) key = r.software_id;
    else {
      key = 'custom:' + normalize(r.custom_software_name);
      extras.push({
        key, name: r.custom_software_name, en: r.custom_software_name,
        category_id: r.custom_category_id ?? 'other',
        category: (r.custom_category_id && catLabel.get(r.custom_category_id)) || r.custom_category_other || '',
      });
    }
    selected.push(key);
    values[key] = {
      lead_company: s(r.lead_company),
      industry: s(r.industry_code ?? r.industry_other),
      company_size: s(r.company_size_code),
      decision_maker: s(r.decision_maker_code),
      country: s((r.country_id && countryCode.get(r.country_id)) ?? r.country_other),
      city: s((r.city_id && cityCode.get(r.city_id)) ?? r.city_other),
      usage_duration: s(r.usage_duration_code),
      still_using: s(r.still_using_code),
      review_title: s(r.review_title),
      daily_feature: s(r.daily_feature),
      main_problem: s(r.main_problem),
      biggest_difficulty: s(r.biggest_difficulty),
      wishlist: s(r.wishlist),
      overall_rating: s(r.overall_rating),
      ease_rating: s(r.ease_rating),
      support_rating: r.support_unrated ? 'unrated' : s(r.support_rating),
      value_rating: r.value_unrated ? 'unrated' : s(r.value_rating),
      intent_to_switch: s(r.would_choose_again_code),
      recommended_to_others: s(r.recommended_code),
      relationship: s(r.relationship_code),
      relationship_detail: s(r.relationship_detail),
    };
  }

  return {
    saved: true, status: p.status as string,
    profile: {
      language: p.language === 'en' ? 'en' : 'ar',
      full_name: s(p.full_name), email: s(p.email), phone: s(p.phone),
      professional_role: s(p.professional_role_code ?? p.professional_role_other),
      experience_years: s(p.experience_range_code),
      linkedin_url: s(p.linkedin_url), consultant_bio: s(p.bio),
      consent_expert: !!p.consent_expert, anonymous: !!p.anonymous, authenticity: !!p.authenticity_confirmed,
    },
    selected, extras, values,
    certificates: (certs.data ?? []).map((r) => ({
      title: s(r.title_code ?? r.title_other), issuer: s(r.issuer_code ?? r.issuer_other), year: s(r.year), link: s(r.link),
    })),
    projects: (projs.data ?? []).map((r) => ({
      title: s(r.title), type: s(r.type_code ?? r.type_other), role: s(r.role_code ?? r.role_other),
      industry: s(r.industry_code ?? r.industry_other), software: s(r.software_id ?? r.software_other),
      year: s(r.year), result: s(r.result),
    })),
    avatar: s(p.photo_url),
    specialties: (exp.data ?? []).map((r) => s(r.expertise_code ?? r.other_text)),
    services: (svc.data ?? []).map((r) => s(r.service_code ?? r.other_text)),
  };
}

/* --------------------------------------------------------------------------------------------
 * Photo: the screen sends a small JPEG data-URL; we keep it in Storage and save only the URL
 * ------------------------------------------------------------------------------------------ */
async function resolvePhoto(userId: string, sent: unknown, current: string | null): Promise<string | null> {
  const v = typeof sent === 'string' ? sent : '';
  const path = `experts/${userId}.jpg`;
  if (!v) {
    if (current) await db().storage.from(IMAGE_BUCKET).remove([path]).catch(() => undefined);
    return null;
  }
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(v);
  if (!m) return current; // already a stored URL (or garbage): keep what we have
  if (v.length > 1_000_000) throw new ExpertInputError('Photo is too large.');
  const bin = atob(m[1]);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) throw new ExpertInputError('Photo must be a JPEG image.');
  const { error } = await db().storage.from(IMAGE_BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new Error(`photo upload: ${error.message}`);
  return `${db().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
}

/* --------------------------------------------------------------------------------------------
 * Save. Validates everything, builds all rows first, and only then writes.
 * ------------------------------------------------------------------------------------------ */
export async function saveExpertProfile(user: CurrentUser, body: unknown): Promise<{ photo_url: string | null; status: string }> {
  const b = obj(body);
  const submit = b.submit === true;
  const st = obj(b.state);
  // Refuse anything that is not a real profile payload, so an empty/odd request can never wipe saved data.
  if (!st.profile || typeof st.profile !== 'object' || !Array.isArray(st.selected) || !Array.isArray(st.certificates) || !Array.isArray(st.projects)) {
    throw new ExpertInputError('Invalid data.');
  }
  const p = obj(st.profile);
  const lang = p.language === 'en' ? 'en' : 'ar';
  const lk = await lookups();

  // ---- lookup helpers -------------------------------------------------------------------
  const optGroup = new Map(lk.options.map((o) => [o.code, o.group_code]));
  const roleSet = new Set(lk.roles.map((o) => o.code));
  const expSet = new Set(lk.experience.map((o) => o.code));
  const expertiseSet = new Set(lk.expertise.map((o) => o.code));
  const serviceSet = new Set(lk.services.map((o) => o.code));
  const countryId = new Map(lk.countries.map((c) => [c.code, c.id]));
  const cityId = new Map(lk.cities.map((c) => [`${c.country_id}:${c.code}`, c.id]));

  /** A dropdown that also allows "other": a known code -> code, anything else typed -> free text. */
  const pick = (group: string, v: unknown): { code: string | null; other: string | null } => {
    const s = txt(v, 120);
    if (!s) return { code: null, other: null };
    return optGroup.get(s) === group ? { code: s, other: null } : { code: null, other: s };
  };
  /** A dropdown with a fixed list only. */
  const strict = (group: string, v: unknown): string | null => {
    const s = txt(v, 60);
    return optGroup.get(s) === group ? s : null;
  };

  // ---- profile fields -------------------------------------------------------------------
  const fullName = txt(p.full_name, 120);
  const email = txt(p.email, 254);
  const roleRaw = txt(p.professional_role, 120);
  const expRaw = txt(p.experience_years, 40);
  if (submit) {
    if (!fullName) throw new ExpertInputError(lang === 'ar' ? 'الاسم الكامل مطلوب.' : 'Full name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ExpertInputError(lang === 'ar' ? 'أدخل بريدًا إلكترونيًا صحيحًا.' : 'Enter a valid email address.');
    if (!roleRaw) throw new ExpertInputError(lang === 'ar' ? 'المسمى المهني مطلوب.' : 'Professional role is required.');
    if (!expSet.has(expRaw)) throw new ExpertInputError(lang === 'ar' ? 'سنوات الخبرة مطلوبة.' : 'Years of experience is required.');
  }

  const { data: existing, error: exErr } = await db().from('rv_expert_profiles')
    .select('id,status,photo_url,submitted_at').eq('user_id', user.id).maybeSingle();
  if (exErr) throw new Error(exErr.message);

  // ---- software referenced by reviews / projects ---------------------------------------
  const selected = [...new Set(arr(st.selected).filter((k): k is string => typeof k === 'string'))].slice(0, 80);
  const projectsIn = arr(st.projects).slice(0, 50).map(obj);
  const extras = new Map<string, Row>();
  for (const e of arr(st.extras).slice(0, 80)) { const o = obj(e); if (typeof o.key === 'string') extras.set(o.key, o); }

  const swIds = new Set<string>();
  selected.forEach((k) => UUID.test(k) && swIds.add(k));
  projectsIn.forEach((pr) => typeof pr.software === 'string' && UUID.test(pr.software) && swIds.add(pr.software));
  const catIds = new Set<string>();
  extras.forEach((e) => typeof e.category_id === 'string' && UUID.test(e.category_id) && catIds.add(e.category_id));

  const [swRes, catRes] = await Promise.all([
    swIds.size ? db().from('rv_software').select('id').in('id', [...swIds]) : Promise.resolve({ data: [] as Row[], error: null }),
    catIds.size ? db().from('rv_categories').select('id').in('id', [...catIds]) : Promise.resolve({ data: [] as Row[], error: null }),
  ]);
  if (swRes.error) throw new Error(swRes.error.message);
  if (catRes.error) throw new Error(catRes.error.message);
  const validSw = new Set((swRes.data ?? []).map((r: Row) => r.id as string));
  const validCat = new Set((catRes.data ?? []).map((r: Row) => r.id as string));

  // ---- review rows ---------------------------------------------------------------------
  const reviewRows: Row[] = [];
  const seen = new Set<string>();
  for (const key of selected) {
    const v = obj(obj(st.values)[key]);
    let software_id: string | null = null;
    let custom_software_name: string | null = null;
    let custom_category_id: string | null = null;
    let custom_category_other: string | null = null;
    if (validSw.has(key)) software_id = key;
    else if (key.startsWith('custom:')) {
      const e = extras.get(key);
      const name = txt(e?.name, 120);
      if (!name) continue;
      custom_software_name = name;
      if (typeof e?.category_id === 'string' && validCat.has(e.category_id)) custom_category_id = e.category_id;
      else custom_category_other = nul(txt(e?.category, 120));
    } else continue;
    const dedupe = software_id ?? 'c:' + normalize(custom_software_name!);
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    const industry = pick('industry', v.industry);
    const countryRaw = txt(v.country, 120);
    const cid = countryId.get(countryRaw) ?? null;
    const cityRaw = txt(v.city, 120);
    const cityFk = cid ? cityId.get(`${cid}:${cityRaw}`) ?? null : null;

    const supportUnrated = v.support_rating === 'unrated';
    const valueUnrated = v.value_rating === 'unrated';
    const R = (k: string) => txt(v[k], 2000);
    const complete =
      ['lead_company', 'industry', 'company_size', 'decision_maker', 'country', 'city', 'usage_duration', 'still_using',
        'review_title', 'intent_to_switch', 'recommended_to_others', 'relationship'].every((k) => !!R(k)) &&
      ['daily_feature', 'main_problem', 'biggest_difficulty'].every((k) => R(k).length >= 30) &&
      rating(v.overall_rating) !== null && rating(v.ease_rating) !== null &&
      (supportUnrated || rating(v.support_rating) !== null) && (valueUnrated || rating(v.value_rating) !== null) &&
      (strict('relationship', v.relationship) === 'rel_none' || R('relationship_detail').length >= 10);

    reviewRows.push({
      user_id: user.id, software_id, custom_software_name, custom_category_id, custom_category_other,
      lead_company: nul(txt(v.lead_company, 120)),
      industry_code: industry.code, industry_other: industry.other,
      company_size_code: strict('company_size', v.company_size),
      decision_maker_code: strict('decision_maker', v.decision_maker),
      country_id: cid, country_other: cid ? null : nul(countryRaw),
      city_id: cityFk, city_other: cityFk ? null : nul(cityRaw),
      usage_duration_code: strict('usage_duration', v.usage_duration),
      still_using_code: strict('still_using', v.still_using),
      review_title: nul(txt(v.review_title, 120)),
      daily_feature: nul(R('daily_feature')), main_problem: nul(R('main_problem')),
      biggest_difficulty: nul(R('biggest_difficulty')), wishlist: nul(R('wishlist')),
      overall_rating: rating(v.overall_rating), ease_rating: rating(v.ease_rating),
      support_rating: supportUnrated ? null : rating(v.support_rating), support_unrated: supportUnrated,
      value_rating: valueUnrated ? null : rating(v.value_rating), value_unrated: valueUnrated,
      would_choose_again_code: strict('would_choose_again', v.intent_to_switch),
      recommended_code: strict('recommend', v.recommended_to_others),
      relationship_code: strict('relationship', v.relationship),
      relationship_detail: nul(R('relationship_detail')),
      is_complete: complete, sort_order: reviewRows.length,
    });
  }

  // ---- certificates, projects, tags ----------------------------------------------------
  const certRows = arr(st.certificates).slice(0, 50).map(obj).map((c, i) => {
    const title = pick('cert_title', c.title), issuer = pick('cert_issuer', c.issuer);
    return { title_code: title.code, title_other: title.other, issuer_code: issuer.code, issuer_other: issuer.other,
      year: year(c.year), link: httpUrl(c.link), sort_order: i };
  }).filter((r) => r.title_code || r.title_other || r.issuer_code || r.issuer_other || r.year || r.link);

  const projectRows = projectsIn.map((pr, i) => {
    const type = pick('project_type', pr.type), role = pick('project_role', pr.role), industry = pick('industry', pr.industry);
    const sw = txt(pr.software, 120);
    let software_id: string | null = null, software_other: string | null = null;
    if (validSw.has(sw)) software_id = sw;
    else if (sw.startsWith('custom:')) software_other = nul(txt(extras.get(sw)?.name, 120));
    else software_other = nul(sw);
    return { title: nul(txt(pr.title, 120)), type_code: type.code, type_other: type.other, role_code: role.code, role_other: role.other,
      industry_code: industry.code, industry_other: industry.other, software_id, software_other,
      year: year(pr.year), result: nul(txt(pr.result, 2000)), sort_order: i };
  }).filter((r) => r.title || r.type_code || r.type_other || r.role_code || r.role_other || r.industry_code || r.industry_other || r.software_id || r.software_other || r.year || r.result);

  const tags = (list: unknown, valid: Set<string>, col: 'expertise_code' | 'service_code') => {
    const out: Row[] = [];
    const done = new Set<string>();
    for (const x of arr(list).slice(0, 40)) {
      const s = txt(x, 120);
      if (!s || done.has(s.toLowerCase())) continue;
      done.add(s.toLowerCase());
      out.push(valid.has(s) ? { [col]: s, other_text: null } : { [col]: null, other_text: s });
    }
    return out;
  };
  const expertiseRows = tags(st.specialties, expertiseSet, 'expertise_code');
  const serviceRows = tags(st.services, serviceSet, 'service_code');

  // ---- photo (after validation so a bad request never uploads) -------------------------
  const photo_url = await resolvePhoto(user.id, st.avatar, existing?.photo_url ?? null);

  // ---- write ---------------------------------------------------------------------------
  const status = submit || existing?.status === 'submitted' ? 'submitted' : 'draft';
  const role = roleSet.has(roleRaw) ? { code: roleRaw, other: null } : { code: null, other: nul(roleRaw) };
  const { data: prof, error: pErr } = await db().from('rv_expert_profiles').upsert({
    user_id: user.id, status, language: lang,
    full_name: nul(fullName), email: nul(email), phone: nul(txt(p.phone, 30)),
    professional_role_code: role.code, professional_role_other: role.other,
    experience_range_code: expSet.has(expRaw) ? expRaw : null,
    linkedin_url: httpUrl(p.linkedin_url), bio: nul(txt(p.consultant_bio, 2000)),
    consent_expert: p.consent_expert === true, anonymous: p.anonymous === true, authenticity_confirmed: p.authenticity === true,
    photo_url,
    submitted_at: submit ? new Date().toISOString() : existing?.submitted_at ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select('id').single();
  if (pErr || !prof) throw new Error(pErr?.message ?? 'profile upsert failed');
  const pid = prof.id as string;

  // replace the child rows (delete + insert)
  const del = await Promise.all(['rv_expert_profile_expertise', 'rv_expert_profile_services', 'rv_expert_certificates',
    'rv_expert_projects', 'rv_expert_software_reviews'].map((t) => db().from(t).delete().eq('profile_id', pid)));
  for (const d of del) if (d.error) throw new Error(d.error.message);

  const withPid = (rows: Row[]) => rows.map((r) => ({ ...r, profile_id: pid }));
  const ins = await Promise.all([
    expertiseRows.length ? db().from('rv_expert_profile_expertise').insert(withPid(expertiseRows)) : null,
    serviceRows.length ? db().from('rv_expert_profile_services').insert(withPid(serviceRows)) : null,
    certRows.length ? db().from('rv_expert_certificates').insert(withPid(certRows)) : null,
    projectRows.length ? db().from('rv_expert_projects').insert(withPid(projectRows)) : null,
    reviewRows.length ? db().from('rv_expert_software_reviews').insert(withPid(reviewRows)) : null,
  ]);
  for (const r of ins) if (r && r.error) throw new Error(r.error.message);

  return { photo_url, status };
}
