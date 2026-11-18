import ContactVendorView, { type ContactSearch } from '../view';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<ContactSearch> }) {
  return <ContactVendorView option="pricing" sp={await searchParams} />;
}