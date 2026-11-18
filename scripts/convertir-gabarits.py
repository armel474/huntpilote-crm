#!/usr/bin/env python3
"""
Convertit les quatre gabarits réels de l'agence (dossier `design/`) en
modèles de documents à la syntaxe canonique, et produit le semis qui les
pose dans la base.

    python3 scripts/convertir-gabarits.py

Entrées : `design/Documentations DigiHunt/export/Gabarits-DigiHunt/*.html`
et `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/*.html`.
Sorties : `supabase/gabarits/*.html` (le corps de chaque modèle, relisible)
et `supabase/seed_04_gabarits.sql` (rejouable).

Ce que la conversion fait, et pourquoi (analyse, sections 3.1, 3.2, 3.6,
annexe A ; décisions du 14 septembre 2026) :

  · les balises héritées `{{MAJUSCULES}}` et `[MAJUSCULES]` deviennent
    `{{groupe.champ}}`, leur surlignage de gabarit disparaît ;
  · la page interne « Légende d'utilisation » est retirée ;
  · le logo, le nom, l'adresse, le téléphone, le courriel et le représentant
    de l'agence, écrits en dur, deviennent des balises `agence.` ;
  · le format passe de A4 à Lettre, et les pages fixes à hauteur cachée
    passent en flux (hauteur minimale, débordement visible) ;
  · les cartes de forfaits, le tableau de maintenance, les livrables, les
    jalons, les exclusions, le contenu à fournir deviennent des blocs répétés
    lus dans le catalogue ou le contrat ;
  · les puces « [Compléter : …] » deviennent des sections de modèle, avec ce
    texte comme guide par défaut.

Le script s'arrête à la première ancre qu'il ne retrouve pas : un gabarit
modifié se convertit consciemment, pas en silence.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OFFRE = ROOT / 'design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html'
META = ROOT / 'design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Acquisition Meta Ads.dc.html'
CONTRAT = ROOT / 'design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html'
ANNEXE = ROOT / 'design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Annexe A DigiHunt.html'
OUT = ROOT / 'supabase/gabarits'
SEED = ROOT / 'supabase/seed_04_gabarits.sql'

AGENCY = '11110000-0000-0000-0000-000000000001'

# Annexe A — la même table que `lib/documents/balises.ts` (LEGACY_MAP).
LEGACY = {
    'ENTREPRISE_CLIENT': 'client.nom', 'PRENOM_CLIENT': 'client.contact.prenom', 'NOM_CLIENT': 'client.contact.nom',
    'TITRE_CLIENT': 'client.contact.titre', 'VILLE': 'client.ville', 'VILLE_CLIENT': 'client.ville',
    'SECTEUR': 'client.secteur', 'SECTEUR_CLIENT': 'client.secteur', 'ADRESSE_CLIENT': 'client.adresse',
    'COURRIEL_CLIENT': 'client.courriel', 'TEL_CLIENT': 'client.telephone', 'DATE': 'document.date',
    'DATE_EXPIRATION': 'document.echeance', 'VALIDITE': 'document.echeance', 'DATE_RENCONTRE': 'brief.date_appel',
    'ATOUT_PRINCIPAL': 'brief.atout_principal', 'PROBLEME_CARDINAL': 'brief.probleme_cardinal',
    'OBJECTIF_PRINCIPAL': 'brief.objectif_principal', 'RESULTAT_CHIFFRE': 'brief.resultat_vise',
    'CANAL_ACTUEL': 'brief.canal_actuel', 'CANAL_PUB': 'brief.canal_publicitaire', 'TAUX_ANNULATION': 'brief.taux_annulation',
    'COEUR_METIER': 'brief.coeur_metier', 'OFFRE_SPECIALISEE': 'brief.offre_specialisee',
    'ATOUT_CONCURRENTIEL': 'brief.atout_concurrentiel', 'SYSTEME_RESERVATION': 'brief.systeme_reservation',
    'FORFAIT_RECOMMANDE': 'offre_recommandee.nom', 'PRIX_FORFAIT': 'offre_recommandee.prix', 'DUREE': 'offre_recommandee.delai',
    'DELAI_LANCEMENT': 'offre_recommandee.delai', 'FORFAIT_MAINTENANCE': 'maintenance_recommandee.nom',
    'PRIX_MAINTENANCE': 'maintenance_recommandee.prix_mensuel', 'PRIX_PHASE1': 'total.ponctuel_ht',
    'PRIX_PHASE1_BARRE': 'total.avant_remise', 'ESCOMPTE_PCT': 'remise.pourcentage', 'MONTANT_ESCOMPTE': 'remise.montant',
    'PRIX_MENSUEL': 'total.mensuel_ht', 'ENGAGEMENT_MOIS': 'document.engagement_mois', 'TOTAL_PHASE2': 'total.recurrent_engagement',
    'TOTAL_HONORAIRES': 'total.ht', 'TOTAL_GLOBAL': 'total.global_estime', 'ACOMPTE': 'acompte.montant_ht', 'SOLDE': 'solde.montant_ht',
    'BUDGET_META_TOTAL': 'budget.total', 'BUDGET_MENSUEL': 'budget.mensuel', 'BUDGET_JOUR': 'budget.quotidien',
    'NOM DU CLIENT': 'client.raison_sociale', 'FORME JURIDIQUE DU CLIENT': 'client.forme_juridique',
    'ADRESSE DU CLIENT': 'client.adresse', 'NOM DU REPRÉSENTANT DU CLIENT': 'client.contact.nom',
    'TITRE DU REPRÉSENTANT DU CLIENT': 'client.contact.titre', 'NOM DU SIGNATAIRE CLIENT': 'client.contact.nom',
    'TITRE DU SIGNATAIRE CLIENT': 'client.contact.titre', 'NOM DU CONTACT CLIENT': 'client.contact.nom',
    'TITRE DU CONTACT CLIENT': 'client.contact.titre', 'NUMÉRO DE PROPOSITION': 'proposition.reference',
    'DATE DE LA PROPOSITION': 'proposition.date', 'NUMÉRO DU CONTRAT': 'contrat.reference', 'DATE DU DOCUMENT': 'document.date',
    'MONTANT DES HONORAIRES': 'total.ht', 'MONTANT HONORAIRES': 'total.ht', 'MONTANT TPS': 'total.tps', 'MONTANT TVQ': 'total.tvq',
    'MONTANT TOTAL TTC': 'total.ttc', 'MONTANT ACOMPTE TTC': 'acompte.montant_ttc', 'MONTANT ACOMPTE HT': 'acompte.montant_ht',
    'MONTANT SOLDE TTC': 'solde.montant_ttc', 'MONTANT SOLDE HT': 'solde.montant_ht',
    'DISTRICT JUDICIAIRE': 'agence.district_judiciaire', 'ADRESSE DU PRESTATAIRE': 'agence.adresse',
    'NOMBRE DE PAGES': 'contrat.nombre_pages', 'NOMBRE DE COLLECTIONS CMS': 'contrat.collections_cms',
    'SOLUTION DE PAIEMENT': 'contrat.solution_paiement', 'DATE DE DÉBUT PRÉVUE': 'contrat.date_debut',
    'DATE DE DÉBUT — À CONFIRMER': 'contrat.date_debut',
}

# Les balises rendues avec leur symbole : le « $ » qui les suivait dans le gabarit tombe.
MONEY_TAGS = {
    'total.ht', 'total.tps', 'total.tvq', 'total.ttc', 'total.ponctuel_ht', 'total.mensuel_ht',
    'total.recurrent_engagement', 'total.avant_remise', 'total.global_estime', 'remise.montant',
    'acompte.montant_ht', 'acompte.montant_ttc', 'solde.montant_ht', 'solde.montant_ttc',
    'budget.total', 'budget.mensuel', 'budget.quotidien', 'ligne.montant', 'ligne.prix',
}


def must(html: str, anchor: str, replacement: str, count: int = 1) -> str:
    """Remplace `anchor` exactement `count` fois, ou s'arrête."""
    found = html.count(anchor)
    if found != count:
        sys.exit(f'Ancre introuvable ou ambiguë ({found} fois, {count} attendues) : {anchor[:90]!r}')
    return html.replace(anchor, replacement)


