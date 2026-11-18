/**
 * Tests des contrats des actions du générateur (`app/documents/actions.ts`)
 * avec un client de requête simulé : les gardes qui parlent avant que la
 * base ne refuse — session, sorte, modèle, lignes, taxes, balises vides,
 * état du document. Aucune base contactée.
 *
 *   node --test tests/
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadTs(file, deps) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(
    outputText,
    { exports, require: (n) => { assert.ok(n in deps, `Dépendance non simulée : ${n}`); return deps[n]; }, Math, Set, Map, Number, Array, String, Object, Date, Promise, JSON, encodeURIComponent },
    { filename: file },
  );
  return exports;
}

const donnees = loadTs('lib/documents/donnees.ts', { '@/lib/format': { money: (c) => `${c / 100} $` } });

/** Un document tel que `loadDocumentDetail` le rend, modifiable par test. */
const detail = (over = {}) => ({
  id: 'q1', kind: 'devis', ref: 'DV-2026-001', status: 'brouillon', subject: 'Site', client: { id: 'c1', name: 'Acme', slug: 'acme', address: null, sector: null },
  contact: { id: 'k1', name: 'Jo', role: null, email: 'jo@acme.ca', phone: null }, contacts: [], dealId: null,
  template: { id: 't1', name: 'Devis', bodyHtml: '<p>{{client.nom}}</p>', intro: null, legalMentions: null, footer: null, paymentInstructions: null },
  issuedOn: null, expiresOn: null, dueOn: null, paymentTermsDays: 30, sentAt: null, acceptedOn: null, refusedOn: null, refusalNote: null, paidOn: null,
  rates: { tps: 0.05, tvq: 0.09975 }, ratesFrozen: false, lines: [{ id: 'l1', position: 1, description: 'Site', quantity: 1, unitPriceCents: 100000, kind: 'facturable', billing: 'ponctuel', catalogItemId: null, offerId: null }],
  sections: [], extras: {}, versions: [], events: [], signature: null, accessToken: null, renderedHtml: null,
  totals: donnees.computeTotals([{ description: 'Site', quantity: 1, unitPriceCents: 100000, kind: 'facturable', billing: 'ponctuel' }]), taxNumbersMissing: false, chain: { from: null, produced: [] },
  ...over,
});

function setup({ session = { kind: 'membre', memberId: 'm1', agencyId: 'a1', role: 'admin' }, doc = detail(), rows = {}, rendered = { html: '', page: '<html/>', unfilled: [] } } = {}) {
  const calls = [];
  const db = {
    from(table) {
      const result = { data: table in rows ? rows[table] : [], error: null };
      const q = { then: (res, rej) => Promise.resolve(result).then(res, rej) };
      for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'is', 'in', 'order', 'limit']) q[m] = (...args) => { calls.push({ table, method: m, args }); return q; };
      q.maybeSingle = () => Promise.resolve({ data: Array.isArray(result.data) ? result.data[0] ?? null : result.data, error: null });
      q.single = () => Promise.resolve({ data: Array.isArray(result.data) ? result.data[0] ?? null : result.data, error: null });
      return q;
    },
    rpc: (name, args) => { calls.push({ table: 'rpc', method: name, args }); return Promise.resolve({ data: rows.rpc ?? 'DV-2026-002', error: null }); },
  };
  const A = loadTs('app/documents/actions.ts', {
    'node:crypto': { randomBytes: () => ({ toString: () => 'ab'.repeat(24) }) },
    'next/headers': { headers: async () => ({ get: () => null }) },
    'next/cache': { revalidatePath: () => {} },
    '@/app/agence/action-base': { memberSession: async () => session, explain: (code, fb) => fb },
    '@/lib/documents/donnees': donnees,
    '@/lib/queries/documents': { loadDocumentDetail: async () => doc, renderDocument: async () => rendered, loadGeneratorOptions: async () => null },
    '@/lib/routes': { document: (id) => `/documents/${id}`, documentLien: (t) => `/d/${t}`, routes: { document: (id) => `/documents/${id}`, documentLien: (t) => `/d/${t}` } },
    '@/lib/supabase/server': { createClient: async () => db },
  });
  return { A, calls };
}

const input = (over = {}) => ({ kind: 'devis', templateId: 't1', clientId: 'c1', contactId: 'k1', dealId: null, subject: 'Site', expiresOn: null, paymentTermsDays: null, lines: [{ description: 'Site', quantity: 1, unitPriceCents: 100000, kind: 'facturable', billing: 'ponctuel' }], sourceQuoteId: null, ...over });

