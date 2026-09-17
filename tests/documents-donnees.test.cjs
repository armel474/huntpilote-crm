/**
 * Tests des données d'un document (`lib/documents/donnees.ts`) : les totaux
 * selon la nature et la récurrence des lignes, les blocs de lignes qu'un
 * modèle parcourt, les blocs de totaux (acompte, solde, remise, budget).
 *
 *   node --test tests/
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const same = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));
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
  vm.runInNewContext(outputText, { exports, require: (n) => deps[n] ?? {}, Math, Set, Map, Number, Array, String, Object, Intl, Date, Promise }, { filename: file });
  return exports;
}

const money = (cents, { exact = false } = {}) => `${(cents / 100).toFixed(exact ? 2 : 0)} $`;
const D = loadTs('lib/documents/donnees.ts', { '@/lib/format': { money } });

const L = (description, unitPriceCents, kind = 'facturable', billing = 'ponctuel', quantity = 1) => ({ description, quantity, unitPriceCents, kind, billing });

test('computeTotals : le facturable et les remises entrent dans le hors taxes, l’offert et l’informatif non', () => {
  const t = D.computeTotals([L('Site', 900000), L('Rabais', -100000, 'remise'), L('Cadeau', 50000, 'offert'), L('Budget pub', 30000, 'informatif'), L('SEO', 40000, 'facturable', 'mensuel')]);
  assert.equal(t.ht, 840000);
  assert.equal(t.ponctuel, 800000);
  assert.equal(t.recurrent, 40000);
  assert.equal(t.remise, 100000);
  assert.equal(t.informatif, 30000);
  assert.equal(t.tps, Math.round(840000 * 0.05));
  assert.equal(t.tvq, Math.round(840000 * 0.09975));
  assert.equal(t.ttc, t.ht + t.tps + t.tvq);
});

test('computeTotals arrondit chaque taxe au cent, puis additionne — comme la vue quote_total', () => {
  const t = D.computeTotals([L('Article', 1234, 'facturable', 'ponctuel', 3)]);
  assert.equal(t.ht, 3702);
  assert.equal(t.tps, 185);
  assert.equal(t.tvq, 369);
  assert.equal(t.ttc, 4256);
});

test('computeTotals suit des taux figés quand on les lui donne', () => {
  const t = D.computeTotals([L('Article', 10000)], { tps: 0.07, tvq: 0.1 });
  assert.equal(t.tps, 700);
  assert.equal(t.tvq, 1000);
});

test('linesToBlocks classe les lignes par récurrence et par nature, et libelle l’offert', () => {
  const b = D.linesToBlocks([L('Site', 900000), L('SEO', 40000, 'facturable', 'mensuel'), L('Cadeau', 0, 'offert'), L('Pub', 30000, 'informatif'), L('Rabais', -10000, 'remise')]);
  same(b.lignes.map((l) => l.description), ['Site', 'SEO', 'Cadeau', 'Pub', 'Rabais']);
  same(b.lignes_ponctuelles.map((l) => l.description), ['Site', 'Rabais']);
  same(b.lignes_recurrentes.map((l) => l.description), ['SEO']);
  same(b.lignes_offertes.map((l) => l.description), ['Cadeau']);
  same(b.lignes_informatives.map((l) => l.description), ['Pub']);
  assert.equal(b.lignes_offertes[0].prix, 'Offert');
  assert.equal(b.lignes_offertes[0].montant, 'Offert');
  assert.equal(b.lignes_recurrentes[0].recurrence, '/ mois');
  assert.equal(b.lignes[0].nature, 'Facturable');
});

test('totalsToBlocks : acompte et solde à parts égales du ponctuel, remise en pourcentage, budget informatif', () => {
  const t = D.computeTotals([L('Site', 900000), L('Rabais', -100000, 'remise'), L('SEO', 40000, 'facturable', 'mensuel'), L('Pub', 30000, 'informatif')]);
  const b = D.totalsToBlocks(t, 3);
  assert.equal(b.acompte.montant_ht, '4000.00 $');
  assert.equal(b.solde.montant_ht, '4000.00 $');
  assert.equal(b.acompte.pourcentage, 50);
  assert.equal(b.remise.montant, '1000.00 $');
  assert.equal(b.remise.pourcentage, 11);
  assert.equal(b.total.mensuel_ht, '400.00 $');
  assert.equal(b.total.recurrent_engagement, '1200.00 $');
  assert.equal(b.total.avant_remise, '9000.00 $');
  assert.equal(b.budget.mensuel, '300.00 $');
  assert.equal(b.budget.total, '900.00 $');
});

test('totalsToBlocks : sans remise ni budget, les blocs sont nuls et le modèle peut les conditionner', () => {
  const b = D.totalsToBlocks(D.computeTotals([L('Site', 100000)]));
  assert.equal(b.remise, null);
  assert.equal(b.budget, null);
  assert.equal(b.total.mensuel_ht, '');
  assert.equal(b.solde.montant_ttc, '574.88 $');
});

test('agencyBlock : l’adresse s’assemble, et une agence absente garde des champs vides', () => {
  const a = D.agencyBlock({ name: 'DigiHunt', legal_name: null, address: '12 rue A', city: 'Sherbrooke', province: 'QC', postal_code: 'J1H 1A1', phone: null, email: 'x@y.ca', website: null, gst_number: '1234', qst_number: null, neq: null, logo_url: null, representative_name: 'A. N.', representative_title: 'Fondateur', judicial_district: null });
  assert.equal(a.adresse, '12 rue A, Sherbrooke (QC), J1H 1A1');
  assert.equal(a.raison_sociale, 'DigiHunt');
  assert.equal(a.tvq, '');
  assert.equal(D.agencyBlock(null).nom, 'Votre agence');
});