def must_re(html: str, pattern: str, replacement: str, count: int = 1, flags: int = re.S) -> str:
    matches = re.findall(pattern, html, flags)
    if len(matches) != count:
        sys.exit(f'Motif introuvable ou ambigu ({len(matches)} fois, {count} attendues) : {pattern[:90]!r}')
    return re.sub(pattern, replacement, html, flags=flags)


def convert_legacy(html: str) -> str:
    html = re.sub(r'<mark class="tki?"[^>]*>\s*\{\{PRENOM_CLIENT\}\} \{\{NOM_CLIENT\}\}\s*</mark>', '{{client.contact.nom}}', html)

    def mustache(m: re.Match) -> str:
        key = m.group(2)
        if key not in LEGACY:
            return m.group(0)
        return '{{' + LEGACY[key] + '}}'

    html = re.sub(r'(<mark class="tki?"[^>]*>\s*)?\{\{([A-Z][A-Z0-9_]+)\}\}(\s*</mark>)?', mustache, html)

    def bracket(m: re.Match) -> str:
        key = m.group(2).strip()
        if key not in LEGACY:
            return m.group(0)
        tag = '{{' + LEGACY[key] + '}}'
        # Un nom en gras dans le gabarit reste en gras une fois converti.
        if m.group(1) and m.group(1).startswith('<strong') and m.group(3):
            return '<strong>' + tag + '</strong>'
        return tag

    html = re.sub(r'(<(?:span|strong) data-todo=""[^>]*>\s*)?\[([A-ZÀ-Ý][A-ZÀ-Ý0-9 —\'’]+)\](\s*</(?:span|strong)>)?', bracket, html)
    # Le « $ » qui suivait un montant : la balise le porte désormais.
    for tag in MONEY_TAGS:
        t = '{{' + tag + '}}'
        html = re.sub(re.escape(t) + r'\s*<span[^>]*>\s*\$\s*</span>', t, html)
        html = re.sub(re.escape(t) + r'\s*\$(?!\s*CAD)', t, html)
        html = re.sub(re.escape(t) + r'\s*\$ CAD', t + ' CAD', html)
    return html


def strip_document(html: str) -> tuple[str, str]:
    """Rend (styles, corps) : le contenu des <style> hors paged.js, et l'intérieur de <body>."""
    styles = re.findall(r'<style(?! data-pagedjs-ignore)[^>]*>(.*?)</style>', html, re.S)
    body = re.search(r'<body[^>]*>(.*)</body>', html, re.S)
    if not body:
        sys.exit('Pas de <body>')
    inner = body.group(1)
    inner = re.sub(r'<script[^>]*>.*?</script>', '', inner, flags=re.S)
    inner = re.sub(r'<template id="__bundler_thumbnail">.*?</template>', '', inner, flags=re.S)
    return '\n'.join(s.strip() for s in styles), inner


def common_style(css: str) -> str:
    css = css.replace("url('fonts/NotoSans[wdth,wght].ttf') format('truetype')", "url('/fonts/NotoSans-VariableFont_wdth_wght.ttf') format('truetype-variations')")
    css = css.replace("'Consolas',monospace", 'ui-monospace,monospace').replace('Consolas,Menlo,monospace', 'ui-monospace,monospace')
    css = css.replace('size:A4;', 'size:Letter;').replace('size: A4;', 'size: Letter;')
    return css


FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Noto+Sans:wght@400;600;700&display=swap');\n"


def flow_pages(css: str) -> str:
    """Les pages fixes à hauteur cachée deviennent des pages en flux, au format Lettre."""
    css = must(css, '.page{position:relative;width:210mm;height:297mm;', '.page{position:relative;width:216mm;min-height:279mm;height:auto;')
    css = must(css, 'overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,.32);}', 'overflow:visible;box-shadow:0 6px 28px rgba(0,0,0,.32);}')
    css = css.replace('body{font-family:\'NS\',sans-serif;background:#55585C;}', 'body{font-family:\'NS\',\'Noto Sans\',sans-serif;background:#55585C;}')
    return css


# ─────────────────────────────────────────────────────────────────────────────
# Les sections de modèle extraites des puces « [Compléter : …] »
# ─────────────────────────────────────────────────────────────────────────────

BULL_LIST_RE = r'<div style="border-top:1px solid #E8E3E3;padding-top:12px;display:flex;flex-direction:column;gap:6px;">\s*((?:<div class="bull">.*?</div>\s*)+)</div>'
BULL_ITEM_RE = r'<div class="bull"><span class="bull-dot">—</span><span style="color:#9A9594;font-style:italic;">(.*?)</span></div>'


def bull(lines: list[str]) -> str:
    return '\n'.join(f'<div class="bull"><span class="bull-dot">—</span><span>{l}</span></div>' for l in lines)


