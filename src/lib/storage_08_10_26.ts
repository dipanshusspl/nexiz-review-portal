import 'server-only';
import { randomUUID } from 'node:crypto';
import { IMAGE_BUCKET, db } from '@/lib/supabase/admin';

const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export class ImageError extends Error {}

/** Uploads to Supabase Storage and returns the public URL. Throws ImageError for bad files. */
export async function uploadImage(file: File, folder: 'categories' | 'software'): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new ImageError('Only PNG, JPG or WEBP images are allowed.');
  if (file.size > MAX_IMAGE_BYTES) throw new ImageError('Image must be 2 MB or smaller.');
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await db().storage.from(IMAGE_BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (error) throw new ImageError(`Upload failed: ${error.message}`);
  return db().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best effort: delete the old file when an image is replaced or an item is deleted. */
export async function removeImage(url?: string | null): Promise<void> {
  if (!url) return;
  const marker = `/${IMAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  await db().storage.from(IMAGE_BUCKET).remove([url.slice(i + marker.length)]).catch(() => undefined);
}
