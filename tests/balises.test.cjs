/**
 * Tests du moteur de balises des modèles (`lib/documents/balises.ts`) :
 * l'analyse d'un corps, la reconnaissance et la conversion des formes
 * héritées, le rendu avec blocs répétés, conditionnels et inversés.
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

function loadTs(file) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: () => ({}), Math, Set, Map, Number, Array, String, Object }, { filename: file });
  return exports;
}

const B = loadTs('lib/documents/balises.ts');

test('analyzeTemplate compte les balises reconnues, signale les inconnues avec une suggestion', () => {
  const a = B.analyzeTemplate('<p>{{client.nom}} {{client.nom}} {{client.nom_commercial}} {{total.tvh}}</p>');
  same(a.known, ['client.nom']);
  assert.equal(a.unknown.length, 2);
  assert.equal(a.unknown[0].tag, 'client.nom_commercial');
  assert.equal(a.unknown[0].suggestion, 'client.nom');
  assert.equal(a.unknown[1].suggestion, 'total.tvq');
  assert.equal(B.isComplete(a), false);
});

test('analyzeTemplate voit les blocs, les sections et les blocs mal fermés', () => {
  const a = B.analyzeTemplate(
    '{{#lignes}}{{ligne.description}}{{/lignes}} {{section.besoins}} {{section.preuve}} {{#remise}}x{{/remise}} {{#offres}}{{offre.nom}}{{#offre.lignes}}{{ligne.texte}}{{/offre.lignes}}{{/offres}} {{#jalons}}',
    ['besoins', 'objectifs'],
  );
  same(a.blocks, ['lignes', 'remise', 'offres', 'offre.lignes', 'jalons']);
  same(a.sectionsUsed, ['besoins', 'preuve']);
  same(a.sectionsMissing, ['preuve']);
  same(a.sectionsUnplaced, ['objectifs']);
  same(a.unbalanced, ['{{#jalons}}']);
  assert.equal(a.unknown.length, 0);
  assert.equal(B.isComplete(a), false);
});

test('Les formes héritées sont reconnues, converties, et leur surlignage retiré', () => {
  const html = '<h1><mark class="tk">{{ENTREPRISE_CLIENT}}</mark></h1> <mark class="tk">{{PRENOM_CLIENT}} {{NOM_CLIENT}}</mark> '
    + '<span data-todo="" style="x">[NOM DU CLIENT]</span> <strong data-todo="" style="y">[MONTANT TPS]</strong> {{INCONNU_X}} [CHOSE INCONNUE]';
  const legacy = B.findLegacy(html);
  same(legacy.map((l) => l.raw), ['{{ENTREPRISE_CLIENT}}', '{{PRENOM_CLIENT}}', '{{NOM_CLIENT}}', '{{INCONNU_X}}', '[NOM DU CLIENT]', '[MONTANT TPS]', '[CHOSE INCONNUE]']);
  assert.equal(legacy.find((l) => l.raw === '[NOM DU CLIENT]').canonical, 'client.raison_sociale');
  assert.equal(legacy.find((l) => l.raw === '{{INCONNU_X}}').canonical, null);
  const out = B.convertLegacy(html);
  assert.equal(out, '<h1>{{client.nom}}</h1> {{client.contact.nom}} {{client.raison_sociale}} {{total.tps}} {{INCONNU_X}} [CHOSE INCONNUE]');
  assert.equal(B.analyzeTemplate(out).legacy.length, 2, 'ce que l’annexe ne connaît pas reste signalé');
});

test('renderTemplate répète les listes, conditionne sur le vide, inverse, et laisse les balises sans valeur', () => {
  const html = '{{client.nom}}|{{#lignes}}[{{ligne.description}}:{{ligne.montant}}]{{/lignes}}|{{#remise}}R{{remise.montant}}{{/remise}}|{{^remise}}sans remise{{/remise}}|{{#vide}}X{{/vide}}|{{inconnu.balise}}';
  const out = B.renderTemplate(html, {
    client: { nom: 'SHGM' },
    lignes: [{ description: 'A', montant: '1 $' }, { description: 'B', montant: '2 $' }],
    remise: null,
    vide: [],
  });
  assert.equal(out, 'SHGM|[A:1 $][B:2 $]||sans remise||{{inconnu.balise}}');
  same(B.unfilledTags(out), ['inconnu.balise']);
  const withRemise = B.renderTemplate('{{#remise}}−{{remise.montant}}{{/remise}}{{^remise}}rien{{/remise}}', { remise: { montant: '5 $' } });
  assert.equal(withRemise, '−5 $');
});

test('Les blocs imbriqués voient leur élément, puis le contexte englobant', () => {
  const html = '{{#offres}}<h3>{{offre.nom}}</h3>{{#offre.populaire}}★{{/offre.populaire}}{{#offre.lignes}}<li>{{ligne.texte}} ({{offre.nom}})</li>{{/offre.lignes}}{{^offre.lignes}}rien{{/offre.lignes}}{{/offres}}';
  const out = B.renderTemplate(html, {
    offres: [
      { nom: 'Présence', populaire: false, lignes: [{ texte: 'Site' }, { texte: 'SEO' }] },
      { nom: 'Croissance', populaire: true, lignes: [] },
    ],
  });
  assert.equal(out, '<h3>Présence</h3><li>Site (Présence)</li><li>SEO (Présence)</li><h3>Croissance</h3>★rien');
});

test('Les sections se rendent depuis section.<cle>, et une section vide retire son bloc', () => {
  const html = '{{#section.preuve}}<div>{{section.preuve}}</div>{{/section.preuve}}<p>{{section.besoins}}</p>';
  assert.equal(B.renderTemplate(html, { section: { preuve: '', besoins: '<b>Texte</b>' } }), '<p><b>Texte</b></p>');
  assert.equal(B.renderTemplate(html, { section: { preuve: 'Cas', besoins: 'T' } }), '<div>Cas</div><p>T</p>');
});

test('Le dictionnaire couvre les balises des blocs et des groupes', () => {
  assert.ok(B.KNOWN_TAGS.includes('ligne.description'));
  assert.ok(B.KNOWN_TAGS.includes('offre.nom'));
  assert.ok(B.KNOWN_TAGS.includes('benefice.texte'));
  assert.ok(B.KNOWN_TAGS.includes('agence.logo'));
  assert.equal(B.closestTag('agence.telephon'), 'agence.telephone');
  assert.equal(B.closestTag('zzz.qqq.www'), null);
});