def convert_offre() -> tuple[str, list[dict]]:
    raw = OFFRE.read_text(encoding='utf-8')
    css, body = strip_document(raw)
    css = flow_pages(common_style(css))
    sections: list[dict] = []

    # La page interne « Légende d'utilisation ».
    body = must_re(body, r'<div class="page screen-only".*?</section>\s*</div>\s*', '')
    body = convert_legacy(body)

    # L'agence, écrite en dur.
    body = body.replace('src="assets/logo-black.png"', 'src="{{agence.logo}}"').replace('src="assets/logo-gold.png"', 'src="{{agence.logo}}"')
    body = must(body, 'Présentée par Armel Junior Nguimbi, fondateur de DigiHunt, à l\'intention de', 'Présentée par {{agence.representant}}, {{agence.representant_titre}} de {{agence.nom}}, à l\'intention de')
    body = must(body, '<div class="ar" style="font-weight:700;font-size:15px;color:#232526;">Armel Junior Nguimbi</div><div style="font-size:12px;color:#7E7978;margin-top:4px;">Fondateur, Agence DigiHunt</div>',
                '<div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{agence.representant}}</div><div style="font-size:12px;color:#7E7978;margin-top:4px;">{{agence.representant_titre}}, {{agence.nom}}</div>')
    body = must(body, 'Agence DigiHunt · 221, 25<sup>e</sup> Rue des Mouettes, Québec (QC), G1E 7G1<br>+1 (581) 994-0142 · armel.master@agencedh.com',
                '{{agence.nom}} · {{agence.adresse}}<br>{{agence.telephone}} · {{agence.courriel}}')
    body = must(body, '<div class="ar" style="font-weight:700;font-size:15px;color:#232526;">Armel Junior Nguimbi</div><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7E7978;margin-top:3px;">Fondateur, DigiHunt</div><div style="font-size:12px;color:#9A9594;margin-top:8px;line-height:1.75;">armel.master@agencedh.com<br>+1 (581) 994-0142</div>',
                '<div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{agence.representant}}</div><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7E7978;margin-top:3px;">{{agence.representant_titre}}, {{agence.nom}}</div><div style="font-size:12px;color:#9A9594;margin-top:8px;line-height:1.75;">{{agence.courriel}}<br>{{agence.telephone}}</div>')
    body = must(body, '<strong style="color:#232526;">Courriel officiel</strong> — armel.master@agencedh.com', '<strong style="color:#232526;">Courriel officiel</strong> — {{agence.courriel}}')
    body = must(body, 'Fournisseur — Agence DigiHunt', 'Fournisseur — {{agence.nom}}')
    body = must(body, '<div class="ar" style="font-weight:600;font-size:14px;color:#232526;">Armel Junior Nguimbi</div>', '<div class="ar" style="font-weight:600;font-size:14px;color:#232526;">{{agence.representant}}</div>')
    body = must(body, '<div style="font-size:13px;color:#232526;">Fondateur, Agence DigiHunt</div>', '<div style="font-size:13px;color:#232526;">{{agence.representant_titre}}, {{agence.nom}}</div>')
    body = must(body, '221, 25<sup>e</sup> Rue des Mouettes, Québec (QC), G1E 7G1<br>+1 (581) 994-0142 · armel.master@agencedh.com', '{{agence.adresse}}<br>{{agence.telephone}} · {{agence.courriel}}')

    # La pagination écrite en dur : le numéro de page devient la référence du document.
    body = re.sub(r'<span>Page \d+ / 16</span>', '<span>{{document.reference}}</span>', body)
    body = must_re(body, r'<span style="font-size:11px;color:#C49A2E;white-space:nowrap;">p\. [0-9–]+</span>', '', count=11)
    body = must(body, '<p style="font-size:11px;color:#9A9594;margin:12px 0 0;font-style:italic;text-align:right;">Document de 16 pages. La pagination peut varier selon les sections activées ou retirées.</p>', '')
    body = must(body, '<div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Présence Digitale · Croissance Digitale · Commerce Digital</div>', '<div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Les forfaits du catalogue</div>')

    # Section 02 — trois cartes, trois sections.
    keys02 = [('besoins_positionnement', 'Compréhension — positionnement métier'), ('besoins_cible', 'Compréhension — cible principale'), ('besoins_differenciation', 'Compréhension — différenciation concurrentielle')]
    keys03 = [('objectifs_affaires', 'Objectifs d’affaires'), ('objectifs_structure', 'Structure du site'), ('objectifs_fonctionnalites', 'Fonctionnalités ciblées')]
    lists = list(re.finditer(BULL_LIST_RE, body, re.S))
    if len(lists) != 3:
        sys.exit(f'Section 02 : {len(lists)} listes trouvées, 3 attendues')
    for (key, title), m in zip(keys02, lists):
        items = re.findall(BULL_ITEM_RE, m.group(1), re.S)
        sections.append(dict(key=key, title=title, default_body=bull(items), optional=False, ai_assist=True, locked=False, max_chars=700))
    for (key, _), m in reversed(list(zip(keys02, lists))):
        body = body[:m.start()] + '<div style="border-top:1px solid #E8E3E3;padding-top:12px;display:flex;flex-direction:column;gap:6px;">{{section.' + key + '}}</div>' + body[m.end():]

    # Section 03 — les puces à compléter des trois premières cartes.
    list03_re = r'<div style="display:flex;flex-direction:column;gap:7px;">\s*((?:<div class="bull">.*?</div>\s*)+)</div>'
    lists03 = list(re.finditer(list03_re, body, re.S))
    if len(lists03) != 4:
        sys.exit(f'Section 03 : {len(lists03)} listes trouvées, 4 attendues')
    for (key, title), m in zip(keys03, lists03[:3]):
        items = re.findall(BULL_ITEM_RE, m.group(1), re.S)
        sections.append(dict(key=key, title=title, default_body=bull(items), optional=False, ai_assist=True, locked=False, max_chars=500))
    for (key, _), m in reversed(list(zip(keys03, lists03[:3]))):
        keep = re.findall(r'<div class="bull"><span class="bull-dot">—</span><span><strong style="color:#232526;">.*?</strong></span></div>', m.group(1), re.S)
        body = body[:m.start()] + '<div style="display:flex;flex-direction:column;gap:7px;">' + ''.join(keep) + '{{section.' + key + '}}</div>' + body[m.end():]
    body = must(body, '<div class="bull" style="color:rgba(255,250,250,.5);font-style:italic;"><span style="color:#D0A837;font-weight:800;flex-shrink:0;">—</span><span>[Zone secondaire / rayonnement élargi si applicable]</span></div>',
                '{{#brief.zone_secondaire}}<div class="bull" style="color:rgba(255,250,250,.75);"><span style="color:#D0A837;font-weight:800;flex-shrink:0;">—</span><span>Rayonnement élargi : {{brief.zone_secondaire}}</span></div>{{/brief.zone_secondaire}}')

    # Section 04 — trois pages de forfaits en dur deviennent un bloc {{#offres}}.
    page_re = r'<div class="page">(?:(?!<div class="page">)[\s\S])*?<span class="ch-num">%s</span>(?:(?!<div class="page">)[\s\S])*?<div class="pg-foot">.*?</div>\s*</div>'
    pages = re.findall(page_re % '04', body, re.S)
    if len(pages) != 3:
        sys.exit(f'Section 04 : {len(pages)} pages trouvées, 3 attendues')
    start = body.index(pages[0])
    end = body.index(pages[2]) + len(pages[2])
    card = pages[0]
    card = must(card, '<div class="keep" style="position:relative;display:flex;gap:26px;align-items:flex-start;border-radius:8px;padding:24px 26px;margin-bottom:18px;background:#fff;border:1px solid #E8E3E3;box-shadow:0 2px 8px rgba(35,37,38,.05);">\n      \n      <div style="flex:1 1 0;min-width:0;">\n        <div class="hl" style="color:#C49A2E;margin-bottom:9px;">Forfait création</div>',
                '<div class="keep" style="position:relative;display:flex;gap:26px;align-items:flex-start;border-radius:8px;padding:24px 26px;margin-bottom:18px;background:#fff;border:1px solid #E8E3E3;box-shadow:0 2px 8px rgba(35,37,38,.05);">\n      <div style="flex:1 1 0;min-width:0;">\n        <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;flex-wrap:wrap;"><span class="hl" style="color:#C49A2E;">Forfait création</span>{{#offre.populaire}}<span style="background:#D0A837;color:#232526;font-family:\'Archivo\',sans-serif;font-weight:800;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;padding:3px 8px;border-radius:4px;white-space:nowrap;">Le plus populaire</span>{{/offre.populaire}}</div>')
    card = must(card, 'Présence<br>Digitale</h3>', '{{offre.nom}}</h3>')
    card = must(card, 'Indépendants et petites entreprises qui veulent une vitrine crédible (max. 10 pages).', '{{offre.accroche}}')
    card = must_re(card, r'<div style="display:flex;flex-wrap:wrap;gap:5px;">(?:<span style="font-size:10px;background:#F5F0F0;border-radius:4px;padding:3px 9px;color:#3A3B3C;">[^<]*</span>)+</div>',
                   '<div style="display:flex;flex-wrap:wrap;gap:5px;">{{#offre.segments}}<span style="font-size:10px;background:#F5F0F0;border-radius:4px;padding:3px 9px;color:#3A3B3C;">{{segment.nom}}</span>{{/offre.segments}}</div>')
    card = must(card, '<span class="ar" style="font-weight:800;font-size:40px;color:#232526;line-height:1;">4 500</span>', '<span class="ar" style="font-weight:800;font-size:40px;color:#232526;line-height:1;">{{offre.prix}}</span>')
    card = must(card, '<div style="font-size:11px;color:#7E7978;margin:7px 0 14px;">À partir de · Paiement unique</div>', '<div style="font-size:11px;color:#7E7978;margin:7px 0 14px;">{{offre.prix_prefixe}}Paiement unique</div>')
    card = must(card, 'Livraison en 4 semaines</div>', '{{#offre.delai}}Livraison en {{offre.delai}}{{/offre.delai}}{{^offre.delai}}Délai convenu ensemble{{/offre.delai}}</div>')
    card = must_re(card, r'<div style="columns:2;column-gap:26px;">\s*(?:<div class="bull" style="font-size:12\.5px;line-height:1\.5;margin-bottom:8px;break-inside:avoid;"><span class="bull-dot">—</span>[^<]*</div>\s*)+</div>',
                   '<div style="columns:2;column-gap:26px;">{{#offre.lignes}}<div class="bull" style="font-size:12.5px;line-height:1.5;margin-bottom:8px;break-inside:avoid;"><span class="bull-dot">—</span>{{ligne.texte}}</div>{{/offre.lignes}}</div>')
    card = must_re(card, r'<div style="background:#F5F0F0;border-radius:8px;padding:15px 17px;margin-bottom:15px;">\s*<div class="hl" style="color:#C49A2E;margin-bottom:8px;">Pack SEO de démarrage</div>\s*<div style="font-size:12px;line-height:1\.62;color:#3A3B3C;">[^<]*</div>\s*</div>',
                   '{{#offre.description}}<div style="background:#F5F0F0;border-radius:8px;padding:15px 17px;margin-bottom:15px;"><div style="font-size:12px;line-height:1.62;color:#3A3B3C;">{{offre.description}}</div></div>{{/offre.description}}')
    card = must_re(card, r'<div style="display:flex;flex-direction:column;gap:9px;">\s*(?:<div style="font-size:12\.5px;font-weight:600;color:#232526;line-height:1\.38;padding-left:12px;border-left:2px solid #D0A837;">[^<]*</div>\s*)+</div>',
                   '<div style="display:flex;flex-direction:column;gap:9px;">{{#offre.benefices}}<div style="font-size:12.5px;font-weight:600;color:#232526;line-height:1.38;padding-left:12px;border-left:2px solid #D0A837;">{{benefice.texte}}</div>{{/offre.benefices}}</div>')
    card = must(card, 'Trois forfaits, une même exigence : un site qui performe. Tous incluent une consultation gratuite de 30 min et un paiement en 2 versements sécurisés.',
                'Nos forfaits, une même exigence : un site qui performe. Tous incluent une consultation gratuite et un paiement en 2 versements sécurisés.')
    body = body[:start] + '{{#offres}}\n' + card + '\n{{/offres}}' + body[end:]

    # Section 05 — la recommandation et le tableau de maintenance.
    body = must(body, '<p style="font-size:14.5px;line-height:1.8;color:#3A3B3C;margin:0;">Résultat visé : <strong>{{brief.resultat_vise}}</strong> · Livraison en <strong>{{offre_recommandee.delai}}</strong> · Investissement : <strong style="color:#232526;">{{offre_recommandee.prix}} $ CAD</strong>.</p>',
                '<p style="font-size:14.5px;line-height:1.8;color:#3A3B3C;margin:0 0 12px;">Résultat visé : <strong>{{brief.resultat_vise}}</strong> · Livraison en <strong>{{offre_recommandee.delai}}</strong> · Investissement : <strong style="color:#232526;">{{offre_recommandee.prix}} $ CAD</strong>.</p>\n    <div style="font-size:14px;line-height:1.75;color:#3A3B3C;">{{section.recommandation}}</div>')
    sections.append(dict(key='recommandation', title='Pourquoi ce forfait', default_body='<p style="margin:0;">[Compléter : en deux ou trois phrases, ce qui, dans la situation du client, rend ce forfait plus juste que les autres.]</p>', optional=True, ai_assist=True, locked=False, max_chars=600))
    body = must_re(body, r'<tbody>\s*<tr><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Essentiel</td>.*?</tbody>',
                   '<tbody>{{#offres_maintenance}}<tr><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">{{offre.nom}}</td><td class="ar" style="font-weight:700;font-size:13px;color:#D0A837;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;white-space:nowrap;">{{offre.prix_mensuel}} $/mois</td><td style="font-size:12.5px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">{{#offre.heures}}{{offre.heures}} h/mois{{#offre.taux_depassement}} ({{offre.taux_depassement}} $/h supp.){{/offre.taux_depassement}} · {{/offre.heures}}{{#offre.lignes}}{{ligne.texte}}{{^dernier}} · {{/dernier}}{{/offre.lignes}}{{#offre.ideal_avec}} · <em>Idéal avec {{offre.ideal_avec}}</em>{{/offre.ideal_avec}}</td></tr>{{/offres_maintenance}}</tbody>')
    body = must(body, '<div style="margin-top:16px;background:#F5F0F0;border-left:3px solid #D0A837;padding:14px 18px;">\n      <p style="font-size:14px;line-height:1.72;color:#232526;margin:0;">Pour {{client.nom}}, nous recommandons le forfait <strong>{{maintenance_recommandee.nom}}</strong> à <strong>{{maintenance_recommandee.prix_mensuel}} $/mois</strong> — sans engagement, résiliable avec 30 jours de préavis.</p>\n    </div>',
                '{{#maintenance_recommandee}}<div style="margin-top:16px;background:#F5F0F0;border-left:3px solid #D0A837;padding:14px 18px;">\n      <p style="font-size:14px;line-height:1.72;color:#232526;margin:0;">Pour {{client.nom}}, nous recommandons le forfait <strong>{{maintenance_recommandee.nom}}</strong> à <strong>{{maintenance_recommandee.prix_mensuel}} $/mois</strong> — sans engagement, résiliable avec 30 jours de préavis.</p>\n    </div>{{/maintenance_recommandee}}')

    # Section 07 — optionnelle : la page entière se retire quand la section reste vide.
    m07 = re.search(page_re % '07', body, re.S)
    if not m07:
        sys.exit('Section 07 introuvable')
    page07 = m07.group(0)
    page07 = must_re(page07, r'<p style="font-size:13\.5px;line-height:1\.72;color:#3A3B3C;margin:0 0 20px;">Remplissez cette section.*?</p>\s*(.*?)</section>',
                     '{{section.preuve}}\n</section>')
    page07 = must(page07, 'Preuve &amp; résultats <span class="opt">Section optionnelle</span>', 'Preuve &amp; résultats')
    body = body[:m07.start()] + '{{#section.preuve}}' + page07 + '{{/section.preuve}}' + body[m07.end():]
    sections.append(dict(key='preuve', title='Preuve et résultats', default_body='', optional=True, ai_assist=False, locked=False, max_chars=2500))
    body = must(body, 'Preuve &amp; résultats <span class="opt">Optionnelle</span>', 'Preuve &amp; résultats <span class="opt">Si des cas clients sont fournis</span>')

    # Section 08 — le récapitulatif lit les lignes du document.
    body = must_re(body, r'<tr>\s*<td style="font-size:14px;color:#232526;padding:16px 16px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Forfait <strong>\{\{offre_recommandee\.nom\}\}</strong>.*?</tr>',
                   '{{#lignes_ponctuelles}}<tr>\n          <td style="font-size:14px;color:#232526;padding:16px 16px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">{{ligne.description}}</td>\n          <td class="ar" style="font-weight:700;font-size:15px;color:#232526;padding:16px 0;border-bottom:1px solid #E8E3E3;text-align:right;vertical-align:top;white-space:nowrap;">{{ligne.montant}}</td>\n        </tr>{{/lignes_ponctuelles}}')
    body = must_re(body, r'<!-- LIGNE BONUS — masquer si aucun bonus -->\s*<tr>.*?Bonus à la signature : \{\{ligne\.description\}\}.*?</tr>|<!-- LIGNE BONUS — masquer si aucun bonus -->\s*<tr>.*?</tr>',
                   '{{#lignes_offertes}}<tr>\n          <td style="font-size:14px;color:#D0A837;padding:16px 16px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;"><span class="opt" style="margin-left:0;margin-right:8px;">Bonus</span>{{ligne.description}}<div style="font-size:12px;color:#9A9594;margin-top:3px;">Valide si la proposition est acceptée avant le {{document.echeance}}</div></td>\n          <td class="ar" style="font-weight:700;font-size:15px;color:#D0A837;padding:16px 0;border-bottom:1px solid #E8E3E3;text-align:right;vertical-align:top;white-space:nowrap;">Offert</td>\n        </tr>{{/lignes_offertes}}')
    body = must(body, '<td class="ar" style="font-weight:800;font-size:18px;color:#232526;padding:18px 0;border-bottom:1.5px solid #232526;text-align:right;vertical-align:top;white-space:nowrap;">{{offre_recommandee.prix}} $</td>',
                '<td class="ar" style="font-weight:800;font-size:18px;color:#232526;padding:18px 0;border-bottom:1.5px solid #232526;text-align:right;vertical-align:top;white-space:nowrap;">{{total.ponctuel_ht}}</td>')
    body = must_re(body, r'<!-- Maintenance — optionnelle -->\s*(<div class="keep" style="background:#F5F0F0;border-left:3px solid #D0A837;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:18px;">.*?</div>\s*</div>\s*</div>)',
                   r'{{#maintenance_recommandee}}\1{{/maintenance_recommandee}}')
    body = must(body, 'Délai de réalisation : <strong>{{offre_recommandee.delai}}</strong>, à compter', 'Délai de réalisation : <strong>{{offre_recommandee.delai}}</strong>, à compter')

    html = '<style>\n' + FONT_IMPORT + css + '\n</style>\n' + body.strip() + '\n'
    return html, sections


