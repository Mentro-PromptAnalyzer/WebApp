import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const required = [
  'SUPABASE_TEST_URL',
  'SUPABASE_TEST_PUBLISHABLE_KEY',
  'SUPABASE_TEST_USER_A_EMAIL',
  'SUPABASE_TEST_USER_A_PASSWORD',
  'SUPABASE_TEST_USER_B_EMAIL',
  'SUPABASE_TEST_USER_B_PASSWORD',
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required`);
}
if (process.env.SUPABASE_TEST_WRITES_APPROVED !== 'isolated-only') {
  throw new Error('Set SUPABASE_TEST_WRITES_APPROVED=isolated-only after verifying the target');
}

const url = new URL(process.env.SUPABASE_TEST_URL);
assert.equal(url.protocol, 'https:');
assert.notEqual(
  url.hostname,
  'anmsstuexchqyghqoipt.supabase.co',
  'Live Mentro project is not a test target'
);
assert.notEqual(
  process.env.SUPABASE_TEST_USER_A_EMAIL,
  process.env.SUPABASE_TEST_USER_B_EMAIL,
  'Use two distinct Auth users'
);

const makeClient = () =>
  createClient(url.href, process.env.SUPABASE_TEST_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const a = makeClient();
const b = makeClient();
const anon = makeClient();
const signIn = async (client, label) => {
  const { data, error } = await client.auth.signInWithPassword({
    email: process.env[`SUPABASE_TEST_USER_${label}_EMAIL`],
    password: process.env[`SUPABASE_TEST_USER_${label}_PASSWORD`],
  });
  if (error) throw error;
  return data.user.id;
};

const ownedIds = [];
try {
  const [ownerA, ownerB] = await Promise.all([signIn(a, 'A'), signIn(b, 'B')]);
  assert.notEqual(ownerA, ownerB);

  const marker = `provider-history-${randomUUID()}`;
  const result = {
    prompts: [{ text: marker }],
    scores: {
      autonomy: 75,
      curiosity: 75,
      criticalThinking: 75,
      specificity: 75,
      context: 75,
      engagement: 75,
      overallQuality: 75,
    },
  };
  const row = (user_id, title) => ({
    user_id,
    title,
    overall_score: 75,
    prompt_count: 1,
    platform: 'provider-test',
    analysis_result: result,
  });
  const insert = async (client, data) => {
    const response = await client
      .from('chat_histories')
      .insert(data)
      .select('id, user_id, analysis_result')
      .single();
    if (response.error) throw response.error;
    ownedIds.push({ client, id: response.data.id });
    return response.data;
  };

  const aRow = await insert(a, row(ownerA, `${marker}-a`));
  const bRow = await insert(b, row(ownerB, `${marker}-b`));
  assert.equal(aRow.analysis_result.prompts[0].text, marker);

  const read = async (client, id) => {
    const { data, error } = await client.from('chat_histories').select('id').eq('id', id);
    if (error) throw error;
    return data;
  };
  assert.equal((await read(a, aRow.id)).length, 1);
  assert.equal((await read(b, bRow.id)).length, 1);
  assert.equal((await read(a, bRow.id)).length, 0, 'A must not read B history');
  assert.equal((await read(b, aRow.id)).length, 0, 'B must not read A history');
  const signedOutRead = await anon.from('chat_histories').select('id').eq('id', aRow.id);
  assert.ok(
    signedOutRead.error || signedOutRead.data.length === 0,
    'Signed-out client must not read history'
  );

  const spoof = await a.from('chat_histories').insert(row(ownerB, `${marker}-spoof`));
  assert.ok(spoof.error, 'A must not insert a history owned by B');

  const crossDelete = await b.from('chat_histories').delete().eq('id', aRow.id).select('id');
  if (crossDelete.error) throw crossDelete.error;
  assert.equal(crossDelete.data.length, 0, 'B must not delete A history');
  assert.equal((await read(a, aRow.id)).length, 1);

  const update = await a.from('chat_histories').update({ title: 'forbidden' }).eq('id', aRow.id);
  assert.ok(update.error, 'Client updates are not part of the WebApp contract');

  console.log(
    'PASS: isolated two-user Auth, owner read/insert/delete, anonymous denial, JSON round-trip'
  );
} finally {
  for (const { client, id } of ownedIds) {
    const { error } = await client.from('chat_histories').delete().eq('id', id);
    if (error) console.error(`Cleanup failed for ${id}: ${error.message}`);
  }
  await Promise.all([a.auth.signOut(), b.auth.signOut()]);
}
