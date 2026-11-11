// Added by Prachi, 2026-11-11: reads the tech stack and the product links for the page /tech-stack.
// Never throws: if the tables do not exist yet (sql/009 not applied) the page shows that there is nothing yet.
import 'server-only';
import { db } from '@/lib/supabase/admin';
import { buildDirectory, type Directory, type LinkInput, type SoftwareInput, type TechInput } from '@/lib/tech-directory-pure';

export async function loadTechDirectory(lang: 'en' | 'ar'): Promise<Directory> {
  const empty: Directory = { groups: [], total: 0, used: 0 };
  try {
    const [t, l] = await Promise.all([
      db().from('rv_tech_stack').select('id,slug,name_en,name_ar,category,is_government'),
      db().from('rv_product_integrations').select('software_id,tech_stack_id,is_native'),
    ]);
    if (t.error || l.error) { console.error('tech directory:', t.error?.message ?? l.error?.message); return empty; }
    const links = (l.data ?? []) as LinkInput[];
    const ids = [...new Set(links.map((x) => x.software_id))];
    let software: SoftwareInput[] = [];
    if (ids.length) {
      const sw = await db().from('rv_software').select('id,slug,name,display_name,image_url').in('id', ids);
      if (sw.error) console.error('tech directory:', sw.error.message);
      software = ((sw.data ?? []) as any[]).map((s) => ({ id: s.id, slug: s.slug, name: (s.display_name || s.name) as string, image_url: s.image_url ?? null }));
    }
    return buildDirectory((t.data ?? []) as TechInput[], links, software, lang);
  } catch (e) {
    console.error('tech directory failed:', e instanceof Error ? e.message : e);
    return empty;
  }
}