def convert_meta() -> tuple[str, list[dict]]:
    raw = META.read_text(encoding='utf-8')
    css, body = strip_document(raw)
    css = flow_pages(common_style(css))
    body = must_re(body, r'<div class="page screen-only".*?</section>\s*</div>\s*', '')
    body = convert_legacy(body)
    body = body.replace('src="assets/logo-black.png"', 'src="{{agence.logo}}"')
    body = must(body, '<div class="ar" style="font-weight:700; font-size:17px; color:#232526;">Armel Junior Nguimbi</div>\n      <div style="font-size:13px; line-height:1.7; color:#3A3B3C; margin-top:6px;">Agence DigiHunt<br>Québec, QC<br><span style="color: rgb(154, 149, 148);">armel.master&#64;agencedh.com · (581) 994-0142</span></div>',
                '<div class="ar" style="font-weight:700; font-size:17px; color:#232526;">{{agence.representant}}</div>\n      <div style="font-size:13px; line-height:1.7; color:#3A3B3C; margin-top:6px;">{{agence.nom}}<br>{{agence.ville}}, QC<br><span style="color: rgb(154, 149, 148);">{{agence.courriel}} · {{agence.telephone}}</span></div>')
    body = must(body, '<div class="ar" style="font-weight:700; font-size:15px; color:#232526; margin-top:10px;">Armel Junior</div>\n      <div style="font-size:12px; letter-spacing:0.04em; color:#7E7978; text-transform:uppercase; margin-top:3px;">DigiHunt</div>',
                '<div class="ar" style="font-weight:700; font-size:15px; color:#232526; margin-top:10px;">{{agence.representant}}</div>\n      <div style="font-size:12px; letter-spacing:0.04em; color:#7E7978; text-transform:uppercase; margin-top:3px;">{{agence.nom}}</div>')
    body = must(body, 'height:calc(297mm - 5px);', 'min-height:calc(279mm - 5px);')
    body = re.sub(r'<span>Page \d+ / 8</span>', '<span>{{document.reference}}</span>', body)

    # La phase 2, optionnelle : elle suit les lignes récurrentes du document.
    m2 = re.search(r'<!-- =+ -->\s*<!-- PAGE 4 — 02 STRATÉGIE & LIVRABLES \(Phase 2\) — OPTIONNELLE\s*-->\s*<!-- =+ -->\s*(<div class="page">.*?</div>\s*</div>)', body, re.S)
    if not m2:
        sys.exit('Page Phase 2 introuvable')
    body = body[:m2.start()] + '{{#total.mensuel_ht}}\n' + m2.group(1) + '\n{{/total.mensuel_ht}}' + body[m2.end():]
    body = must(body, '<span class="opt">Phase 2 optionnelle</span>', '')

    # L'investissement : les lignes du document, la remise, la phase 2, le budget média.
    body = must_re(body, r'<div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #3A3B3C;"><span style="font-size:12\.5px; line-height:1\.45; color:#CFCBCA;">Landing Page haute conversion</span>.*?Configuration Meta Ads complète</span><span class="ar" style="font-weight:700; font-size:13px; color:#FFFAFA; white-space:nowrap;">\{\{ligne\.montant\}\}</span></div>|<div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #3A3B3C;"><span style="font-size:12\.5px; line-height:1\.45; color:#CFCBCA;">Landing Page haute conversion</span>.*?Configuration Meta Ads complète</span>.*?</div>',
                   '{{#lignes_ponctuelles}}<div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #3A3B3C;"><span style="font-size:12.5px; line-height:1.45; color:#CFCBCA;">{{ligne.description}}</span><span class="ar" style="font-weight:700; font-size:13px; color:#FFFAFA; white-space:nowrap;">{{ligne.montant}}</span></div>{{/lignes_ponctuelles}}')
    body = must(body, '<span class="ar" style="font-weight:700; font-size:17px; color:#7E7978; text-decoration:line-through;">{{total.avant_remise}}</span></div>\n      <div style="display:inline-block; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#232526; background:#D0A837; border-radius:4px; padding:4px 9px; margin-bottom:18px;">Escompte de bienvenue −{{remise.pourcentage}} %</div>',
                '{{#remise}}<span class="ar" style="font-weight:700; font-size:17px; color:#7E7978; text-decoration:line-through;">{{total.avant_remise}}</span>{{/remise}}</div>\n      {{#remise}}<div style="display:inline-block; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#232526; background:#D0A837; border-radius:4px; padding:4px 9px; margin-bottom:18px;">Escompte de bienvenue −{{remise.pourcentage}} %</div>{{/remise}}')
    body = must_re(body, r'<!-- LIGNE ESCOMPTE OPTIONNELLE — retirer si aucun rabais -->\s*(<div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #3A3B3C;"><span style="font-size:12\.5px; line-height:1\.45; color:#D0A837;">Escompte de bienvenue.*?</div>)',
                   r'{{#remise}}\1{{/remise}}')
    body = must_re(body, r'(<div style="flex:1 1 240px; background:#FFFAFA; border:1px solid #E8E3E3; box-shadow:0 2px 12px rgba\(35,37,38,0\.06\); border-radius:8px; padding:30px 28px;">\s*<div style="font-size:10px; letter-spacing:0\.16em; text-transform:uppercase; color:#C49A2E; margin-bottom:14px;">Phase 2 · Mensualité.*?</div>\s*</div>)',
                   r'{{#total.mensuel_ht}}\1{{/total.mensuel_ht}}')
    body = must(body, '<span class="opt" style="margin-left:6px;">Opt.</span>', '')
    body = must_re(body, r'<!-- LIGNE ESCOMPTE OPTIONNELLE -->\s*(<tr>\s*<td style="font-size:13\.5px; line-height:1\.5; color:#C49A2E;.*?</tr>)', r'{{#remise}}\1{{/remise}}')
    body = must_re(body, r'<!-- LIGNE PHASE 2 OPTIONNELLE -->\s*(<tr>\s*<td style="font-size:13\.5px; line-height:1\.5; color:#3A3B3C; padding:11px 0; border-bottom:1px solid #E8E3E3;">Phase 2.*?</tr>)', r'{{#total.mensuel_ht}}\1{{/total.mensuel_ht}}')
    body = must_re(body, r'(<tr>\s*<td style="font-size:13\.5px; line-height:1\.5; color:#7E7978; padding:11px 0; border-bottom:1px solid #E8E3E3;">Budget publicitaire Meta.*?</tr>)', r'{{#budget}}\1{{/budget}}')
    body = must_re(body, r'(<div class="keep" style="display:flex; gap:13px; align-items:flex-start; background:#F5F0F0; border-radius:8px; padding:18px 22px;">\s*<span class="ar" style="color:#D0A837; font-weight:800; font-size:14px; line-height:1\.5;">!</span>.*?</div>)', r'{{#budget}}\1{{/budget}}')
    body = must_re(body, r'<!-- LIGNE PHASE 2 OPTIONNELLE -->\s*(<tr>\s*<td style="font-size:13px; line-height:1\.5; color:#232526; padding:13px 16px 13px 0; vertical-align:top;">Mensualité Phase 2.*?</tr>)', r'{{#total.mensuel_ht}}\1{{/total.mensuel_ht}}')
    body = must_re(body, r'<!-- ÉLÉMENT OPTIONNEL — adapter selon le système du client -->\s*(<tr>.*?Accès au système de réservation.*?</tr>)', r'{{#brief.systeme_reservation}}\1{{/brief.systeme_reservation}}')
    body = must(body, '<!-- LIGNE OPTIONNELLE — ajouter / retirer selon le diagnostic -->', '')
    body = must(body, '<!-- Phase 2 card — retirer cette page entière si mandat Phase 1 seule -->', '')
    body = re.sub(r'<!-- =+ -->\s*<!-- PAGE [^>]*-->\s*<!-- =+ -->', '', body)
    body = must(body, 'Récapitulatif de l\'investissement — {{document.engagement_mois}} premiers mois', 'Récapitulatif de l\'investissement{{#total.mensuel_ht}} — {{document.engagement_mois}} premiers mois{{/total.mensuel_ht}}')
    html = '<style>\n' + FONT_IMPORT + css + '\n</style>\n' + body.strip() + '\n'
    return html, []


