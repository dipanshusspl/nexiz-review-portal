import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, passwordProblem } from '../src/lib/auth/password';
import { signSession, verifySession } from '../src/lib/auth/session';

process.env.SESSION_SECRET = 'x'.repeat(40);

test('password hash round trip', async () => {
  const h = await hashPassword('Correct-Horse-1');
  assert.equal(await verifyPassword('Correct-Horse-1', h), true);
  assert.equal(await verifyPassword('wrong', h), false);
});

test('password policy', () => {
  assert.ok(passwordProblem('short'));
  assert.equal(passwordProblem('long-enough-1'), null);
});

test('session token round trip and tamper detection', async () => {
  const t = await signSession('user-123');
  assert.equal(await verifySession(t), 'user-123');
  assert.equal(await verifySession(t.slice(0, -2) + 'xx'), null);
  assert.equal(await verifySession(undefined), null);
});
