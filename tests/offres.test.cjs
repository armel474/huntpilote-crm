/**
 * Tests du brouillon d'offre (`lib/data/offres.ts`) : la traduction entre les
 * lignes plates de la base et les groupes d'options de l'écran, la valeur
 * catalogue, les boucles d'inclusion, et la relecture d'un brouillon reçu
 * du navigateur.
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

function loadTs(file) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: () => ({}), Math, Set, Map, Number, Array }, { filename: file });
  return exports;
}

const O = loadTs('lib/data/offres.ts');

const line = (over) => ({
  id: 'l', label: 'x', customLabel: null, quantity: 1, position: 0, catalogItemId: null, includedOfferId: null,
  includedOffer: false, optionGroup: null, optionKey: null, ...over,
});
const offer = (over) => ({
  id: 'o1', code: 'o1', name: 'Offre', tagline: null, description: null, priceCents: 1000, priceIsFrom: false,
  billing: 'ponctuel', introPriceCents: null, introPeriods: null, deliveryWeeksMin: null, deliveryWeeksMax: null,
  freeConsultMinutes: null, overageHourlyRateCents: null, isPopular: false, active: true, position: 1,
  recommendedOfferId: null, catalogValueCents: 0, discountCents: 0, lines: [], benefits: [], segments: [],
  tasks: [], deliverables: [], activeSubscriptions: 0, ...over,
});

test('toDraft regroupe les alternatives d’un même groupe, dans l’ordre des lignes', () => {
  const d = O.toDraft(offer({
    lines: [
      line({ id: 'a', catalogItemId: 'i1', quantity: 2, customLabel: 'Deux' }),
      line({ id: 'b', catalogItemId: 'i2', optionGroup: 'Hébergement', optionKey: 'nous', label: 'Chez nous' }),
      line({ id: 'c', includedOfferId: 'o0', includedOffer: true }),
      line({ id: 'd', catalogItemId: 'i3', optionGroup: 'Hébergement', optionKey: 'vous', label: 'Chez vous' }),
    ],
  }));
  same(d.lines.map((l) => l.kind), ['article', 'groupe', 'offre']);
  assert.equal(d.lines[0].label, 'Deux');
  assert.equal(d.lines[0].quantity, 2);
  same(d.lines[1].options.map((o) => o.optionKey), ['nous', 'vous']);
  assert.equal(d.lines[2].includedOfferId, 'o0');
});

test('linesToRows remet les groupes à plat, positions continues, libellés vides à null', () => {
  const rows = O.linesToRows([
    { key: 'k', kind: 'article', id: 'a', catalogItemId: 'i1', quantity: 1, label: '  ' },
    { key: 'k', kind: 'groupe', group: ' Hébergement ', options: [
      { key: 'k', id: null, catalogItemId: 'i2', quantity: 1, label: 'Chez nous', optionKey: 'nous' },
      { key: 'k', id: 'd', catalogItemId: 'i3', quantity: 1, label: '', optionKey: 'vous' },
    ] },
    { key: 'k', kind: 'offre', id: null, includedOfferId: 'o0' },
  ]);
  same(rows.map((r) => r.position), [0, 1, 2, 3]);
  assert.equal(rows[0].label, null);
  assert.equal(rows[1].option_group, 'Hébergement');
  assert.equal(rows[1].option_key, 'nous');
  assert.equal(rows[2].id, 'd');
  assert.equal(rows[3].included_offer_id, 'o0');
  assert.equal(rows[3].catalog_item_id, null);
});

test('offerValue suit les offres incluses, compte la première option, signale les articles sans prix', () => {
  const prices = { i1: 1000, i2: 500, i3: null, i4: 300 };
  const inner = offer({ id: 'o0', lines: [line({ id: 'z', catalogItemId: 'i4', quantity: 2 })] });
  const draft = O.toDraft(offer({
    lines: [
      line({ id: 'a', catalogItemId: 'i1' }),
      line({ id: 'b', catalogItemId: 'i2', optionGroup: 'G', optionKey: 'x' }),
      line({ id: 'c', catalogItemId: 'i3', optionGroup: 'G', optionKey: 'y' }),
      line({ id: 'd', includedOfferId: 'o0', includedOffer: true }),
      line({ id: 'e', catalogItemId: 'i3' }),
    ],
  }));
  const v = O.offerValue(draft, { priceOf: (id) => prices[id], offerById: (id) => (id === 'o0' ? inner : undefined) });
  assert.equal(v.totalCents, 1000 + 500 + 600);
  same(v.missing, ['i3']);
});

test('includableOffers écarte l’offre elle-même et celles qui la contiennent déjà', () => {
  const a = offer({ id: 'a' });
  const b = offer({ id: 'b', lines: [line({ includedOfferId: 'a', includedOffer: true })] });
  const c = offer({ id: 'c', lines: [line({ includedOfferId: 'b', includedOffer: true })] });
  const d = offer({ id: 'd' });
  const ids = O.includableOffers([a, b, c, d], O.toDraft(a)).map((o) => o.id);
  same(ids, ['d']);
  same(O.includableOffers([a, b, c, d], O.emptyDraft('x')).map((o) => o.id), ['a', 'b', 'c', 'd']);
});

test('parseDraft refuse ce qui casserait la base, et nettoie le reste', () => {
  const base = { ...O.emptyDraft('code'), name: 'Nom', priceCents: 100 };
  assert.equal(typeof O.parseDraft({ ...base, name: ' ' }), 'string');
  assert.equal(typeof O.parseDraft({ ...base, introPriceCents: 100, introPeriods: null, billing: 'mensuel' }), 'string');
  assert.equal(typeof O.parseDraft({ ...base, id: 'o1', recommendedOfferId: 'o1' }), 'string');
  assert.equal(typeof O.parseDraft({ ...base, id: 'o1', lines: [{ kind: 'offre', includedOfferId: 'o1' }] }), 'string');
  assert.equal(typeof O.parseDraft({ ...base, lines: [{ kind: 'groupe', group: 'G', options: [{ catalogItemId: 'i', quantity: 1, optionKey: 'a' }] }] }), 'string');
  assert.equal(typeof O.parseDraft({ ...base, tasks: [{ title: 'T', kind: 'technique', cadence: 'mensuel', optionGroup: 'G', optionKey: 'z' }] }), 'string');
  assert.equal(typeof O.parseDraft({ ...base, deliverables: [{ code: 'L-01', title: 'A' }, { code: 'L-01', title: 'B' }] }), 'string');

  const ok = O.parseDraft({
    ...base,
    code: 'Mon Code !',
    billing: 'ponctuel',
    introPriceCents: 5,
    introPeriods: 1,
    overageHourlyRateCents: 900,
    segments: [' PME ', ''],
    lines: [{ kind: 'groupe', group: 'G', options: [
      { catalogItemId: 'i1', quantity: 1, optionKey: 'Chez nous' }, { catalogItemId: 'i2', quantity: 1, optionKey: 'vous' },
    ] }],
    tasks: [{ title: ' T ', kind: 'contenu', cadence: 'signature', dueDay: 7, optionGroup: 'G', optionKey: 'chez-nous' }],
    deliverables: [{ code: 'L-01', title: 'A', includedRounds: 2 }],
  });
  assert.equal(typeof ok, 'object');
  assert.equal(ok.code, 'mon-code');
  assert.equal(ok.introPriceCents, null, 'pas de tarif d’entrée sur une offre ponctuelle');
  assert.equal(ok.overageHourlyRateCents, null, 'pas de dépassement sur une offre ponctuelle');
  same(ok.segments, ['PME']);
  assert.equal(ok.lines[0].options[0].optionKey, 'chez-nous');
  assert.equal(ok.tasks[0].title, 'T');
  assert.equal(ok.tasks[0].defaultRole, null);
});

test('dueLabel dit l’échéance en clair', () => {
  assert.equal(O.dueLabel({ cadence: 'signature', dueDay: 7 }), 'Jour 7');
  assert.equal(O.dueLabel({ cadence: 'mensuel', dueDay: 3 }), 'Chaque mois, jour 3');
  assert.equal(O.dueLabel({ cadence: 'trimestriel', dueDay: null }), 'Chaque trimestre, fin de période');
});
