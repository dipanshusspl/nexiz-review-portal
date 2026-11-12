/**
 * Run once after creating the tables:   npm run seed          (roles + first admin)
 *                                       npm run seed:sample   (also demo categories + software)
 * Safe to run again: it never overwrites existing data.
 */
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SYSTEM_ROLES } from '../src/lib/permissions';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.');
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? '';
const name = process.env.ADMIN_NAME ?? 'Super Admin';

const SAMPLE: { slug: string; en: string; ar: string; software: string[] }[] = [
  { slug: 'accounting-invoicing', en: 'Accounting & Invoicing', ar: 'المحاسبة والفوترة', software: ['Daftra', 'Zoho Books', 'QuickBooks', 'Odoo', 'Xero', 'SAP', 'FreshBooks', 'Wave'] },
  { slug: 'crm-sales', en: 'CRM & Sales', ar: 'إدارة العملاء والمبيعات', software: ['HubSpot', 'Salesforce', 'Zoho CRM', 'Pipedrive'] },
  { slug: 'hr-payroll', en: 'HR & Payroll', ar: 'الموارد البشرية والرواتب', software: ['Jisr', 'Bayzat', 'Mudad'] },
  { slug: 'payment-gateways', en: 'Payment Gateways', ar: 'بوابات الدفع', software: ['Moyasar', 'HyperPay', 'Tap Payments'] },
  { slug: 'project-management', en: 'Project Management', ar: 'إدارة المشاريع', software: ['Asana', 'Trello', 'Jira'] },
  { slug: 'communication', en: 'Communication', ar: 'التواصل', software: ['Slack', 'Microsoft Teams', 'Zoom'] },
];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  // 1) system roles
  for (const [roleName, def] of Object.entries(SYSTEM_ROLES)) {
    const { data } = await sb.from('rv_roles').select('id').eq('name', roleName).maybeSingle();
    if (data) { console.log(`role "${roleName}" already exists`); continue; }
    const { error } = await sb.from('rv_roles').insert({ name: roleName, description: def.description, permissions: [...def.permissions], is_system: true });
    if (error) throw error;
    console.log(`created role "${roleName}"`);
  }

  // 2) first admin (only if there is no admin user yet)
  const { data: adminRole } = await sb.from('rv_roles').select('id').eq('name', 'admin').single();
  const { count } = await sb.from('rv_users').select('id', { count: 'exact', head: true }).eq('role_id', adminRole!.id);
  if ((count ?? 0) > 0) {
    console.log('an admin user already exists - not creating another');
  } else {
    if (!email || password.length < 8) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env.local');
    const { error } = await sb.from('rv_users').insert({
      email, full_name: name, role_id: adminRole!.id, password_hash: await bcrypt.hash(password, 10),
    });
    if (error) throw error;
    console.log(`created admin user ${email}  (change the password after the first login!)`);
  }

  // 3) optional sample data
  if (process.argv.includes('--sample')) {
    let order = 0;
    for (const c of SAMPLE) {
      order += 1;
      let { data: cat } = await sb.from('rv_categories').select('id').eq('slug', c.slug).maybeSingle();
      if (!cat) {
        const ins = await sb.from('rv_categories').insert({ slug: c.slug, name_en: c.en, name_ar: c.ar, sort_order: order }).select('id').single();
        if (ins.error) throw ins.error;
        cat = ins.data;
      }
      let n = 0;
      for (const sw of c.software) {
        n += 1;
        const { data: ex } = await sb.from('rv_software').select('id').eq('slug', slug(sw)).maybeSingle();
        if (ex) continue;
        const { error } = await sb.from('rv_software').insert({ category_id: cat!.id, slug: slug(sw), name: sw, sort_order: n });
        if (error) throw error;
      }
    }
    console.log('sample categories and software added (no images - upload them in the admin panel)');
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