test('createDocument refuse sans session, sans sorte, sans objet, sans ligne', async () => {
  const { A } = setup({ session: null });
  assert.equal((await A.createDocument(input())).ok, false);
  const { A: B } = setup();
  assert.match((await B.createDocument(input({ kind: 'contrat' }))).message, /sorte/);
  assert.match((await B.createDocument(input({ subject: '  ' }))).message, /objet/);
  assert.match((await B.createDocument(input({ lines: [] }))).message, /au moins une ligne/);
  assert.match((await B.createDocument(input({ lines: [{ description: 'X', quantity: 0, unitPriceCents: 1, kind: 'facturable', billing: 'ponctuel' }] }))).message, /quantité/);
  assert.match((await B.createDocument(input({ lines: [{ description: 'X', quantity: 1, unitPriceCents: 5, kind: 'offert', billing: 'ponctuel' }] }))).message, /offerte/);
  assert.match((await B.createDocument(input({ lines: [{ description: 'X', quantity: 1, unitPriceCents: 5, kind: 'remise', billing: 'ponctuel' }] }))).message, /remise/i);
  assert.match((await B.createDocument(input({ expiresOn: 'demain' }))).message, /expiration/);
});

test('createDocument refuse un modèle d’une autre sorte, puis crée un devis numéroté par la base', async () => {
  const { A } = setup({ rows: { document_template: [{ id: 't1', kind: 'proposition', payment_terms_days: 30 }] } });
  assert.match((await A.createDocument(input())).message, /modèle de proposition/);
  const { A: B, calls } = setup({ rows: { document_template: [{ id: 't1', kind: 'devis', payment_terms_days: 30 }], quote: [{ id: 'q9' }] } });
  const r = await B.createDocument(input());
  assert.equal(r.ok, true);
  assert.equal(r.id, 'q9');
  assert.match(r.message, /DV-2026-002/);
  assert.ok(calls.some((c) => c.table === 'rpc' && c.method === 'next_document_ref'));
  const ins = calls.find((c) => c.table === 'quote' && c.method === 'insert');
  assert.equal(ins.args[0].kind, 'devis');
  assert.equal(ins.args[0].status, 'brouillon');
  assert.equal(ins.args[0].ref, 'DV-2026-002');
  const lines = calls.find((c) => c.table === 'quote_line' && c.method === 'insert');
  assert.equal(lines.args[0][0].position, 1);
});

test('createDocument : une facture porte une échéance calculée du délai, et ses lignes ne sont jamais négatives', async () => {
  const { A, calls } = setup({ rows: { document_template: [{ id: 't1', kind: 'facture', payment_terms_days: 15 }], invoice: [{ id: 'i1' }] } });
  const r = await A.createDocument(input({ kind: 'facture', lines: [{ description: 'Acompte', quantity: 1, unitPriceCents: 50000, kind: 'facturable', billing: 'ponctuel' }, { description: 'Rabais', quantity: 1, unitPriceCents: -1000, kind: 'remise', billing: 'ponctuel' }] }));
  assert.equal(r.ok, true);
  const ins = calls.find((c) => c.table === 'invoice' && c.method === 'insert');
  assert.equal(ins.args[0].status, 'en_attente');
  const due = new Date(ins.args[0].due_on).getTime() - new Date(ins.args[0].issued_on).getTime();
  assert.equal(Math.round(due / 86400000), 15);
  const lines = calls.find((c) => c.table === 'invoice_line' && c.method === 'insert');
  assert.equal(lines.args[0][1].unit_price_cents, 0);
});

test('saveDraft refuse un document parti, et enregistre un brouillon (lignes remplacées, compléments nettoyés)', async () => {
  const { A } = setup({ doc: detail({ status: 'envoye' }) });
  assert.match((await A.saveDraft('q1', { subject: 'X' })).message, /nouvelle version/);
  const { A: B, calls } = setup({ rows: { quote: [{ id: 'q1' }] } });
  const r = await B.saveDraft('q1', { subject: 'Nouveau', lines: [{ description: 'A', quantity: 2, unitPriceCents: 100, kind: 'facturable', billing: 'mensuel' }], extras: { 'brief.objectif': ' Vendre ', 'Mauvaise Clé': 'x', vide: '  ' } });
  assert.equal(r.ok, true);
  const upd = calls.find((c) => c.table === 'quote' && c.method === 'update');
  assert.equal(upd.args[0].subject, 'Nouveau');
  assert.equal(JSON.stringify(upd.args[0].extras), JSON.stringify({ 'brief.objectif': 'Vendre' }));
  assert.ok(calls.some((c) => c.table === 'quote_line' && c.method === 'delete'));
  assert.ok(calls.some((c) => c.table === 'quote_line' && c.method === 'insert' && c.args[0][0].billing === 'mensuel'));
  assert.ok(calls.some((c) => c.table === 'document_event' && c.method === 'insert' && c.args[0].kind === 'modifie'));
});