def contract_style(css: str) -> str:
    css = common_style(css)
    css = css.replace('background: #3A3B3C;', 'background: #fff;')
    css = must(css, '@top-right { content: "[NOM DU CLIENT]";', '@top-right { content: "{{client.raison_sociale}}";')
    css += '\n.content { max-width: 8.5in; margin: 0 auto; padding: 0.9in; background: #fff; box-sizing: border-box; }\n@media print { .content { max-width: none; padding: 0; } }\n'
    return css


def drop_legend(body: str) -> str:
    """Retire la page interne « Légende d'utilisation » (dictionnaire des tokens) qui précède la couverture."""
    return must_re(body, r'<div class="legend-page-inner" style="break-after:page;">.*?</div>\s*\n(?=\s*<div style="(?:height:8\.85in|padding-top:12px))', '')


def convert_contrat() -> tuple[str, list[dict]]:
    raw = CONTRAT.read_text(encoding='utf-8')
    css, body = strip_document(raw)
    css = contract_style(css)
    body = drop_legend(body)
    body = convert_legacy(body)
    body = body.replace('src="assets/logo-black.png"', 'src="{{agence.logo}}"')
    body = must(body, 'height:8.85in;', 'min-height:8.85in;')
    body = must(body, '<p style="margin:0;font-size:18px;color:#3A3B3C;">intervenu entre <strong>Agence DigiHunt</strong></p>', '<p style="margin:0;font-size:18px;color:#3A3B3C;">intervenu entre <strong>{{agence.nom}}</strong></p>')
    body = must(body, '<span style="font-family:Archivo,\'Helvetica Neue\',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8A8F98;">Québec, Canada</span>', '<span style="font-family:Archivo,\'Helvetica Neue\',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8A8F98;">{{agence.ville}}, Canada</span>')
    body = must(body, '<strong data-token="" style="background:#EDF2F8;color:#1C3254;padding:0 3px;border-radius:2px;">Armel Junior Nguimbi</strong>, faisant affaire sous le nom d\'«\u202f<strong>Agence DigiHunt</strong>\u202f», entreprise individuelle immatriculée au Québec, NEQ <span data-token="" style="background:#EDF2F8;color:#1C3254;padding:0 3px;border-radius:2px;">2272419658</span>,',
                '<strong>{{agence.raison_sociale}}</strong>, NEQ {{agence.neq}},')
    body = must(body, '<span data-token="" style="background:#EDF2F8;color:#1C3254;padding:0 3px;border-radius:2px;">virement bancaire ou carte de crédit (facturation transmise via QuickBooks ou Stripe)</span>', '{{document.paiement}}')
    body = re.sub(r'<(strong|span) data-token="" style="[^"]*">(.*?)</\1>', r'<\1>\2</\1>', body)
    body = must(body, '<p style="margin:0 0 10px;font-size:15px;">Nom : <span>Armel Junior Nguimbi</span></p>\n          <p style="margin:0 0 10px;font-size:15px;">Titre : <span>Propriétaire, Agence DigiHunt</span></p>',
                '<p style="margin:0 0 10px;font-size:15px;">Nom : {{agence.representant}}</p>\n          <p style="margin:0 0 10px;font-size:15px;">Titre : {{agence.representant_titre}}, {{agence.nom}}</p>')
    body = must(body, 'Un acompte de <strong>50\u202f%</strong>, soit', 'Un acompte de <strong>{{acompte.pourcentage}}\u202f%</strong>, soit')
    body = must(body, 'Le solde de <strong>50\u202f%</strong>, soit', 'Le solde de <strong>{{solde.pourcentage}}\u202f%</strong>, soit')
    body = must(body, '<td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">TPS (5\u202f%)</td>', '<td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">TPS</td>')
    body = must(body, '<td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">TVQ (9,975\u202f%)</td>', '<td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">TVQ</td>')
    html = '<style>\n' + FONT_IMPORT + css + '\n</style>\n' + body.strip() + '\n'
    return html, []


