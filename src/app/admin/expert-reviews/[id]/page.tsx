import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/current-user';
import { db } from '@/lib/supabase/admin';
import { lookups } from '@/lib/expert';
import { DURATIONS_V2, GOALS, INDUSTRIES, LAST_USED, RESOLVED, SIZES_V2, STOP_REASONS } from '@/lib/expert-v2';

export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

/** Everything the expert entered for one review, in their own words. Read-only. */
export default async function ExpertReviewAnswers({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('reviews.moderate');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: r } = await db().from('rv_expert_software_reviews').select('*').eq('id', id).maybeSingle();
  if (!r) notFound();
  const [{ data: p }, { data: sw }, lk] = await Promise.all([
    db().from('rv_expert_profiles').select('id,full_name,email,phone').eq('id', r.profile_id).maybeSingle(),
    r.software_id ? db().from('rv_software').select('name,display_name').eq('id', r.software_id).maybeSingle() : Promise.resolve({ data: null }),
    lookups(),
  ]);

  const opt = new Map<string, string>();
  for (const l of [DURATIONS_V2, SIZES_V2, INDUSTRIES, GOALS, RESOLVED, STOP_REASONS, LAST_USED]) for (const o of l) opt.set(o.code, o.en);
  for (const o of lk.options as Row[]) opt.set(o.code, o.en);
  for (const o of lk.roles as Row[]) opt.set(o.code, o.en);
  const L = (v: unknown) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map((c: any) => opt.get(String(c)) ?? String(c)).join(', ') || '';
  const x: Row = r.extra ?? {};
  const yn = (v: unknown) => (v === true ? 'Yes' : v === false ? 'No' : '');
  const star = (n: unknown, un?: unknown) => (un ? 'Not rated' : n == null ? '' : `${n} / 5`);

  const rows: [string, string][] = [
    ['Review title', r.review_title || ''],
    ['Role when they used it', r.role_when_used || ''],
    ['How long they used it', L(r.usage_duration_code)],
    ['Business type', L(r.business_type_code)],
    ['Industry', L(x.industry)],
    ['Company name', r.lead_company || ''],
    ['Company size', L(r.company_size_code)],
    ['Who decided to buy', L(r.decision_maker_codes?.length ? r.decision_maker_codes : r.decision_maker_code)],
    ['Functions used', [L(r.features_used), r.features_other ? `Other: ${r.features_other}` : ''].filter(Boolean).join(' · ')],
    ['Main goals', [L(x.main_goals), x.main_goal_other ? `Other: ${x.main_goal_other}` : ''].filter(Boolean).join(' · ')],
    ['What it helped them accomplish', x.accomplished || r.main_problem || ''],
    ['Time to go live', L(r.golive_time_code)],
    ['Took longer than told?', L(r.longer_than_told_code)],
    ['Who implemented it', L(r.implementer_code)],
    ['Integrations', r.no_integrations ? 'None used' : (r.integrations ?? []).map((i: Row) => `${i.name} [${i.outcome}] ${i.purpose}`).join('\n')],
    ['Compliance', Object.entries(r.compliance ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n')],
    ['Biggest problem', x.no_problems ? 'No significant problems' : r.biggest_difficulty || ''],
    ['Was the problem resolved?', x.no_problems ? '' : L(x.problem_resolved)],
    ['How it was resolved', x.problem_how || ''],
    ['Who should NOT buy it', r.who_should_not_buy || ''],
    ['Suits (company sizes)', L(x.suits_sizes)],
    ['Suits (business types)', L(x.suits_types)],
    ['Why it suits them', x.suits_why || ''],
    ['Yearly cost', L(r.annual_cost_code)],
    ['Previous software', r.previous_software || ''],
    ['Still using it?', L(r.still_using_code)],
    ['Moved to', r.moved_to_software || ''],
    ['Why they stopped', [L(x.stop_reasons), x.stop_other ? `Other: ${x.stop_other}` : ''].filter(Boolean).join(' · ')],
    ['Last used', L(x.last_used)],
    ['Overall rating', star(r.overall_rating)],
    ['Ease of use', star(r.ease_rating)],
    ['Support', star(r.support_rating, r.support_unrated)],
    ['Value for money', star(r.value_rating, r.value_unrated)],
    ['Would choose again', L(r.would_choose_again_code)],
    ['Would recommend', L(r.recommended_code)],
    ['Relationship with the vendor', L(r.relationship_code)],
    ['Relationship details', r.relationship_detail || ''],
    ['Wish list (older reviews)', r.wishlist || ''],
    ['Posted anonymously', yn(r.anonymous)],
    ['Declaration confirmed', yn(r.declaration_confirmed)],
  ];

  return (
    <>
      <p><Link href="/admin/moderation">← Back to moderation</Link></p>
      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h1 className="title" style={{ margin: 0 }}>{sw?.display_name || sw?.name || r.custom_software_name || 'Unknown product'}</h1>
        <div className="muted small" style={{ marginTop: 6 }}>
          Status: <b>{r.is_complete ? r.status : 'draft'}</b> · submitted {String(r.created_at).slice(0, 10)}
        </div>
        <div style={{ marginTop: 10 }}>
          <b>{p?.full_name || '—'}</b> · {p?.email || '—'} · {p?.phone || 'no phone'}{' '}
          {p?.id && <Link href={`/admin/experts/${p.id}`} target="_blank">View expert profile</Link>}
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h2>Answers (as the expert entered them)</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 240px) 1fr', gap: '10px 16px' }}>
          {rows.filter(([, v]) => v).map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><dt className="muted">{k}</dt><dd style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{v}</dd></div>))}
        </dl>
      </div>
    </>
  );
}
