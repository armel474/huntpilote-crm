/**
 * Tests des contrats des actions du catalogue et du constructeur d'offres
 * (`app/agence/catalogue-actions.ts`), avec un client de requête simulé :
 * aucune base contactée. Ce qui est vérifié : les gardes avant toute
 * écriture, ce qui part vers la base, et qu'un refus de RLS (zéro ligne) ne
 * devienne jamais une réussite.
 *
 *   node --test tests/
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
/** Les tableaux nés dans le bac à sable `vm` n'ont pas le prototype du test : on compare la forme. */
const same = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadTs(file, dependencies, shared) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Dépendance non simulée : ${name}`);
      return dependencies[name];
    },
    ...shared,
  }, { filename: file });
  return exports;
}

const SHARED = { Date, Set, Map, Number, Error, Math, Array, JSON, Promise, Object };

/**
 * Un client simulé : chaque requête note la table et ses opérations, puis se
 * résout avec ce que `answer(table, ops)` décide. Par défaut, une écriture
 * touche une ligne et une lecture ne rend rien.
 */
function setup({
  configured = true,
  session = { kind: 'membre', memberId: 'self', agencyId: 'agency', role: 'admin' },
  answer = () => undefined,
} = {}) {
  const calls = [];
  const invalidations = [];
  let clients = 0;
  const db = {
    from(table) {
      const ops = [];
      const query = {
        then(resolve, reject) {
          const custom = answer(table, ops);
          const result = custom ?? (ops.some((o) => o.method === 'select' && !ops.some((x) => ['update', 'insert', 'delete'].includes(x.method)))
            ? { data: [], error: null }
            : ops.some((o) => o.method === 'single') ? { data: { id: 'new-offer' }, error: null } : { data: [{ id: 'row' }], error: null });
          calls.push({ table, ops, result });
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      for (const method of ['update', 'insert', 'delete', 'select', 'eq', 'in', 'is', 'order', 'single', 'upsert']) {
        query[method] = (...args) => {
          ops.push({ method, args });
          return query;
        };
      }
      return query;
    },
  };
  const base = loadTs('app/agence/action-base.ts', {
    'next/cache': { revalidatePath: (...args) => invalidations.push(args) },
    '@/lib/auth': { getSession: async () => session },
    '@/lib/supabase/config': { supabaseConfigured: () => configured },
  }, SHARED);
  const offres = loadTs('lib/data/offres.ts', {}, SHARED);
  const actions = loadTs('app/agence/catalogue-actions.ts', {
    '@/app/agence/action-base': base,
    '@/lib/data/offres': offres,
    '@/lib/supabase/server': { createClient: async () => { clients++; return db; } },
    '@supabase/supabase-js': {},
  }, SHARED);
  const writes = () => calls.filter((c) => c.ops.some((o) => ['update', 'insert', 'delete', 'upsert'].includes(o.method)));
  return { actions, calls, writes, invalidations, clients: () => clients };
}

function form(values) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) fd.append(key, value);
  return fd;
}

const draft = (over = {}) => ({
  id: null, code: 'offre-test', name: 'Offre test', tagline: '', description: '', billing: 'mensuel', priceCents: 20000,
  priceIsFrom: false, introPriceCents: null, introPeriods: null, deliveryWeeksMin: null, deliveryWeeksMax: null,
  freeConsultMinutes: null, overageHourlyRateCents: 9500, isPopular: false, active: true, recommendedOfferId: null,
  segments: ['PME'], benefits: ['Un site à jour'], lines: [{ kind: 'article', id: null, catalogItemId: 'i1', quantity: 2, label: '' }],
  tasks: [{ id: null, title: 'Mettre à jour', kind: 'technique', cadence: 'mensuel', dueDay: 5, defaultRole: 'specialiste_seo', estimateHours: 1, optionGroup: null, optionKey: null }],
  deliverables: [{ id: null, code: 'L-01', title: 'Rapport', description: '', includedRounds: null }],
  ...over,
});

const everyAction = (s) => [
  () => s.actions.saveCatalogItem(null, form({ name: 'X', kind: 'produit' })),
  () => s.actions.reorderCatalogItems(['a']),
  () => s.actions.setOfferActive('o', true),
  () => s.actions.saveOffer(null, form({ payload: JSON.stringify(draft()) })),
];

test('Sans configuration, aucune action ne crée de client Supabase', async () => {
  const s = setup({ configured: false });
  for (const run of everyAction(s)) assert.equal((await run()).ok, false);
  assert.equal(s.clients(), 0);
});

test('Sans session ou avec un contact, aucune écriture', async () => {
  for (const session of [null, { kind: 'contact', memberId: null }]) {
    const s = setup({ session });
    for (const run of everyAction(s)) assert.equal((await run()).ok, false);
    assert.equal(s.clients(), 0);
  }
});

test('Un service ponctuel est refusé avant toute écriture ; un produit est forcé ponctuel', async () => {
  const s = setup();
  assert.equal((await s.actions.saveCatalogItem(null, form({ name: 'X', kind: 'service', billing: 'ponctuel' }))).ok, false);
  assert.equal(s.writes().length, 0);
  assert.equal((await s.actions.saveCatalogItem(null, form({ name: 'Logo', kind: 'produit', billing: 'mensuel', price: '1 234,50', position: '7' }))).ok, true);
  const insert = s.writes()[0].ops.find((o) => o.method === 'insert').args[0];
  assert.equal(insert.billing, 'ponctuel');
  assert.equal(insert.price_cents, 123450);
  assert.equal(insert.code, 'logo');
  assert.equal(insert.agency_id, 'agency');
  assert.equal(insert.position, 7);
  same(s.invalidations, [['/agence'], ['/parametres']]);
});

test('Un UPDATE d’article refusé par RLS ne devient pas une réussite', async () => {
  const s = setup({ answer: (table) => (table === 'catalog_item' ? { data: [], error: null } : undefined) });
  const r = await s.actions.saveCatalogItem(null, form({ item_id: 'i1', name: 'X', kind: 'service', billing: 'mensuel' }));
  assert.equal(r.ok, false);
  assert.equal(s.invalidations.length, 0);
});

test('Réordonner écrit une position par article et refuse si une ligne ne revient pas', async () => {
  const s = setup();
  assert.equal((await s.actions.reorderCatalogItems(['b', 'a', 'c'])).ok, true);
  const positions = s.writes().map((c) => [c.ops.find((o) => o.method === 'eq').args[1], c.ops.find((o) => o.method === 'update').args[0].position]);
  same(positions, [['b', 1], ['a', 2], ['c', 3]]);

  const refused = setup({ answer: () => ({ data: [], error: null }) });
  assert.equal((await refused.actions.reorderCatalogItems(['a'])).ok, false);
  assert.equal(refused.invalidations.length, 0);
});

test('Un brouillon illisible ou invalide est refusé sans écriture', async () => {
  const s = setup();
  assert.equal((await s.actions.saveOffer(null, form({ payload: '{' }))).ok, false);
  assert.equal((await s.actions.saveOffer(null, form({ payload: JSON.stringify(draft({ name: '' })) }))).ok, false);
  assert.equal((await s.actions.saveOffer(null, form({ payload: JSON.stringify(draft({ id: 'o1', lines: [{ kind: 'offre', includedOfferId: 'o1' }] })) }))).ok, false);
  assert.equal(s.writes().length, 0);
});

test('Une offre nouvelle est créée, puis ses lignes, segments, bénéfices, tâches et livrables', async () => {
  const s = setup();
  const r = await s.actions.saveOffer(null, form({ payload: JSON.stringify(draft()), position: '9' }));
  assert.equal(r.ok, true, r.message);
  const first = s.writes()[0];
  assert.equal(first.table, 'offer');
  const inserted = first.ops.find((o) => o.method === 'insert').args[0];
  assert.equal(inserted.agency_id, 'agency');
  assert.equal(inserted.position, 9);
  assert.equal(inserted.overage_hourly_rate_cents, 9500);
  const tables = s.writes().map((c) => `${c.table}:${c.ops.find((o) => ['update', 'insert', 'delete'].includes(o.method)).method}`);
  same(tables, [
    'offer:insert',
    'offer_line:insert',
    'offer_segment:delete', 'offer_segment:insert',
    'offer_benefit:delete', 'offer_benefit:insert',
    'offer_task_template:insert',
    'offer_deliverable_template:insert',
  ]);
  const lineInsert = s.writes()[1].ops.find((o) => o.method === 'insert').args[0];
  assert.equal(lineInsert.offer_id, 'new-offer');
  assert.equal(lineInsert.quantity, 2);
  assert.equal(lineInsert.label, null);
});

test('Une offre existante rapproche ses tâches par identifiant : modifier, retirer, ajouter', async () => {
  const s = setup({
    answer: (table, ops) => {
      if (table === 'offer_task_template' && ops[0].method === 'select') return { data: [{ id: 't-keep' }, { id: 't-gone' }], error: null };
      return undefined;
    },
  });
  const payload = draft({
    id: 'o1',
    lines: [],
    tasks: [
      { id: 't-keep', title: 'Gardée', kind: 'technique', cadence: 'mensuel', dueDay: 5, defaultRole: null, estimateHours: null, optionGroup: null, optionKey: null },
      { id: 't-unknown', title: 'Venue d’ailleurs', kind: 'technique', cadence: 'mensuel', dueDay: null, defaultRole: null, estimateHours: null, optionGroup: null, optionKey: null },
      { id: null, title: 'Nouvelle', kind: 'contenu', cadence: 'signature', dueDay: 7, defaultRole: 'redacteur', estimateHours: 2, optionGroup: null, optionKey: null },
    ],
  });
  const r = await s.actions.saveOffer(null, form({ payload: JSON.stringify(payload) }));
  assert.equal(r.ok, true, r.message);
  const taskWrites = s.writes().filter((c) => c.table === 'offer_task_template').map((c) => {
    const op = c.ops.find((o) => ['update', 'insert', 'delete'].includes(o.method));
    return [op.method, op.method === 'delete' ? c.ops.find((o) => o.method === 'in').args[1] : op.args[0].title];
  });
  same(taskWrites, [['delete', ['t-gone']], ['update', 'Gardée'], ['insert', 'Venue d’ailleurs'], ['insert', 'Nouvelle']]);
  assert.equal(s.writes()[0].table, 'offer');
  assert.equal(s.writes()[0].ops[0].method, 'update');
});

test('Un UPDATE d’offre refusé par RLS arrête tout avant les tables filles', async () => {
  const s = setup({ answer: (table) => (table === 'offer' ? { data: [], error: null } : undefined) });
  const r = await s.actions.saveOffer(null, form({ payload: JSON.stringify(draft({ id: 'o1' })) }));
  assert.equal(r.ok, false);
  assert.equal(s.writes().length, 1);
  assert.equal(s.invalidations.length, 0);
});

test('Une écriture fille refusée est dite, et la page se rafraîchit sur ce qui est vraiment enregistré', async () => {
  const s = setup({ answer: (table, ops) => (table === 'offer_benefit' && ops[0].method === 'insert' ? { data: null, error: { code: '42501' } } : undefined) });
  const r = await s.actions.saveOffer(null, form({ payload: JSON.stringify(draft({ id: 'o1' })) }));
  assert.equal(r.ok, false);
  assert.match(r.message, /^L’offre est enregistrée, mais/);
  assert.ok(s.invalidations.length > 0);
  assert.equal(s.writes().some((c) => c.table === 'offer_task_template'), false, 'rien après l’échec');
});

test('Activer ou retirer une offre : zéro ligne veut dire pas le droit', async () => {
  const ok = setup();
  assert.equal((await ok.actions.setOfferActive('o1', false)).ok, true);
  assert.equal(ok.writes()[0].ops.find((o) => o.method === 'update').args[0].active, false);
  const refused = setup({ answer: () => ({ data: [], error: null }) });
  assert.equal((await refused.actions.setOfferActive('o1', true)).ok, false);
});