def convert_annexe() -> tuple[str, list[dict]]:
    raw = ANNEXE.read_text(encoding='utf-8')
    css, body = strip_document(raw)
    css = contract_style(css)
    body = drop_legend(body)
    body = convert_legacy(body)
    body = body.replace('src="assets/logo-black.png"', 'src="{{agence.logo}}"')
    body = must(body, '<p style="margin:0;font-size:16px;color:#3A3B3C;"><strong>Agence DigiHunt</strong> × <strong>{{client.raison_sociale}}</strong></p>', '<p style="margin:0;font-size:16px;color:#3A3B3C;"><strong>{{agence.nom}}</strong> × <strong>{{client.raison_sociale}}</strong></p>')
    body = must(body, 'entre DigiHunt et {{client.raison_sociale}}', 'entre {{agence.nom}} et {{client.raison_sociale}}')
    body = re.sub(r'<span data-token="" style="[^"]*">100</span>', '{{contrat.taux_horaire}}', body)

    # La portée du mandat se rédige par client : une section, avec le texte du gabarit pour guide.
    m1 = re.search(r'(<h2 class="sec">1\. Portée du mandat</h2>\s*)((?:<p style="margin:0(?: 0 10px)?;">.*?</p>\s*)+)', body, re.S)
    if not m1:
        sys.exit('Annexe : portée du mandat introuvable')
    portee = m1.group(2).strip()
    body = body[:m1.start()] + m1.group(1) + '{{section.portee}}\n  ' + body[m1.end():]

    # Les livrables.
    body = must_re(body, r'(<h2 class="sec">2\. Livrables et révisions incluses</h2>\s*<table class="tab">\s*<thead>.*?</thead>\s*<tbody>)\s*<tr>\s*<td><strong>L-01</strong></td>.*?</tbody>',
                   r'\1{{#livrables}}<tr><td><strong>{{livrable.code}}</strong></td><td>{{livrable.titre}}</td><td>{{livrable.description}}</td><td>{{livrable.rondes}}</td></tr>{{/livrables}}</tbody>')
    # Les jalons.
    body = must_re(body, r'(<h2 class="sec">4\. Jalons et échéancier prévisionnel</h2>.*?<tbody>)\s*<tr><td><strong>J-01</strong></td>.*?</tbody>',
                   r'\1{{#jalons}}<tr><td><strong>{{jalon.code}}</strong></td><td>{{jalon.titre}}</td><td>{{jalon.responsable}}</td><td>{{jalon.date}}</td></tr>{{/jalons}}</tbody>')
    # Le contenu à fournir.
    body = must_re(body, r'(<h2 class="sec">5\. Contenu à fournir par le Client</h2>.*?<tbody>)\s*<tr>\s*<td>Textes de présentation.*?</tbody>',
                   r'\1{{#attendus_client}}<tr><td>{{attendu.texte}}</td><td>{{attendu.format}}</td><td>{{attendu.note}}</td></tr>{{/attendus_client}}</tbody>')
    # Les exclusions.
    body = must_re(body, r'(<h2 class="sec">6\. Exclusions explicites</h2>.*?<tbody>)\s*<tr><td>Boutique en ligne.*?</tbody>',
                   r'\1{{#exclusions}}<tr><td>{{exclusion.texte}}</td><td>{{exclusion.detail}}</td></tr>{{/exclusions}}</tbody>')
    html = '<style>\n' + FONT_IMPORT + css + '\n</style>\n' + body.strip() + '\n'
    return html, [
        dict(key='portee', title='Portée du mandat', default_body=portee, optional=False, ai_assist=True, locked=False, max_chars=1500),
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Devis et facture — les modèles simples de la maquette 9.3, sur le socle .cdoc
# ─────────────────────────────────────────────────────────────────────────────

APERCU = ROOT / 'lib/documents/apercu.ts'


def cdoc_css() -> str:
    """Le socle `.cdoc` tel que `lib/documents/apercu.ts` le définit — une seule source."""
    m = re.search(r'export const CDOC_CSS = `\n?(.*?)`;', APERCU.read_text(encoding='utf-8'), re.S)
    if not m:
        sys.exit('CDOC_CSS introuvable dans lib/documents/apercu.ts')
    return m.group(1).strip()


CDOC_HEAD = (
    '<div class="cdoc-head">\n'
    '  <div><div class="cdoc-title">{title}</div><div class="cdoc-ref">{{{{document.reference}}}} · {{{{document.date}}}}</div></div>\n'
    '  <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px">{{{{agence.nom}}}}</div>{{{{agence.adresse}}}}<br>'
    'TPS {{{{agence.tps}}}} · TVQ {{{{agence.tvq}}}}</div>\n'
    '</div>'
)
CDOC_LINES = (
    '<table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead>\n'
    '<tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.quantite}}</td><td class="num">{{ligne.prix}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>'
)


def cdoc_totals(last: str) -> str:
    return (
        '<div class="cdoc-totals">'
        '<div class="cdoc-totals-row"><span>Sous-total</span><span>{{total.ht}}</span></div>'
        '<div class="cdoc-totals-row"><span>TPS (5 %)</span><span>{{total.tps}}</span></div>'
        '<div class="cdoc-totals-row"><span>TVQ (9,975 %)</span><span>{{total.tvq}}</span></div>'
        f'<div class="cdoc-totals-row ttc"><span>{last}</span><span>{{{{total.ttc}}}}</span></div>'
        '</div>'
    )


def cdoc_document(title: str, body: str) -> str:
    return f'<style>\n{cdoc_css()}\n</style>\n<div class="cdoc">\n{CDOC_HEAD.format(title=title)}\n{body}\n</div>\n'


def convert_devis() -> tuple[str, list[dict]]:
    body = '\n'.join([
        '<div class="cdoc-p">Préparé pour <b>{{client.raison_sociale}}</b>, à l’attention de {{client.contact.nom}}.</div>',
        '{{#document.introduction}}<div class="cdoc-p">{{document.introduction}}</div>{{/document.introduction}}',
        '<div class="cdoc-section-t">Objet</div>',
        '<div class="cdoc-p">{{document.objet}}</div>',
        '<div class="cdoc-section-t">Détail</div>',
        CDOC_LINES,
        cdoc_totals('Total'),
        '<div class="cdoc-p">Ce devis est valide jusqu’au {{document.echeance}}. {{document.paiement}}</div>',
        '<div class="cdoc-sign"><div><div class="cdoc-sign-line">Pour {{agence.nom}} — {{agence.representant}}</div></div>'
        '<div><div class="cdoc-sign-line">Pour {{client.nom}} — {{client.contact.nom}}, {{client.contact.titre}}</div></div></div>',
        '<div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>',
    ])
    return cdoc_document('Devis', body), []


def convert_facture() -> tuple[str, list[dict]]:
    body = '\n'.join([
        '<div class="cdoc-p">Facturé à <b>{{client.raison_sociale}}</b><br>{{client.adresse}}<br>À l’attention de {{client.contact.nom}}</div>',
        '<div class="cdoc-section-t">Détail</div>',
        CDOC_LINES,
        cdoc_totals('Total dû'),
        '<div class="cdoc-p">Échéance de paiement : <b>{{document.echeance}}</b>. {{document.paiement}}</div>',
        '<div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>',
    ])
    return cdoc_document('Facture', body), []


# ─────────────────────────────────────────────────────────────────────────────
# Le semis
# ─────────────────────────────────────────────────────────────────────────────

TEMPLATES = [
    # (fichier, id, kind, name, is_default, prefix, payment_terms_days, intro, legal_mentions, footer, payment_instructions, convertisseur)
    dict(file='offre-de-service.html', id='33330000-0000-0000-0000-000000000003', kind='proposition', name='Offre de service', default=True, prefix='PR', terms=15,
         intro=None, mentions='La présente proposition est valide 30 jours. Son acceptation par le Client entraîne la signature d''un contrat de services professionnels.',
         footer=None, payment='50 % à la signature, 50 % à la livraison. Factures payables sous 15 jours. Virement bancaire ou Interac.', convert=convert_offre, existing=True),
    dict(file='acquisition-meta.html', id='33330000-0000-0000-0000-000000000006', kind='proposition', name='Proposition — Acquisition Meta Ads', default=False, prefix='PR', terms=14,
         intro=None, mentions='La présente proposition est valide 30 jours.', footer=None,
         payment='Acompte de 50 % à la signature, solde à la livraison, payable sous 14 jours. Virement bancaire ou Interac.', convert=convert_meta, existing=False),
    dict(file='contrat.html', id='33330000-0000-0000-0000-000000000004', kind='contrat', name='Contrat de services professionnels', default=True, prefix='CT', terms=15,
         intro=None, mentions='Le présent contrat est régi par les lois du Québec. En cas de conflit entre le corps du contrat, l''Annexe A et la Proposition, cet ordre de priorité prévaut.',
         footer=None, payment='virement bancaire ou carte de crédit (facturation transmise via QuickBooks ou Stripe)', convert=convert_contrat, existing=True),
    dict(file='annexe-a.html', id='33330000-0000-0000-0000-000000000005', kind='annexe', name='Annexe A — Livrables et échéancier', default=True, prefix='AN', terms=0,
         intro=None, mentions=None, footer=None, payment=None, convert=convert_annexe, existing=False),
    # Les deux modèles simples viennent de la maquette 9.3, pas d'un gabarit de `design/`.
    dict(file='devis.html', id='33330000-0000-0000-0000-000000000001', kind='devis', name='Devis', default=True, prefix='DV', terms=30,
         intro=None, mentions='Devis valide 30 jours à compter de sa date d''émission.', footer=None,
         payment='Paiement à la commande ou selon les modalités convenues. Virement bancaire ou Interac.', convert=convert_devis, existing=True),
    dict(file='facture.html', id='33330000-0000-0000-0000-000000000002', kind='facture', name='Facture', default=True, prefix='FA', terms=15,
         intro=None, mentions=None, footer=None,
         payment='Paiement dû dans les 15 jours suivant réception. Virement bancaire ou Interac.', convert=convert_facture, existing=True),
]


def sql_str(v: str | None) -> str:
    if v is None:
        return 'null'
    return "'" + v.replace("'", "''") + "'"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    parts = [
        '-- =============================================================================',
        '-- Semis complémentaire — les gabarits réels de l\'agence, convertis',
        '-- =============================================================================',
        '-- Produit par `scripts/convertir-gabarits.py` à partir des gabarits de',
        '-- `design/` : offre de service, proposition Acquisition Meta Ads, contrat de',
        '-- services professionnels, Annexe A — et des deux modèles simples de la',
        '-- maquette 9.3, devis et facture. Syntaxe canonique `{{groupe.champ}}`,',
        '-- format Lettre, pages en flux, sections de modèle extraites des puces',
        '-- « [Compléter : …] ». Le corps de chaque modèle est relisible dans',
        '-- `supabase/gabarits/`.',
        '--',
        '-- Rejouable : un corps déjà saisi par l\'agence n\'est jamais écrasé',
        '-- (`where body_html is null`), et une section existante reste telle quelle.',
        '-- Suppose `seed.sql` passé et la migration 0023 appliquée.',
        '-- =============================================================================',
        '',
    ]
    for t in TEMPLATES:
        html, sections = t['convert']()
        (OUT / t['file']).write_text(html, encoding='utf-8')
        tag = '$gabarit$'
        if tag in html:
            sys.exit(f'Le corps de {t["file"]} contient {tag}')
        parts.append(f"-- ── {t['name']} ({t['kind']}) ──")
        if t['existing']:
            parts.append(f"update public.document_template\n   set prefix = coalesce(prefix, {sql_str(t['prefix'])}),\n       payment_instructions = coalesce(payment_instructions, {sql_str(t['payment'])})\n where id = '{t['id']}';")
        else:
            parts.append(
                'insert into public.document_template\n'
                '  (id, agency_id, kind, name, is_default, prefix, include_year, number_padding,\n'
                '   payment_terms_days, intro, legal_mentions, footer, payment_instructions)\n'
                f"values ('{t['id']}', '{AGENCY}', '{t['kind']}', {sql_str(t['name'])}, {'true' if t['default'] else 'false'}, {sql_str(t['prefix'])}, true, 3,\n"
                f"        {t['terms']}, {sql_str(t['intro'])}, {sql_str(t['mentions'])}, {sql_str(t['footer'])}, {sql_str(t['payment'])})\n"
                'on conflict (id) do nothing;'
            )
        parts.append(f"update public.document_template\n   set body_html = {tag}{html}{tag}\n where id = '{t['id']}' and body_html is null;")
        for i, s in enumerate(sections, start=1):
            parts.append(
                'insert into public.document_template_section\n'
                '  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)\n'
                f"values ('{t['id']}', {sql_str(s['key'])}, {sql_str(s['title'])}, {i}, {sql_str(s['default_body'] or None)},\n"
                f"        {'true' if s['optional'] else 'false'}, {'true' if s['ai_assist'] else 'false'}, {'true' if s['locked'] else 'false'}, {s['max_chars'] if s['max_chars'] else 'null'})\n"
                'on conflict (template_id, key) do nothing;'
            )
        parts.append('')
        print(f"{t['file']}: {len(html)} caractères, {len(sections)} sections")
    SEED.write_text('\n'.join(parts), encoding='utf-8')
    print(f'{SEED.relative_to(ROOT)} écrit')


if __name__ == '__main__':
    main()
