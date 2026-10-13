import bcrypt from 'bcryptjs';

// bcryptjs is pure JavaScript, so it also runs on Cloudflare Workers.
export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
/** Compared when the user does not exist, so response time does not reveal valid emails. */
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 72) return 'Password must be at most 72 characters.';
  return null;
}