test('sendDocument dit pourquoi avant que la base ne refuse : taxes, corps, contact, balises vides, déjà parti', async () => {
  assert.match((await setup({ doc: detail({ taxNumbersMissing: true }) }).A.sendDocument('q1', 'fil')).message, /TPS et de TVQ/);
  assert.match((await setup({ doc: detail({ template: { ...detail().template, bodyHtml: null } }) }).A.sendDocument('q1', 'fil')).message, /corps/);
  assert.match((await setup({ doc: detail({ contact: null }) }).A.sendDocument('q1', 'fil')).message, /contact/);
  assert.match((await setup({ doc: detail({ status: 'envoye' }) }).A.sendDocument('q1', 'fil')).message, /déjà parti/);
  assert.match((await setup({ rendered: { html: '', page: '', unfilled: ['brief.objectif'] } }).A.sendDocument('q1', 'fil')).message, /\{\{brief\.objectif\}\}/);
});

test('sendDocument : rendu figé, version 1, journal, et dépôt dans le fil du portail', async () => {
  const { A, calls } = setup({ rows: { quote: [{ id: 'q1' }], agency_settings: [{ tps_rate: 0.05, tvq_rate: 0.09975 }] } });
  const r = await A.sendDocument('q1', 'fil');
  assert.equal(r.ok, true, r.message);
  assert.match(r.link, /\/d\/abab/);
  assert.match(r.mailto, /^mailto:jo%40acme\.ca/);
  const upd = calls.find((c) => c.table === 'quote' && c.method === 'update');
  assert.equal(upd.args[0].status, 'envoye');
  assert.equal(upd.args[0].rendered_html, '<html/>');
  assert.equal(upd.args[0].tps_rate, 0.05);
  assert.ok(upd.args[0].access_token.length >= 24);
  const ver = calls.find((c) => c.table === 'quote_version' && c.method === 'insert');
  assert.equal(ver.args[0].version, 1);
  assert.ok(calls.some((c) => c.table === 'communication' && c.method === 'insert' && c.args[0].channel === 'portail'));
  assert.ok(calls.some((c) => c.table === 'document_event' && c.method === 'insert' && c.args[0].kind === 'envoye'));
});

test('sendDocument : zéro ligne mise à jour n’est pas une réussite — c’est un droit qui manque', async () => {
  const { A } = setup({ rows: { quote: [] } });
  const r = await A.sendDocument('q1', 'courriel');
  assert.equal(r.ok, false);
  assert.match(r.message, /Envoyer des documents/);
});

test('decideDocument : les gestes suivent l’état — rien à relancer sur un brouillon, accepté seulement après envoi, payée seulement pour une facture envoyée', async () => {
  assert.match((await setup().A.decideDocument('q1', 'relance', null)).message, /Rien à relancer/);
  assert.match((await setup().A.decideDocument('q1', 'accepte', null)).message, /envoyé/);
  assert.match((await setup({ doc: detail({ kind: 'facture', status: 'brouillon' }) }).A.decideDocument('q1', 'payee', null)).message, /envoyée/);
  assert.match((await setup({ doc: detail({ kind: 'facture', status: 'envoye' }) }).A.decideDocument('q1', 'accepte', null)).message, /facture/);
  const { A, calls } = setup({ doc: detail({ status: 'envoye' }), rows: { quote: [{ id: 'q1' }] } });
  const r = await A.decideDocument('q1', 'refuse', 'Trop cher');
  assert.equal(r.ok, true);
  const upd = calls.find((c) => c.table === 'quote' && c.method === 'update');
  assert.equal(upd.args[0].status, 'refuse');
  assert.equal(upd.args[0].refusal_note, 'Trop cher');
});

test('newVersion : pas pour une facture, pas pour un brouillon, pas après acceptation ; sinon le document redevient brouillon', async () => {
  assert.match((await setup({ doc: detail({ kind: 'facture', status: 'envoye' }) }).A.newVersion('q1')).message, /facture/);
  assert.match((await setup().A.newVersion('q1')).message, /déjà un brouillon/);
  assert.match((await setup({ doc: detail({ status: 'accepte' }) }).A.newVersion('q1')).message, /accepté/);
  const { A, calls } = setup({ doc: detail({ status: 'envoye', versions: [{ version: 1 }] }), rows: { quote: [{ id: 'q1' }] } });
  const r = await A.newVersion('q1');
  assert.equal(r.ok, true);
  assert.match(r.message, /Version 2/);
  assert.equal(calls.find((c) => c.table === 'quote' && c.method === 'update').args[0].status, 'brouillon');
  assert.equal(calls.find((c) => c.table === 'document_event' && c.method === 'insert').args[0].kind, 'corrige');
});

test('decideByToken refuse un lien trop court et passe la décision à la base', async () => {
  const { A, calls } = setup({ rows: { rpc: 'accepte' } });
  assert.equal((await A.decideByToken('court', true, 'Jo', '')).ok, false);
  const r = await A.decideByToken('ab'.repeat(24), true, 'Jo Acme', '');
  assert.equal(r.ok, true);
  assert.match(r.message, /acceptation/);
  const call = calls.find((c) => c.table === 'rpc' && c.method === 'decide_document_by_token');
  assert.equal(call.args.p_accept, true);
  assert.equal(call.args.p_typed_name, 'Jo Acme');
});
