/** Tests des contrats d'actions, avec client de requête simulé : aucune base contactée. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadTs(file, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require: (name) => {
      assert.ok(name in dependencies, `Dépendance non simulée : ${name}`);
      return dependencies[name];
    }, Date, Set, Map, Number, Error,
  }, { filename: file });
  return exports;
}

function setup({ configured = true, session = { kind: 'membre', memberId: 'self', agencyId: 'agency', role: 'admin' }, rows = [{ id: 'self', role: 'admin' }], rolePermissions = [{ permission: 'manage_team' }], overrides = [], error = null } = {}) {
  const calls = [], invalidations = [];
  let clients = 0;
  const db = { from(table) {
    const result = { data: table === 'role_permission' ? rolePermissions : table === 'member_permission' ? overrides : rows, error };
    const query = { then: (resolve, reject) => Promise.resolve(result).then(resolve, reject) };
    for (const method of ['update', 'insert', 'eq', 'select', 'delete', 'in', 'upsert']) {
      query[method] = (...args) => { calls.push({ table, method, args }); return query; };
    }
    return query;
  } };
  const actions = loadTs('app/parametres/actions.ts', {
    'next/cache': { revalidatePath: (...args) => invalidations.push(args) },
    '@/lib/auth': { getSession: async () => session },
    '@/lib/format': { PERMISSIONS: ['manage_team'] },
    '@/lib/supabase/config': { supabaseConfigured: () => configured },
    '@/lib/supabase/server': { createClient: async () => { clients++; return db; } },
  });
  return { actions, calls, invalidations, clients: () => clients };
}

function form(values) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) fd.append(key, value);
  return fd;
}

test('Sans configuration, aucune action ne crée de client Supabase', async () => {
  const s = setup({ configured: false });
  for (const action of Object.values(s.actions)) assert.equal((await action(null, new FormData())).ok, false);
  assert.equal(s.clients(), 0);
});

test('Sans session ou avec un contact, aucune écriture', async () => {
  for (const session of [null, { kind: 'contact', memberId: null }]) {
    const s = setup({ session });
    for (const action of Object.values(s.actions)) assert.equal((await action(null, new FormData())).ok, false);
    assert.equal(s.clients(), 0);
  }
});

test('Un UPDATE du profil refusé par RLS ne devient pas une réussite', async () => {
  const s = setup({ rows: [] });
  assert.equal((await s.actions.saveAgencyProfile(null, form({ name: 'Agence test' }))).ok, false);
  assert.equal(s.invalidations.length, 0);
});

test('Un UPDATE membre sans ligne retournée est refusé', async () => {
  const s = setup({ rows: [] });
  assert.equal((await s.actions.updateMember(null, form({ member_id: 'other', first_name: 'Test' }))).ok, false);
  assert.equal(s.invalidations.length, 0);
});

test('La sauvegarde du profil cible son agence et actualise le hub et les anciens accès', async () => {
  const s = setup();
  assert.equal((await s.actions.saveAgencyProfile(null, form({ name: 'Agence test' }))).ok, true);
  assert.ok(s.calls.some((c) => c.method === 'eq' && c.args[0] === 'id' && c.args[1] === 'agency'));
  assert.equal(JSON.stringify(s.invalidations), JSON.stringify([['/agence', 'layout'], ['/parametres']]));
});

test('Le retrait de sa gestion d’équipe est refusé avant toute écriture', async () => {
  const s = setup();
  const result = await s.actions.updateMember(null, form({ member_id: 'self', first_name: 'Test', manage: '1', active: '1', role: 'redacteur' }));
  assert.equal(result.ok, false);
  assert.equal(s.calls.length, 0);
});

test('La désactivation de son propre compte reste refusée', async () => {
  const s = setup();
  const result = await s.actions.updateMember(null, form({ member_id: 'self', first_name: 'Test', manage: '1', permission: 'manage_team', role: 'admin' }));
  assert.equal(result.ok, false);
  assert.equal(s.calls.length, 0);
});

test('Sa fiche en gestion se sauvegarde avec les valeurs des contrôles verrouillés', async () => {
  const s = setup();
  const result = await s.actions.updateMember(null, form({ member_id: 'self', first_name: 'Test', manage: '1', active: '1', permission: 'manage_team', role: 'admin' }));
  assert.equal(result.ok, true);
  assert.equal(s.calls.find((c) => c.method === 'update').args[0].active, true);
  assert.equal(s.invalidations[0][0], '/agence');
});

test('Sa fiche sans gestion envoie seulement les champs d’identité', async () => {
  const s = setup();
  const result = await s.actions.updateMember(null, form({ member_id: 'self', first_name: 'Test', role: 'admin', active: '0' }));
  assert.equal(result.ok, true);
  const payload = s.calls.find((c) => c.method === 'update').args[0];
  assert.equal('role' in payload, false);
  assert.equal('active' in payload, false);
  assert.equal(s.calls.some((c) => c.table === 'member_permission'), false);
});

test('Un changement de rôle qui ferait perdre sa gestion avant les exceptions est refusé', async () => {
  const s = setup({ rolePermissions: [] });
  const result = await s.actions.updateMember(null, form({ member_id: 'self', first_name: 'Test', manage: '1', active: '1', permission: 'manage_team', role: 'redacteur' }));
  assert.equal(result.ok, false);
  assert.equal(s.calls.some((c) => ['update', 'delete', 'upsert'].includes(c.method)), false);
});

test('Une exception existante de gestion permet de conserver son droit au changement de rôle', async () => {
  const s = setup({ rolePermissions: [], overrides: [{ granted: true }], rows: [{ id: 'self', role: 'redacteur' }] });
  const result = await s.actions.updateMember(null, form({ member_id: 'self', first_name: 'Test', manage: '1', active: '1', permission: 'manage_team', role: 'redacteur' }));
  assert.equal(result.ok, true);
  assert.ok(s.calls.some((c) => c.method === 'upsert' && c.args[0][0].granted));
});

test('Une invitation refusée ne déclenche aucune actualisation', async () => {
  const s = setup({ error: { code: '42501' } });
  assert.equal((await s.actions.inviteMember(null, form({ first_name: 'Test', email: 'test@example.invalid', role: 'redacteur' }))).ok, false);
  assert.equal(s.invalidations.length, 0);
});

test('Une erreur de lecture remonte au hub au lieu de fabriquer des compteurs à zéro', async () => {
  const { loadAgencyData } = loadTs('lib/queries/agence.ts', {});
  const query = {
    select: () => query, order: () => query, maybeSingle: () => query,
    then: (resolve) => Promise.resolve({ data: null, error: { code: '42501' } }).then(resolve),
  };
  await assert.rejects(loadAgencyData({ from: () => query }), /n’ont pas pu être chargées/);
});
