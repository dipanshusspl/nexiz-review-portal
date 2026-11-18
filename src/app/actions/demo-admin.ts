'use server';
// Added by Prachi, 2026-11-17: admin actions for demo requests: record that a lead was forwarded to a vendor, and change its status.
import { revalidatePath } from 'next/cache';
import { audit } from '@/lib/audit';
import { requirePermission } from '@/lib/auth/current-user';
import { back, isEmail, optional, str } from '@/lib/form';
import { db } from '@/lib/supabase/admin';

const PAGE = '/admin/demo-requests';

/** Writes one row to rv_lead_forwards (when + which vendor) and sets the lead to "forwarded". Only leads whose customer ticked the consent box can be forwarded. */
export async function forwardLead(fd: FormData): Promise<void> {
  const me = await requirePermission('software.manage');
  const id = str(fd, 'id', 40), vendor = str(fd, 'vendor_name', 120), vendorEmail = optional(fd, 'vendor_email', 254);
  if (!id || !vendor) back(PAGE, 'error', 'Enter the vendor name.');
  if (vendorEmail && !isEmail(vendorEmail)) back(PAGE, 'error', 'The vendor email is not valid.');

  const { data: lead } = await db().from('rv_demo_requests').select('id,lead_id,consent_vendor_share').eq('id', id).maybeSingle();
  if (!lead) back(PAGE, 'error', 'Lead not found.');
  if (!lead!.consent_vendor_share) back(PAGE, 'error', 'This customer did not agree to share their details, so it cannot be forwarded.');

  const { error } = await db().from('rv_lead_forwards').insert({ lead_id: id, vendor_name: vendor, vendor_email: vendorEmail, forwarded_by: me.id });
  if (error) back(PAGE, 'error', `Could not record the forward (${error.message}).`);
  await db().from('rv_demo_requests').update({ status: 'forwarded' }).eq('id', id);
  await audit(me.id, 'demo.forward', 'rv_demo_requests', id, { lead_id: lead!.lead_id, vendor });
  revalidatePath(PAGE);
  back(PAGE, 'ok', `${lead!.lead_id} marked as forwarded to ${vendor}.`);
}

export async function setLeadStatus(fd: FormData): Promise<void> {
  const me = await requirePermission('software.manage');
  const id = str(fd, 'id', 40), status = str(fd, 'status', 20);
  if (!id || !['new', 'forwarded', 'contacted', 'closed'].includes(status)) back(PAGE, 'error', 'Invalid status.');
  const { error } = await db().from('rv_demo_requests').update({ status }).eq('id', id);
  if (error) back(PAGE, 'error', `Could not change the status (${error.message}).`);
  await audit(me.id, 'demo.status', 'rv_demo_requests', id, { status });
  revalidatePath(PAGE);
  back(PAGE, 'ok', 'Status updated.');
}