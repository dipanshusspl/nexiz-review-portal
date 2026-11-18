import { redirect } from 'next/navigation';

/** Old address /contact-vendor?product=..&option=..: each option now has its own page. */
export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string; option?: string; click?: string }> }) {
  const sp = await searchParams;
  const option = ['pricing', 'info', 'general'].includes(sp.option ?? '') ? sp.option : 'general';
  const q = new URLSearchParams();
  if (sp.product) q.set('product', sp.product);
  if (sp.click) q.set('click', sp.click);
  redirect(`/contact-vendor/${option}${q.toString() ? `?${q}` : ''}`);
}