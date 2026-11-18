-- =============================================================================
-- Semis complémentaire — les gabarits réels de l'agence, convertis
-- =============================================================================
-- Produit par `scripts/convertir-gabarits.py` à partir des gabarits de
-- `design/` : offre de service, proposition Acquisition Meta Ads, contrat de
-- services professionnels, Annexe A — et des deux modèles simples de la
-- maquette 9.3, devis et facture. Syntaxe canonique `{{groupe.champ}}`,
-- format Lettre, pages en flux, sections de modèle extraites des puces
-- « [Compléter : …] ». Le corps de chaque modèle est relisible dans
-- `supabase/gabarits/`.
--
-- Rejouable : un corps déjà saisi par l'agence n'est jamais écrasé
-- (`where body_html is null`), et une section existante reste telle quelle.
-- Suppose `seed.sql` passé et la migration 0023 appliquée.
-- =============================================================================

-- ── Offre de service (proposition) ──
update public.document_template
   set prefix = coalesce(prefix, 'PR'),
       payment_instructions = coalesce(payment_instructions, '50 % à la signature, 50 % à la livraison. Factures payables sous 15 jours. Virement bancaire ou Interac.')
 where id = '33330000-0000-0000-0000-000000000003';
update public.document_template
   set body_html = $gabarit$<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Noto+Sans:wght@400;600;700&display=swap');
@font-face{font-family:'NS';src:url('/fonts/NotoSans-VariableFont_wdth_wght.ttf') format('truetype-variations');font-weight:100 900;font-stretch:62.5% 100%;font-display:swap;}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{font-family:'NS','Noto Sans',sans-serif;background:#55585C;}
.ar{font-family:'Archivo',sans-serif;}
.tk{display:inline;background:rgba(208,168,55,.17);color:#6B3E00;border:1px solid rgba(208,168,55,.38);border-radius:3px;padding:0 5px;font-family:ui-monospace,monospace;font-size:.87em;font-weight:700;white-space:nowrap;}
.tki{display:inline;background:rgba(208,168,55,.22);color:#F5D070;border:1px solid rgba(208,168,55,.45);border-radius:3px;padding:0 5px;font-family:ui-monospace,monospace;font-size:.87em;font-weight:700;white-space:nowrap;}
.opt{display:inline-flex;align-items:center;font-family:'NS',sans-serif;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#9A9594;background:#F5F0F0;border:1px dashed #C8C3C3;border-radius:4px;padding:3px 8px;margin-left:10px;vertical-align:middle;}
h1,h2,h3,h4{text-wrap:balance;}p,li{text-wrap:pretty;}
.sec{margin-bottom:0;}
.keep{break-inside:avoid;}
.ch{display:flex;align-items:baseline;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #E8E3E3;}
.ch-num{font-family:'Archivo',sans-serif;font-weight:800;font-size:32px;line-height:1;color:#D0A837;}
.ch-title{font-family:'Archivo',sans-serif;font-weight:700;font-size:25px;letter-spacing:-.01em;color:#232526;margin:0;}
.card{background:#fff;border:1px solid #E8E3E3;border-radius:8px;box-shadow:0 2px 8px rgba(35,37,38,.05);}
.card-dark{background:#232526;border-radius:8px;}
.hl{font-family:'NS',sans-serif;font-size:10px;letter-spacing:.16em;text-transform:uppercase;}
.bull{display:flex;gap:9px;align-items:flex-start;font-family:'NS',sans-serif;font-size:13px;line-height:1.55;color:#3A3B3C;}
.bull-dot{color:#D0A837;font-weight:800;flex-shrink:0;margin-top:1px;}
.fiche{flex:1 1 0;min-width:0;border-radius:8px;padding:20px 16px;display:flex;flex-direction:column;}

.stack{display:flex;flex-direction:column;align-items:center;gap:22px;padding:30px 12px;}
.page{position:relative;width:216mm;min-height:279mm;height:auto;background:#FFFAFA;padding:19mm 16mm 15mm;overflow:visible;box-shadow:0 6px 28px rgba(0,0,0,.32);}
.pg-head{position:absolute;top:9mm;left:16mm;right:16mm;display:flex;justify-content:space-between;align-items:center;font-family:'Archivo',sans-serif;font-size:8px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#9A9594;}
.pg-foot{position:absolute;bottom:8mm;left:16mm;right:16mm;display:flex;justify-content:space-between;align-items:baseline;font-family:'Archivo',sans-serif;font-size:8px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#9A9594;border-top:1px solid #E8E3E3;padding-top:5px;}

@page{size:Letter;margin:0;}
@media print{
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  body{background:#fff;}
  .stack{gap:0;padding:0;}
  .page{box-shadow:none;break-after:page;}
  .page:last-child{break-after:auto;}
  .screen-only{display:none!important;}
}
</style>
<div class="stack">

<div class="page" style="padding:0;">
  <div style="height:5px;background:#D0A837;"></div>
  <div style="padding:24mm 18mm 18mm;height:calc(297mm - 5px);display:flex;flex-direction:column;justify-content:space-between;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;">
      <img src="{{agence.logo}}" alt="DigiHunt" style="height:50px;width:auto;display:block;">
      <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C49A2E;padding-top:8px;text-align:right;white-space:nowrap;">Agence Webflow &amp; SEO<br>Québec</div>
    </div>
    <div>
      <div style="font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#C49A2E;margin-bottom:20px;">Offre de service</div>
      <h1 class="ar" style="font-weight:800;font-size:54px;line-height:1.04;letter-spacing:-.02em;color:#232526;margin:0 0 20px;">{{client.nom}}</h1>
      <p style="font-size:15px;line-height:1.75;color:#3A3B3C;margin:0;max-width:52ch;">Présentée par {{agence.representant}}, {{agence.representant_titre}} de {{agence.nom}}, à l'intention de {{client.contact.nom}}, {{client.contact.titre}}.</p>
    </div>
    <div>
      <div style="height:1px;background:#E8E3E3;margin-bottom:28px;"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px 28px;">
        <div><div class="hl" style="color:#9A9594;margin-bottom:8px;">Pour</div><div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{client.nom}}</div><div style="font-size:12px;color:#7E7978;margin-top:4px;">{{client.ville}} · {{client.secteur}}</div></div>
        <div><div class="hl" style="color:#9A9594;margin-bottom:8px;">Préparé par</div><div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{agence.representant}}</div><div style="font-size:12px;color:#7E7978;margin-top:4px;">{{agence.representant_titre}}, {{agence.nom}}</div></div>
        <div><div class="hl" style="color:#9A9594;margin-bottom:8px;">Date</div><div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{document.date}}</div></div>
        <div><div class="hl" style="color:#9A9594;margin-bottom:8px;">Expire le</div><div class="ar" style="font-weight:700;font-size:15px;color:#C49A2E;">{{document.echeance}}</div></div>
        <div><div class="hl" style="color:#9A9594;margin-bottom:8px;">Forfait</div><div class="ar" style="font-weight:700;font-size:15px;color:#C49A2E;">{{offre_recommandee.nom}}</div></div>
      </div>
    </div>
    <div style="border-top:1px solid #E8E3E3;padding-top:20px;">
      <div style="font-size:11.5px;line-height:1.85;color:#7E7978;">{{agence.nom}} · {{agence.adresse}}<br>{{agence.telephone}} · {{agence.courriel}}</div>
    </div>
  </div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec" style="padding-top:16px;">
  <div class="keep" style="max-width:58ch;">
    <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#C49A2E;margin-bottom:28px;">{{client.ville}}, le {{document.date}}</div>
    <p style="font-size:16px;line-height:1.78;color:#232526;margin:0 0 22px;font-weight:600;">Bonjour {{client.contact.prenom}},</p>
    <p style="font-size:14.5px;line-height:1.82;color:#3A3B3C;margin:0 0 18px;">Merci d'avoir pris le temps d'échanger avec moi sur la vision de {{client.nom}}. J'apprécie travailler avec des entrepreneurs passionnés, et l'idée de collaborer avec vous m'enthousiasme.</p>
    <p style="font-size:14.5px;line-height:1.82;color:#3A3B3C;margin:0 0 18px;">Dans cette proposition, chaque besoin que vous m'avez partagé est associé à une solution concrète. Mon objectif est simple : un seul interlocuteur, un plan clair, zéro surprise.</p>
    <p style="font-size:14.5px;line-height:1.82;color:#3A3B3C;margin:0 0 40px;">Vous trouverez ci-après une analyse de votre situation, les solutions adaptées à vos objectifs, et un plan d'action avec des résultats mesurables. Cette offre est valable jusqu'au {{document.echeance}}.</p>
    <div><div style="height:44px;border-bottom:1.5px solid #232526;width:180px;margin-bottom:10px;"></div><div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{agence.representant}}</div><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7E7978;margin-top:3px;">{{agence.representant_titre}}, {{agence.nom}}</div><div style="font-size:12px;color:#9A9594;margin-top:8px;line-height:1.75;">{{agence.courriel}}<br>{{agence.telephone}}</div></div>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep" style="margin-bottom:26px;"><h2 class="ar" style="font-weight:800;font-size:28px;letter-spacing:-.01em;color:#232526;margin:0;">Table des matières</h2><div style="height:3px;background:#D0A837;width:48px;margin-top:12px;"></div></div>

  <div style="border-top:2px solid #232526;">
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">01</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Résumé analytique</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Vue d'ensemble : problème, solution, résultat, investissement</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">02</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Compréhension de vos besoins</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Positionnement métier, cible, différenciation concurrentielle</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">03</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Objectifs du projet</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Objectifs d'affaires, structure, fonctionnalités, zone géographique</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">04</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Nos forfaits</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Les forfaits du catalogue</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">05</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Forfait recommandé pour vous</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Justification personnalisée, maintenance proposée</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">06</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Plan d'action stratégique</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">7 phases, frise temporelle, livrables détaillés</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">07</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Preuve &amp; résultats <span class="opt">Si des cas clients sont fournis</span></div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Études de cas, témoignages, logos clients</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">08</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Récapitulatif financier</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Tableau d'investissement, bonus, maintenance, taxes</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">09</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Gestion de projet</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Plateformes, espace client, canaux de communication</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8E3E3;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">10</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Modalités &amp; conditions</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Paiement, propriété, coûts externes, valeurs DigiHunt</div></div></div></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 0;"><div style="display:flex;align-items:baseline;gap:13px;"><span class="ar" style="font-weight:800;font-size:18px;color:#D0A837;min-width:30px;">11</span><div><div class="ar" style="font-weight:600;font-size:15px;color:#232526;">Accord de projet &amp; signature</div><div style="font-size:11.5px;color:#7E7978;margin-top:1px;">Engagements légaux, clause Loi 96, tableau de signature</div></div></div></div>
  </div>
  
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">01</span><h2 class="ch-title">Résumé analytique</h2></div>

  <div class="keep" style="background:#232526;border-radius:8px;padding:28px 30px;margin-bottom:18px;">
    <div class="hl" style="color:#D0A837;margin-bottom:14px;">Synthèse de la situation</div>
    <p style="font-size:14.5px;line-height:1.82;color:rgba(255,250,250,.85);margin:0 0 14px;">{{client.nom}} possède un vrai atout : {{brief.atout_principal}}. Pourtant, {{brief.probleme_cardinal}} freine aujourd'hui votre croissance en ligne et vous fait perdre des occasions d'affaires.</p>
    <p style="font-size:14.5px;line-height:1.82;color:rgba(255,250,250,.85);margin:0;">Cette proposition répond directement à ce défi avec le forfait <strong style="color:#D0A837;">{{offre_recommandee.nom}}</strong> : un site conçu pour {{brief.objectif_principal}}, livré en {{offre_recommandee.delai}}, accompagné d'un pack SEO de démarrage et d'une formation qui vous rend autonome.</p>
  </div>

  <div class="keep" style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
    <div style="flex:1 1 200px;background:#F5F0F0;border-left:3px solid #D0A837;padding:20px 22px;border-radius:0 8px 8px 0;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">Résultat visé</div>
      <div class="ar" style="font-weight:700;font-size:17px;color:#232526;">{{brief.resultat_vise}}</div>
    </div>
    <div style="flex:1 1 200px;background:#232526;border-radius:8px;padding:20px 22px;">
      <div class="hl" style="color:#D0A837;margin-bottom:10px;">Investissement total</div>
      <div class="ar" style="font-weight:800;font-size:28px;color:#FFFAFA;line-height:1;">{{offre_recommandee.prix}} <span style="font-size:14px;color:#D0A837;">$</span></div>
      <div style="font-size:11.5px;color:rgba(255,250,250,.42);margin-top:5px;">CAD + taxes applicables (TPS/TVQ)</div>
    </div>
    <div style="flex:1 1 200px;background:#fff;border:1px solid #E8E3E3;border-radius:8px;padding:20px 22px;box-shadow:0 2px 8px rgba(35,37,38,.05);">
      <div class="hl" style="color:#9A9594;margin-bottom:10px;">Délai de livraison</div>
      <div class="ar" style="font-weight:700;font-size:17px;color:#232526;">{{offre_recommandee.delai}}</div>
      <div style="font-size:12px;color:#7E7978;margin-top:5px;">Forfait : {{offre_recommandee.nom}}</div>
    </div>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">02</span><h2 class="ch-title">Compréhension de vos besoins</h2></div>
  <p style="font-size:14.5px;line-height:1.78;color:#3A3B3C;margin:0 0 22px;">Ce différenciateur est au cœur de notre approche : nous prenons le temps de comprendre votre réalité avant de proposer quoi que ce soit. Voici notre lecture de {{client.nom}}.</p>

  <div style="display:flex;flex-direction:column;gap:14px;">

    <div class="keep card" style="padding:24px 26px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><span style="display:inline-block;width:6px;height:6px;background:#D0A837;border-radius:50%;flex-shrink:0;"></span><h3 class="ar" style="font-weight:700;font-size:16px;color:#232526;margin:0;">Positionnement métier</h3></div>
      <p style="font-size:13.5px;line-height:1.7;color:#3A3B3C;margin:0 0 12px;">{{client.nom}} opère dans le secteur {{client.secteur}}, principalement à {{client.ville}}. Son atout différenciant : {{brief.atout_principal}}. Son défi actuel : {{brief.probleme_cardinal}}.</p>
      <div style="border-top:1px solid #E8E3E3;padding-top:12px;display:flex;flex-direction:column;gap:6px;">{{section.besoins_positionnement}}</div>
    </div>

    <div class="keep card" style="padding:24px 26px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><span style="display:inline-block;width:6px;height:6px;background:#D0A837;border-radius:50%;flex-shrink:0;"></span><h3 class="ar" style="font-weight:700;font-size:16px;color:#232526;margin:0;">Cible principale</h3></div>
      <p style="font-size:13.5px;line-height:1.7;color:#3A3B3C;margin:0 0 12px;">Votre clientèle cible est concentrée à {{client.ville}}, dans le secteur {{client.secteur}}.</p>
      <div style="border-top:1px solid #E8E3E3;padding-top:12px;display:flex;flex-direction:column;gap:6px;">{{section.besoins_cible}}</div>
    </div>

    <div class="keep card" style="padding:24px 26px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><span style="display:inline-block;width:6px;height:6px;background:#D0A837;border-radius:50%;flex-shrink:0;"></span><h3 class="ar" style="font-weight:700;font-size:16px;color:#232526;margin:0;">Différenciation concurrentielle</h3></div>
      <p style="font-size:13.5px;line-height:1.7;color:#3A3B3C;margin:0 0 12px;">Votre positionnement dans le paysage concurrentiel de {{client.ville}} repose sur des éléments distinctifs que le site doit communiquer en priorité.</p>
      <div style="border-top:1px solid #E8E3E3;padding-top:12px;display:flex;flex-direction:column;gap:6px;">{{section.besoins_differenciation}}</div>
    </div>

  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">03</span><h2 class="ch-title">Objectifs du projet</h2></div>

  <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px;">
    <div class="keep card" style="flex:1 1 240px;padding:22px 24px;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">Objectifs d'affaires</div>
      <div style="display:flex;flex-direction:column;gap:7px;"><div class="bull"><span class="bull-dot">—</span><span><strong style="color:#232526;">{{brief.objectif_principal}}</strong></span></div>{{section.objectifs_affaires}}</div>
    </div>
    <div class="keep card" style="flex:1 1 240px;padding:22px 24px;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">Structure du site</div>
      <div style="display:flex;flex-direction:column;gap:7px;">{{section.objectifs_structure}}</div>
    </div>
  </div>

  <div style="display:flex;gap:14px;flex-wrap:wrap;">
    <div class="keep card" style="flex:1 1 240px;padding:22px 24px;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">Fonctionnalités ciblées</div>
      <div style="display:flex;flex-direction:column;gap:7px;">{{section.objectifs_fonctionnalites}}</div>
    </div>
    <div class="keep" style="flex:1 1 240px;background:#232526;border-radius:8px;padding:22px 24px;">
      <div class="hl" style="color:#D0A837;margin-bottom:10px;">Zone géographique &amp; résultat</div>
      <div style="display:flex;flex-direction:column;gap:7px;">
        <div class="bull" style="color:rgba(255,250,250,.75);"><span style="color:#D0A837;font-weight:800;flex-shrink:0;">—</span><span>Zone cible : {{client.ville}} · Secteur : {{client.secteur}}</span></div>
        <div class="bull" style="color:rgba(255,250,250,.75);"><span style="color:#D0A837;font-weight:800;flex-shrink:0;">—</span><span>Résultat visé : <strong style="color:#D0A837;">{{brief.resultat_vise}}</strong></span></div>
        {{#brief.zone_secondaire}}<div class="bull" style="color:rgba(255,250,250,.75);"><span style="color:#D0A837;font-weight:800;flex-shrink:0;">—</span><span>Rayonnement élargi : {{brief.zone_secondaire}}</span></div>{{/brief.zone_secondaire}}
      </div>
    </div>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

{{#offres}}
<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="sec">
    <div class="keep ch"><span class="ch-num">04</span><h2 class="ch-title">Nos forfaits</h2></div>
    <p style="font-size:13.5px;line-height:1.6;color:#7E7978;margin:0 0 22px;">Nos forfaits, une même exigence : un site qui performe. Tous incluent une consultation gratuite et un paiement en 2 versements sécurisés.</p>

    <div class="keep" style="position:relative;display:flex;gap:26px;align-items:flex-start;border-radius:8px;padding:24px 26px;margin-bottom:18px;background:#fff;border:1px solid #E8E3E3;box-shadow:0 2px 8px rgba(35,37,38,.05);">
      <div style="flex:1 1 0;min-width:0;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;flex-wrap:wrap;"><span class="hl" style="color:#C49A2E;">Forfait création</span>{{#offre.populaire}}<span style="background:#D0A837;color:#232526;font-family:'Archivo',sans-serif;font-weight:800;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;padding:3px 8px;border-radius:4px;white-space:nowrap;">Le plus populaire</span>{{/offre.populaire}}</div>
        <h3 class="ar" style="font-weight:800;font-size:33px;line-height:1.04;letter-spacing:-.01em;color:#232526;margin:0 0 12px;">{{offre.nom}}</h3>
        <p style="font-size:13px;line-height:1.6;color:#3A3B3C;margin:0 0 14px;max-width:44ch;">{{offre.accroche}}</p>
        <div style="display:flex;flex-wrap:wrap;gap:5px;">{{#offre.segments}}<span style="font-size:10px;background:#F5F0F0;border-radius:4px;padding:3px 9px;color:#3A3B3C;">{{segment.nom}}</span>{{/offre.segments}}</div>
      </div>
      <div style="flex:0 0 188px;border-left:1px solid #E8E3E3;padding-left:24px;align-self:stretch;">
        <div style="display:flex;align-items:baseline;gap:5px;white-space:nowrap;"><span class="ar" style="font-weight:800;font-size:40px;color:#232526;line-height:1;">{{offre.prix}}</span><span class="ar" style="font-weight:600;font-size:15px;color:#D0A837;">$ CAD</span></div>
        <div style="font-size:11px;color:#7E7978;margin:7px 0 14px;">{{offre.prix_prefixe}}Paiement unique</div>
        <div style="font-size:11px;background:#F5F0F0;border-radius:4px;padding:6px 11px;display:inline-block;color:#3A3B3C;">{{#offre.delai}}Livraison en {{offre.delai}}{{/offre.delai}}{{^offre.delai}}Délai convenu ensemble{{/offre.delai}}</div>
      </div>
    </div>

    <div style="display:flex;gap:22px;margin-bottom:18px;">
      <div style="flex:1 1 58%;min-width:0;">
        <div class="hl" style="color:#9A9594;margin-bottom:13px;">Services inclus</div>
        <div style="columns:2;column-gap:26px;">{{#offre.lignes}}<div class="bull" style="font-size:12.5px;line-height:1.5;margin-bottom:8px;break-inside:avoid;"><span class="bull-dot">—</span>{{ligne.texte}}</div>{{/offre.lignes}}</div>
      </div>
      <div style="flex:1 1 42%;min-width:0;">
        {{#offre.description}}<div style="background:#F5F0F0;border-radius:8px;padding:15px 17px;margin-bottom:15px;"><div style="font-size:12px;line-height:1.62;color:#3A3B3C;">{{offre.description}}</div></div>{{/offre.description}}
        <div class="hl" style="color:#9A9594;margin-bottom:11px;">Ce que vous gagnez</div>
        <div style="display:flex;flex-direction:column;gap:9px;">{{#offre.benefices}}<div style="font-size:12.5px;font-weight:600;color:#232526;line-height:1.38;padding-left:12px;border-left:2px solid #D0A837;">{{benefice.texte}}</div>{{/offre.benefices}}</div>
      </div>
    </div>

    <div style="display:flex;background:#232526;border-radius:8px;overflow:hidden;">
      <div style="flex:1;padding:14px 18px;border-right:1px solid rgba(255,250,250,.1);"><div class="ar" style="font-weight:700;font-size:13px;color:#D0A837;margin-bottom:4px;">Paiement sécurisé en 2 versements</div><p style="font-size:12px;line-height:1.55;color:rgba(255,250,250,.5);margin:0;">50 % à la signature, 50 % à la livraison. Aucun frais caché.</p></div>
      <div style="flex:1;padding:14px 18px;border-right:1px solid rgba(255,250,250,.1);"><div class="ar" style="font-weight:700;font-size:13px;color:#D0A837;margin-bottom:4px;">Contrat clair et transparent</div><p style="font-size:12px;line-height:1.55;color:rgba(255,250,250,.5);margin:0;">Scope, délais et livrables définis dès la signature.</p></div>
      <div style="flex:1;padding:14px 18px;"><div class="ar" style="font-weight:700;font-size:13px;color:#D0A837;margin-bottom:4px;">Maintenance mensuelle disponible</div><p style="font-size:12px;line-height:1.55;color:rgba(255,250,250,.5);margin:0;">À partir de 200 $/mois après la livraison.</p></div>
    </div>
  </section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>
{{/offres}}

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">05</span><h2 class="ch-title">Forfait recommandé pour vous</h2></div>

  <div class="keep" style="background:#F5F0F0;border-left:3px solid #D0A837;border-radius:0 8px 8px 0;padding:26px 28px;margin-bottom:20px;">
    <div class="hl" style="color:#C49A2E;margin-bottom:12px;">Notre recommandation</div>
    <div class="ar" style="font-weight:800;font-size:22px;color:#232526;margin-bottom:12px;">{{offre_recommandee.nom}}</div>
    <p style="font-size:14.5px;line-height:1.8;color:#3A3B3C;margin:0 0 12px;">Compte tenu de {{brief.probleme_cardinal}} et de votre objectif de {{brief.objectif_principal}}, le forfait <strong style="color:#232526;">{{offre_recommandee.nom}}</strong> est le plus adapté à la situation de {{client.nom}}.</p>
    <p style="font-size:14.5px;line-height:1.8;color:#3A3B3C;margin:0 0 12px;">Résultat visé : <strong>{{brief.resultat_vise}}</strong> · Livraison en <strong>{{offre_recommandee.delai}}</strong> · Investissement : <strong style="color:#232526;">{{offre_recommandee.prix}} $ CAD</strong>.</p>
    <div style="font-size:14px;line-height:1.75;color:#3A3B3C;">{{section.recommandation}}</div>
  </div>

  <!-- Tableau maintenance -->
  <div class="keep card" style="padding:24px 26px;">
    <div class="hl" style="color:#9A9594;margin-bottom:14px;">Service complémentaire recommandé — Maintenance mensuelle <span class="opt">Optionnel</span></div>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#9A9594;padding:0 16px 10px 0;border-bottom:1.5px solid #232526;width:24%;">Forfait</th>
        <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#9A9594;padding:0 16px 10px 0;border-bottom:1.5px solid #232526;width:16%;">Prix / mois</th>
        <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#9A9594;padding:0 0 10px;border-bottom:1.5px solid #232526;">Services inclus</th>
      </tr></thead>
      <tbody>{{#offres_maintenance}}<tr><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">{{offre.nom}}</td><td class="ar" style="font-weight:700;font-size:13px;color:#D0A837;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;white-space:nowrap;">{{offre.prix_mensuel}} $/mois</td><td style="font-size:12.5px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">{{#offre.heures}}{{offre.heures}} h/mois{{#offre.taux_depassement}} ({{offre.taux_depassement}} $/h supp.){{/offre.taux_depassement}} · {{/offre.heures}}{{#offre.lignes}}{{ligne.texte}}{{^dernier}} · {{/dernier}}{{/offre.lignes}}{{#offre.ideal_avec}} · <em>Idéal avec {{offre.ideal_avec}}</em>{{/offre.ideal_avec}}</td></tr>{{/offres_maintenance}}</tbody>
    </table>
    {{#maintenance_recommandee}}<div style="margin-top:16px;background:#F5F0F0;border-left:3px solid #D0A837;padding:14px 18px;">
      <p style="font-size:14px;line-height:1.72;color:#232526;margin:0;">Pour {{client.nom}}, nous recommandons le forfait <strong>{{maintenance_recommandee.nom}}</strong> à <strong>{{maintenance_recommandee.prix_mensuel}} $/mois</strong> — sans engagement, résiliable avec 30 jours de préavis.</p>
    </div>{{/maintenance_recommandee}}
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">06</span><h2 class="ch-title">Plan d'action stratégique</h2></div>
  <p style="font-size:14px;line-height:1.75;color:#3A3B3C;margin:0 0 24px;">De la découverte au transfert de propriété : 7 phases calibrées pour livrer un site performant en {{offre_recommandee.delai}}.</p>

  <!-- Frise timeline -->
  <div class="keep" style="position:relative;margin:0 0 28px;overflow:hidden;">
    <div style="position:absolute;top:18px;left:18px;right:18px;height:2px;background:#E8E3E3;z-index:0;"></div>
    <div style="display:flex;align-items:flex-start;gap:0;position:relative;z-index:1;">
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#D0A837;color:#232526;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">1</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">Diagnostic &amp;<br>Stratégie</div></div>
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#D0A837;color:#232526;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">2</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">Architecture<br>&amp; UX/UI</div></div>
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#D0A837;color:#232526;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">3</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">Développement<br>Webflow</div></div>
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#D0A837;color:#232526;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">4</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">Lancement &amp;<br>Stabilisation</div></div>
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#3A3B3C;color:#D0A837;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">5</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">SEO &amp;<br>Visibilité</div></div>
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#3A3B3C;color:#D0A837;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">6</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">Suivi &amp;<br>Maintenance</div></div>
      <div style="flex:1;text-align:center;padding:0 2px;"><div style="width:36px;height:36px;border-radius:50%;background:#3A3B3C;color:#D0A837;font-family:'Archivo',sans-serif;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">7</div><div style="font-size:10px;line-height:1.35;color:#232526;font-weight:600;font-family:'NS',sans-serif;">Autonomie &amp;<br>Formation</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:12px;"><span style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#D0A837;">Début du projet</span><span style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#D0A837;">Livraison · {{offre_recommandee.delai}}</span></div>
  </div>

  <!-- Table des phases -->
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#9A9594;padding:0 10px 10px 0;border-bottom:1.5px solid #232526;width:26px;">#</th>
      <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#9A9594;padding:0 16px 10px 0;border-bottom:1.5px solid #232526;width:25%;">Phase</th>
      <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#9A9594;padding:0 0 10px;border-bottom:1.5px solid #232526;">Livrables &amp; activités clés</th>
    </tr></thead>
    <tbody>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">1</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Diagnostic &amp; Stratégie</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;">Analyse de l'existant, audit concurrentiel, définition des personas, stratégie de mots-clés, validation de la charte graphique.</td></tr>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">2</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Architecture &amp; UX/UI</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;">Sitemap validé, arborescence CMS, maquettes Figma desktop + mobile pour toutes les pages clés, approbation client.</td></tr>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">3</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Développement Webflow</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;">Intégration pixel-perfect des maquettes, configuration CMS, fonctionnalités (réservation, membres, e-commerce), optimisation mobile-first.</td></tr>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">4</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Lancement &amp; Stabilisation</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;">Tests QA multi-appareils, recette client (rétroactions + corrections), configuration du domaine, déploiement en production.</td></tr>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">5</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Optimisation locale &amp; SEO</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;">Déploiement du pack SEO de démarrage, optimisation Google Business Profile, indexation, publication des premiers articles de blogue.</td></tr>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">6</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Suivi &amp; Maintenance 3 mois</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;border-bottom:1px solid #E8E3E3;">Surveillance des performances, corrections mineures, rapport analytique mensuel, appel de suivi, ajustements SEO selon Search Console.</td></tr>
      <tr><td class="ar" style="font-weight:800;font-size:13px;color:#D0A837;padding:12px 10px 12px 0;vertical-align:top;">7</td><td style="font-size:13px;color:#232526;font-weight:600;padding:12px 16px 12px 0;vertical-align:top;">Autonomie &amp; Formation</td><td style="font-size:13px;line-height:1.55;color:#3A3B3C;padding:12px 0;">Formation Webflow Editor, transfert de propriété complet (domaine, Webflow, Analytics), documentation remise.</td></tr>
    </tbody>
  </table>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

{{#section.preuve}}<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">07</span><h2 class="ch-title">Preuve &amp; résultats</h2></div>
  {{section.preuve}}
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>{{/section.preuve}}

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">08</span><h2 class="ch-title">Récapitulatif financier</h2></div>

  <div class="keep card" style="padding:26px 28px;margin-bottom:18px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:#9A9594;padding:0 16px 11px 0;border-bottom:1.5px solid #232526;">Description</th>
        <th style="text-align:right;font-size:10px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:#9A9594;padding:0 0 11px;border-bottom:1.5px solid #232526;white-space:nowrap;">Prix (CAD)</th>
      </tr></thead>
      <tbody>
        {{#lignes_ponctuelles}}<tr>
          <td style="font-size:14px;color:#232526;padding:16px 16px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">{{ligne.description}}</td>
          <td class="ar" style="font-weight:700;font-size:15px;color:#232526;padding:16px 0;border-bottom:1px solid #E8E3E3;text-align:right;vertical-align:top;white-space:nowrap;">{{ligne.montant}}</td>
        </tr>{{/lignes_ponctuelles}}
        {{#lignes_offertes}}<tr>
          <td style="font-size:14px;color:#D0A837;padding:16px 16px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;"><span class="opt" style="margin-left:0;margin-right:8px;">Bonus</span>{{ligne.description}}<div style="font-size:12px;color:#9A9594;margin-top:3px;">Valide si la proposition est acceptée avant le {{document.echeance}}</div></td>
          <td class="ar" style="font-weight:700;font-size:15px;color:#D0A837;padding:16px 0;border-bottom:1px solid #E8E3E3;text-align:right;vertical-align:top;white-space:nowrap;">Offert</td>
        </tr>{{/lignes_offertes}}
        <tr>
          <td style="font-size:15px;font-weight:700;color:#232526;padding:18px 16px 18px 0;border-bottom:1.5px solid #232526;vertical-align:top;">Total de l'investissement initial</td>
          <td class="ar" style="font-weight:800;font-size:18px;color:#232526;padding:18px 0;border-bottom:1.5px solid #232526;text-align:right;vertical-align:top;white-space:nowrap;">{{total.ponctuel_ht}}</td>
        </tr>
      </tbody>
    </table>
  </div>

  {{#maintenance_recommandee}}<div class="keep" style="background:#F5F0F0;border-left:3px solid #D0A837;border-radius:0 8px 8px 0;padding:20px 24px;margin-bottom:18px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;">
      <div style="flex:1 1 240px;">
        <div class="hl" style="color:#C49A2E;margin-bottom:8px;"><span class="opt" style="margin-left:0;margin-right:8px;">Optionnel</span>Maintenance mensuelle après livraison</div>
        <div class="ar" style="font-weight:700;font-size:16px;color:#232526;margin-bottom:4px;">{{maintenance_recommandee.nom}}</div>
        <div style="font-size:13px;line-height:1.65;color:#3A3B3C;">Sans engagement. Résiliable avec 30 jours de préavis. Facturation mensuelle.</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div class="ar" style="font-weight:800;font-size:30px;color:#D0A837;line-height:1;">{{maintenance_recommandee.prix_mensuel}} $</div>
        <div style="font-size:12px;color:#7E7978;margin-top:4px;">par mois + taxes</div>
      </div>
    </div>{{/maintenance_recommandee}}
  </div>

  <div style="display:flex;gap:10px;align-items:flex-start;padding:14px 18px;background:#fff;border:1px solid #E8E3E3;border-radius:8px;">
    <span class="ar" style="font-weight:800;font-size:13px;color:#D0A837;flex-shrink:0;line-height:1.5;">i</span>
    <p style="font-size:12.5px;line-height:1.72;color:#3A3B3C;margin:0;">Tous les montants sont en dollars canadiens (CAD) et s'entendent avant taxes applicables (TPS / TVQ). Le paiement s'effectue en deux versements égaux : 50 % à la signature, 50 % à la livraison. Délai de réalisation : <strong>{{offre_recommandee.delai}}</strong>, à compter de la signature et de la réception de l'acompte.</p>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">09</span><h2 class="ch-title">Gestion de projet</h2></div>
  <p style="font-size:14px;line-height:1.75;color:#3A3B3C;margin:0 0 22px;">Un seul interlocuteur, des outils accessibles depuis votre téléphone. Notre méthode élimine les mauvaises surprises et vous tient informé à chaque étape.</p>

  <div style="display:flex;gap:14px;flex-wrap:wrap;">
    <div class="keep card" style="flex:1 1 200px;padding:24px 22px;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">Plateforme</div>
      <div class="ar" style="font-weight:700;font-size:18px;color:#232526;margin-bottom:8px;">Webflow</div>
      <p style="font-size:13px;line-height:1.65;color:#3A3B3C;margin:0;">Tout le développement s'effectue sur Webflow. Vous restez propriétaire du projet et pouvez y accéder à tout moment sans intermédiaire.</p>
    </div>
    <div class="keep card" style="flex:1 1 200px;padding:24px 22px;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">Espace client</div>
      <div class="ar" style="font-weight:700;font-size:18px;color:#232526;margin-bottom:8px;">Notion</div>
      <p style="font-size:13px;line-height:1.65;color:#3A3B3C;margin:0;">Un espace Notion dédié centralise : livrables, échéances, objectifs validés, tâches en cours et historique des rétroactions.</p>
    </div>
    <div class="keep card" style="flex:1 1 200px;padding:24px 22px;">
      <div class="hl" style="color:#C49A2E;margin-bottom:10px;">3 canaux de communication</div>
      <div class="ar" style="font-weight:700;font-size:18px;color:#232526;margin-bottom:8px;">Clair &amp; direct</div>
      <div style="display:flex;flex-direction:column;gap:7px;">
        <div class="bull"><span class="bull-dot">—</span><span><strong style="color:#232526;">WhatsApp</strong> — questions rapides et urgences</span></div>
        <div class="bull"><span class="bull-dot">—</span><span><strong style="color:#232526;">Google Meet</strong> — réunions de suivi et validations</span></div>
        <div class="bull"><span class="bull-dot">—</span><span><strong style="color:#232526;">Courriel officiel</strong> — {{agence.courriel}}</span></div>
      </div>
    </div>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">10</span><h2 class="ch-title">Modalités &amp; conditions</h2></div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
    <tbody>
      <tr><td class="ar" style="font-weight:700;font-size:14px;color:#232526;padding:16px 22px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;width:28%;">Paiement — Projet</td><td style="font-size:13.5px;line-height:1.72;color:#3A3B3C;padding:16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;"><strong>50 % à la signature</strong> — non remboursable après le début du développement. <strong>50 % à la livraison</strong> — à régler dans les 15 jours. Factures payables sous 15 jours. Modes acceptés : virement bancaire, Interac.</td></tr>
      <tr><td class="ar" style="font-weight:700;font-size:14px;color:#232526;padding:16px 22px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Services récurrents</td><td style="font-size:13.5px;line-height:1.72;color:#3A3B3C;padding:16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Facturation mensuelle. Résiliable avec préavis de 30 jours. Les contenus créés restent la propriété entière du client.</td></tr>
      <tr><td class="ar" style="font-weight:700;font-size:14px;color:#232526;padding:16px 22px 16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Coûts externes</td><td style="font-size:13.5px;line-height:1.72;color:#3A3B3C;padding:16px 0;border-bottom:1px solid #E8E3E3;vertical-align:top;">Les frais d'hébergement, licences tierces (MemberStack, Acuity, Shopify…), domaines, CRM, photographies et autres coûts externes sont à la charge du client et ne sont pas inclus dans les forfaits.</td></tr>
      <tr><td class="ar" style="font-weight:700;font-size:14px;color:#232526;padding:16px 22px 16px 0;vertical-align:top;">Nos valeurs</td><td style="font-size:13.5px;line-height:1.72;color:#3A3B3C;padding:16px 0;vertical-align:top;"><strong>Relation · Intégrité · Croissance mutuelle · Innovation.</strong> Nos engagements : transparence totale sur le scope, respect des délais annoncés, transfert de propriété complet.</td></tr>
    </tbody>
  </table>

  <!-- Bandeau réassurance répété -->
  <div style="display:flex;background:#232526;border-radius:8px;overflow:hidden;">
    <div style="flex:1;padding:16px 18px;border-right:1px solid rgba(255,250,250,.1);"><div class="ar" style="font-weight:700;font-size:12px;color:#D0A837;margin-bottom:3px;">Paiement sécurisé en 2 versements</div><div style="font-size:11.5px;color:rgba(255,250,250,.5);">50 % à la signature · 50 % à la livraison.</div></div>
    <div style="flex:1;padding:16px 18px;border-right:1px solid rgba(255,250,250,.1);"><div class="ar" style="font-weight:700;font-size:12px;color:#D0A837;margin-bottom:3px;">Contrat clair et transparent</div><div style="font-size:11.5px;color:rgba(255,250,250,.5);">Scope, délais et livrables définis dès la signature.</div></div>
    <div style="flex:1;padding:16px 18px;"><div class="ar" style="font-weight:700;font-size:12px;color:#D0A837;margin-bottom:3px;">Maintenance mensuelle disponible</div><div style="font-size:11.5px;color:rgba(255,250,250,.5);">À partir de 200 $/mois, sans engagement.</div></div>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; SEO</span><span>Offre de service — {{client.nom}}</span></div>
  <section class="pb sec">
  <div class="keep ch"><span class="ch-num">11</span><h2 class="ch-title">Accord de projet &amp; signature</h2></div>

  <div class="keep card" style="padding:24px 26px;margin-bottom:18px;">
    <div class="hl" style="color:#C49A2E;margin-bottom:12px;">Engagements mutuels</div>
    <p style="font-size:13.5px;line-height:1.72;color:#3A3B3C;margin:0 0 10px;">En acceptant cette offre, les deux parties s'engagent à :</p>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <div class="bull"><span class="bull-dot">—</span>Fournir des contenus véridiques, exacts et libres de droits pour le site web.</div>
      <div class="bull"><span class="bull-dot">—</span>Exclure tout contenu inapproprié, trompeur ou contraire aux lois en vigueur au Québec.</div>
      <div class="bull"><span class="bull-dot">—</span>Respecter la vie privée des utilisateurs et se conformer aux lois québécoises sur la protection des données (Loi 25).</div>
      <div class="bull"><span class="bull-dot">—</span>Communiquer de bonne foi et répondre aux demandes dans les délais convenus.</div>
    </div>
  </div>

  <div class="keep" style="background:#F5F0F0;border-radius:8px;padding:20px 24px;margin-bottom:18px;">
    <p style="font-size:13px;line-height:1.72;color:#3A3B3C;margin:0;"><strong>Droit applicable :</strong> La présente entente est régie par les lois de la province de Québec et les lois fédérales du Canada qui s'y appliquent.<br><strong>Clause de langue :</strong> Ce document est rédigé en français conformément à la <em>Charte de la langue française</em> (Loi 96). Les parties conviennent que la version française prévaut en cas de divergence.</p>
  </div>

  <!-- Tableau de signature -->
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:#9A9594;padding:0 20px 11px 0;border-bottom:1.5px solid #232526;width:50%;">Fournisseur — {{agence.nom}}</th>
      <th style="text-align:left;font-size:10px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:#9A9594;padding:0 0 11px;border-bottom:1.5px solid #232526;">Client — {{client.nom}}</th>
    </tr></thead>
    <tbody>
      <tr>
        <td style="padding:20px 20px 0 0;vertical-align:top;">
          <div style="margin-bottom:12px;"><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Nom imprimé</div><div class="ar" style="font-weight:600;font-size:14px;color:#232526;">{{agence.representant}}</div></div>
          <div style="margin-bottom:12px;"><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Titre</div><div style="font-size:13px;color:#232526;">{{agence.representant_titre}}, {{agence.nom}}</div></div>
          <div style="margin-bottom:12px;"><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Date</div><div style="height:28px;border-bottom:1px solid #C8C3C3;width:160px;"></div></div>
          <div><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Signature</div><div style="height:52px;border-bottom:1.5px solid #232526;width:200px;"></div></div>
        </td>
        <td style="padding:20px 0 0;vertical-align:top;">
          <div style="margin-bottom:12px;"><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Nom imprimé</div><div style="height:28px;border-bottom:1px solid #C8C3C3;width:220px;"></div></div>
          <div style="margin-bottom:12px;"><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Titre</div><div style="height:28px;border-bottom:1px solid #C8C3C3;width:220px;"><span style="font-size:11px;color:#C8C3C3;position:relative;top:-2px;">{{client.contact.titre}}</span></div></div>
          <div style="margin-bottom:12px;"><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Date</div><div style="height:28px;border-bottom:1px solid #C8C3C3;width:160px;"></div></div>
          <div><div style="font-size:12px;color:#7E7978;margin-bottom:4px;">Signature</div><div style="height:52px;border-bottom:1.5px solid #232526;width:220px;"></div></div>
        </td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top:32px;padding-top:22px;border-top:1px solid #E8E3E3;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div><img src="{{agence.logo}}" alt="DigiHunt" style="height:32px;width:auto;display:block;margin-bottom:8px;"><div style="font-size:11.5px;line-height:1.8;color:#9A9594;">{{agence.adresse}}<br>{{agence.telephone}} · {{agence.courriel}}</div></div>
      <div style="text-align:right;"><div class="hl" style="color:#9A9594;margin-bottom:5px;">Préparé pour</div><div class="ar" style="font-weight:700;font-size:15px;color:#232526;">{{client.nom}}</div><div style="font-size:12px;color:#9A9594;margin-top:2px;">{{client.contact.nom}} · {{client.contact.titre}}</div></div>
    </div>
  </div>

</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

</div>
$gabarit$
 where id = '33330000-0000-0000-0000-000000000003' and body_html is null;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'besoins_positionnement', 'Compréhension — positionnement métier', 1, '<div class="bull"><span class="bull-dot">—</span><span>[Compléter : mission principale de l''entreprise]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : atout différenciant détaillé]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : défi commercial principal]</span></div>',
        false, true, false, 700)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'besoins_cible', 'Compréhension — cible principale', 2, '<div class="bull"><span class="bull-dot">—</span><span>[Compléter : profil démographique / psychographique de la cible]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : comportement de recherche et canaux utilisés]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : besoin ou douleur principale de cette cible]</span></div>',
        false, true, false, 700)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'besoins_differenciation', 'Compréhension — différenciation concurrentielle', 3, '<div class="bull"><span class="bull-dot">—</span><span>[Compléter : avantage n°1 vs concurrents]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : avantage n°2 vs concurrents]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : valeur unique que les concurrents n''offrent pas]</span></div>',
        false, true, false, 700)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'objectifs_affaires', 'Objectifs d’affaires', 4, '<div class="bull"><span class="bull-dot">—</span><span>[Compléter : objectif secondaire n°2]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Compléter : objectif secondaire n°3]</span></div>',
        false, true, false, 500)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'objectifs_structure', 'Structure du site', 5, '<div class="bull"><span class="bull-dot">—</span><span>[Nombre de pages estimé]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Unilingue FR / Bilingue FR-EN]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Pages prioritaires : Accueil, Services, À propos, Contact, Blogue…]</span></div>',
        false, true, false, 500)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'objectifs_fonctionnalites', 'Fonctionnalités ciblées', 6, '<div class="bull"><span class="bull-dot">—</span><span>[Ex. : réservation en ligne (Acuity)]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Ex. : formulaire de devis automatisé]</span></div>
<div class="bull"><span class="bull-dot">—</span><span>[Ex. : galerie / portfolio dynamique]</span></div>',
        false, true, false, 500)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'recommandation', 'Pourquoi ce forfait', 7, '<p style="margin:0;">[Compléter : en deux ou trois phrases, ce qui, dans la situation du client, rend ce forfait plus juste que les autres.]</p>',
        true, true, false, 600)
on conflict (template_id, key) do nothing;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000003', 'preuve', 'Preuve et résultats', 8, null,
        true, false, false, 2500)
on conflict (template_id, key) do nothing;

-- ── Proposition — Acquisition Meta Ads (proposition) ──
insert into public.document_template
  (id, agency_id, kind, name, is_default, prefix, include_year, number_padding,
   payment_terms_days, intro, legal_mentions, footer, payment_instructions)
values ('33330000-0000-0000-0000-000000000006', '11110000-0000-0000-0000-000000000001', 'proposition', 'Proposition — Acquisition Meta Ads', false, 'PR', true, 3,
        14, null, 'La présente proposition est valide 30 jours.', null, 'Acompte de 50 % à la signature, solde à la livraison, payable sous 14 jours. Virement bancaire ou Interac.')
on conflict (id) do nothing;
update public.document_template
   set body_html = $gabarit$<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Noto+Sans:wght@400;600;700&display=swap');
@font-face{font-family:'NS';src:url('/fonts/NotoSans-VariableFont_wdth_wght.ttf') format('truetype-variations');font-weight:100 900;font-stretch:62.5% 100%;font-display:swap;}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{font-family:'NS','Noto Sans',sans-serif;background:#55585C;}
.ar{font-family:'Archivo',sans-serif;}
.tk{display:inline;background:rgba(208,168,55,.17);color:#6B3E00;border:1px solid rgba(208,168,55,.38);border-radius:3px;padding:0 5px;font-family:ui-monospace,monospace;font-size:.87em;font-weight:700;white-space:nowrap;}
.tki{display:inline;background:rgba(208,168,55,.22);color:#F5D070;border:1px solid rgba(208,168,55,.45);border-radius:3px;padding:0 5px;font-family:ui-monospace,monospace;font-size:.87em;font-weight:700;white-space:nowrap;}
.opt{display:inline-flex;align-items:center;font-family:'NS',sans-serif;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#9A9594;background:#F5F0F0;border:1px dashed #C8C3C3;border-radius:4px;padding:3px 8px;margin-left:10px;vertical-align:middle;}
h1,h2,h3,h4{text-wrap:balance;}p,li{text-wrap:pretty;}
.keep{break-inside:avoid;}
.page section{margin-bottom:0;}

.stack{display:flex;flex-direction:column;align-items:center;gap:22px;padding:30px 12px;}
.page{position:relative;width:216mm;min-height:279mm;height:auto;background:#FFFAFA;padding:19mm 16mm 15mm;overflow:visible;box-shadow:0 6px 28px rgba(0,0,0,.32);}
.pg-head{position:absolute;top:9mm;left:16mm;right:16mm;display:flex;justify-content:space-between;align-items:center;font-family:'Archivo',sans-serif;font-size:8px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#9A9594;}
.pg-foot{position:absolute;bottom:8mm;left:16mm;right:16mm;display:flex;justify-content:space-between;align-items:baseline;font-family:'Archivo',sans-serif;font-size:8px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#9A9594;border-top:1px solid #E8E3E3;padding-top:5px;}

@page{size:Letter;margin:0;}
@media print{
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  body{background:#fff;}
  .stack{gap:0;padding:0;}
  .page{box-shadow:none;break-after:page;}
  .page:last-child{break-after:auto;}
  .screen-only{display:none!important;}
}
</style>
<div class="stack">



<div class="page" style="padding:0;">
  <div style="height:5px;background:#D0A837;"></div>
  <div style="padding:20mm 17mm 16mm;min-height:calc(279mm - 5px);">

  <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:24px; padding-top:34px;">
    <img src="{{agence.logo}}" alt="DigiHunt" style="height:52px; width:auto; display:block;">
    <div style="text-align:right; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#C49A2E; padding-top:6px;">Stratégie d'acquisition</div>
  </div>

  <div style="margin-top:72px;">
    <div style="font-size:12px; letter-spacing:0.22em; text-transform:uppercase; color:#C49A2E; margin-bottom:20px;">Proposition de service</div>
    <h1 class="ar" style="font-weight: 800; font-size: 54px; line-height: 1.05; letter-spacing: -0.02em; margin: 0; color: #232526; text-align: center;">Stratégie d'Acquisition Automatisée</h1>
    <p style="font-size:15px; line-height:1.6; color:#3A3B3C; margin:24px 0 0; max-width:46ch;">Transformer chaque clic publicitaire en réservation ferme — 24 h / 24, 7 j / 7 — pour remplir votre horaire sans effort manuel.</p>
  </div>

  <div style="height:1px; background:#E8E3E3; margin:48px 0 40px;"></div>

  <div style="display:flex; gap:48px; flex-wrap:wrap;">
    <div style="flex:1 1 240px;">
      <div style="font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#9A9594; margin-bottom:14px;">Préparée pour</div>
      <div class="ar" style="font-weight:700; font-size:17px; color:#232526;">{{client.contact.nom}}</div>
      <div style="font-size:13px; line-height:1.7; color:#3A3B3C; margin-top:6px;">{{client.nom}}<br>{{client.adresse}}<br>{{client.ville}}<br><span style="color:#9A9594;">{{client.courriel}} · {{client.telephone}}</span></div>
    </div>
    <div style="flex:1 1 240px;">
      <div style="font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#9A9594; margin-bottom:14px;">Préparée par</div>
      <div class="ar" style="font-weight:700; font-size:17px; color:#232526;">{{agence.representant}}</div>
      <div style="font-size:13px; line-height:1.7; color:#3A3B3C; margin-top:6px;">{{agence.nom}}<br>{{agence.ville}}, QC<br><span style="color: rgb(154, 149, 148);">{{agence.courriel}} · {{agence.telephone}}</span></div>
    </div>
  </div>

  <div style="display:flex; gap:48px; margin-top:36px; padding-top:28px; border-top:1px solid #E8E3E3;">
    <div>
      <div style="font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#9A9594; margin-bottom:8px;">Date</div>
      <div class="ar" style="font-weight:600; font-size:15px; color:#232526;">{{document.date}}</div>
    </div>
    <div>
      <div style="font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#9A9594; margin-bottom:8px;">Validité</div>
      <div class="ar" style="font-weight:600; font-size:15px; color:#C49A2E;">{{document.echeance}}</div>
    </div>
  </div>

  </div>
</div>


<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;">
    <span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">01</span>
    <h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Contexte &amp; Objectifs</h2>
  </div>
  <p style="font-size:14.5px; line-height:1.78; color:#3A3B3C; margin:0 0 16px;">Suite à notre rencontre du {{brief.date_appel}} dernier, nous avons identifié que votre objectif principal est {{brief.objectif_principal}}. {{client.nom}} possède un avantage concurrentiel fort grâce à {{brief.atout_concurrentiel}} et son offre spécialisée — <strong style="color:#232526;">{{brief.offre_specialisee}}</strong> — mais votre potentiel de croissance est actuellement freiné par un processus d'acquisition manuel.</p>
  <p style="font-size:14.5px; line-height:1.78; color:#3A3B3C; margin:0 0 28px;">Actuellement, vos campagnes publicitaires {{brief.canal_publicitaire}} redirigent les prospects vers {{brief.canal_actuel}}. Ce processus crée un goulot d'étranglement majeur : si vous êtes occupé ou indisponible pour répondre immédiatement, le prospect refroidit et la conversion est perdue. Vous investissez donc dans des clics publicitaires qui ne se transforment pas toujours en rendez-vous concrets.</p>

  <div class="keep" style="margin:0 0 24px;">
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="width:50%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.14em; text-transform:uppercase; color:#9A9594; padding:0 18px 11px 0; border-bottom:1.5px solid #232526;">Problème identifié</th>
          <th style="width:50%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.14em; text-transform:uppercase; color:#9A9594; padding:0 0 11px 0; border-bottom:1.5px solid #232526;">Impact sur l'entreprise</th>
        </tr>
      </thead>
      <tbody>
        
        <tr>
          <td style="font-size:13px; line-height:1.55; color:#232526; padding:14px 18px 14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Redirection des publicités vers {{brief.canal_actuel}}</td>
          <td style="font-size:13px; line-height:1.55; color:#3A3B3C; padding:14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Perte de prospects lorsque vous n'êtes pas disponible pour répondre</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.55; color:#232526; padding:14px 18px 14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Absence de système de réservation automatisé</td>
          <td style="font-size:13px; line-height:1.55; color:#3A3B3C; padding:14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Charge administrative élevée pour {{client.contact.prenom}}</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.55; color:#232526; padding:14px 18px 14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Aucune page de destination dédiée</td>
          <td style="font-size:13px; line-height:1.55; color:#3A3B3C; padding:14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Budget publicitaire sous-optimisé</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.55; color:#232526; padding:14px 18px 14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Taux d'annulation de {{brief.taux_annulation}}</td>
          <td style="font-size:13px; line-height:1.55; color:#3A3B3C; padding:14px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Perte de revenus et désorganisation des horaires</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="keep" style="background:#F5F0F0; border-left:3px solid #D0A837; padding:22px 26px; margin:0;">
    <p style="font-size:15px; line-height:1.7; color:#232526; margin:0;">Notre objectif : mettre en place un système automatisé qui transforme l'intérêt généré par vos publicités en <strong style="color:#232526;">réservations fermes, 24 h / 24 et 7 j / 7</strong> — vous permettant de vous concentrer exclusivement sur votre cœur de métier : {{brief.coeur_metier}}.</p>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>


<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;">
    <span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">02</span>
    <h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Stratégie &amp; Livrables</h2>
  </div>
  <p style="font-size:14.5px; line-height:1.78; color:#3A3B3C; margin:0 0 28px;">La solution proposée repose sur deux phases complémentaires : la mise en place d'une infrastructure de conversion, puis son optimisation continue. L'élément central est la création d'une page de destination (Landing Page) haute conversion qui agira comme votre réceptionniste virtuelle, présentant clairement votre expertise et intégrant un système de réservation automatisé.</p>

  <!-- Phase 1 card -->
  <div class="keep" style="background:#FFFAFA; border:1px solid #E8E3E3; border-radius:8px; box-shadow:0 2px 12px rgba(35,37,38,0.06); padding:30px 32px; margin-bottom:20px;">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px;">
      <h3 class="ar" style="font-weight:700; font-size:19px; color:#232526; margin:0;"><span style="color:#D0A837;">Phase 1</span> — Infrastructure &amp; Lancement</h3>
      <span style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:#232526; background:#F5F0F0; border:1px solid #E8E3E3; border-radius:4px; padding:5px 10px; white-space:nowrap;">Frais unique</span>
    </div>
    <p style="font-size:13.5px; line-height:1.7; color:#3A3B3C; margin:0 0 20px;">En éliminant la friction de la prise de contact manuelle, nous maximiserons chaque dollar investi en publicité. Cette phase couvre l'ensemble des fondations d'acquisition :</p>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="width:34px; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 12px 10px 0; border-bottom:1.5px solid #232526;">#</th>
          <th style="width:32%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Livrable</th>
          <th style="text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 0 10px 0; border-bottom:1.5px solid #232526;">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">1</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Landing Page haute conversion</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Conception et développement d'une page dédiée aux campagnes, avec copywriting orienté bénéfices et intégration d'un système de réservation automatisé.</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">2</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Audit du compte Meta Ads</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Analyse de l'état actuel du Business Manager et des campagnes existantes.</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">3</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Configuration du Pixel Meta</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Installation et validation du Pixel sur la Landing Page pour le suivi précis des conversions.</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">4</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Création des audiences cibles</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Mise en place des audiences personnalisées (retargeting) et similaires (Lookalike).</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; vertical-align:top;">5</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; vertical-align:top;">Conception des premières annonces</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; vertical-align:top;">Rédaction des textes publicitaires et création des visuels pour le lancement.</td>
        </tr>
      </tbody>
    </table>
  </div>

  </section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

{{#total.mensuel_ht}}
<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;"><span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">02</span><h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Stratégie &amp; Livrables <span style="font-weight:400; font-size:15px; color:#9A9594; letter-spacing:0;">(suite)</span></h2></div>
  
  <div class="keep" style="background:#FFFAFA; border:1px solid #E8E3E3; border-radius:8px; box-shadow:0 2px 12px rgba(35,37,38,0.06); padding:30px 32px;">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px;">
      <h3 class="ar" style="font-weight:700; font-size:19px; color:#232526; margin:0;"><span style="color:#D0A837;">Phase 2</span> — Gestion Mensuelle &amp; Optimisation</h3>
      <span style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:#232526; background:#F5F0F0; border:1px solid #E8E3E3; border-radius:4px; padding:5px 10px; white-space:nowrap;">Mensualité</span>
    </div>
    <p style="font-size:13.5px; line-height:1.7; color:#3A3B3C; margin:0 0 20px;">Une fois l'infrastructure en place, le succès d'une campagne Meta repose sur son optimisation continue. L'algorithme de Facebook nécessite une surveillance constante pour éviter la fatigue publicitaire et la hausse des coûts d'acquisition.</p>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="width:34px; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 12px 10px 0; border-bottom:1.5px solid #232526;">#</th>
          <th style="text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Livrable mensuel</th>
          <th style="width:30%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 0 10px 0; border-bottom:1.5px solid #232526;">Fréquence</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">1</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Surveillance et ajustement des campagnes</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Continue</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">2</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Rotation des visuels et des textes publicitaires</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Aux 2-3 semaines</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">3</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Tests A/B sur les audiences et les créatifs</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Continue</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">4</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Rapport de performance détaillé</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Mensuelle</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; vertical-align:top;">5</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; vertical-align:top;">Appel de suivi stratégique</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; vertical-align:top;">Mensuel (30 min)</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size:12.5px; line-height:1.6; color:#7E7978; margin:18px 0 0; padding-top:14px; border-top:1px solid #E8E3E3;">Un engagement initial de {{document.engagement_mois}} mois est requis pour permettre à l'algorithme d'apprendre et de produire des résultats stables.</p>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>
{{/total.mensuel_ht}}


<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;">
    <span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">03</span>
    <h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Investissement</h2>
  </div>

  <!-- Two price cards with breakdown -->
  <div class="keep" style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;">
    <div style="flex:1 1 240px; background:#232526; color:#FFFAFA; border-radius:8px; padding:30px 28px;">
      <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#D0A837; margin-bottom:14px;">Phase 1 · Frais unique</div>
      <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:6px;"><span class="ar" style="font-weight:800; font-size:46px; line-height:1; color:#FFFAFA;">{{total.ponctuel_ht}}</span><span class="ar" style="font-weight:600; font-size:20px; color:#D0A837;">$</span>{{#remise}}<span class="ar" style="font-weight:700; font-size:17px; color:#7E7978; text-decoration:line-through;">{{total.avant_remise}}</span>{{/remise}}</div>
      {{#remise}}<div style="display:inline-block; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#232526; background:#D0A837; border-radius:4px; padding:4px 9px; margin-bottom:18px;">Escompte de bienvenue −{{remise.pourcentage}} %</div>{{/remise}}
      {{#lignes_ponctuelles}}<div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #3A3B3C;"><span style="font-size:12.5px; line-height:1.45; color:#CFCBCA;">{{ligne.description}}</span><span class="ar" style="font-weight:700; font-size:13px; color:#FFFAFA; white-space:nowrap;">{{ligne.montant}}</span></div>{{/lignes_ponctuelles}}
      {{#remise}}<div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #3A3B3C;"><span style="font-size:12.5px; line-height:1.45; color:#D0A837;">Escompte de bienvenue (−{{remise.pourcentage}} %)</span><span class="ar" style="font-weight:700; font-size:13px; color:#D0A837; white-space:nowrap;">−{{remise.montant}}</span></div>{{/remise}}
    </div>
    {{#total.mensuel_ht}}<div style="flex:1 1 240px; background:#FFFAFA; border:1px solid #E8E3E3; box-shadow:0 2px 12px rgba(35,37,38,0.06); border-radius:8px; padding:30px 28px;">
      <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#C49A2E; margin-bottom:14px;">Phase 2 · Mensualité </div>
      <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:18px;"><span class="ar" style="font-weight:800; font-size:46px; line-height:1; color:#232526;">{{total.mensuel_ht}}</span><span class="ar" style="font-weight:600; font-size:20px; color:#D0A837;">$ / mois</span></div>
      <div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #E8E3E3;"><span style="font-size:12.5px; line-height:1.45; color:#3A3B3C;">Optimisation, créatifs, rapport, appel de suivi</span></div>
      <div style="display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-top:1px solid #E8E3E3;"><span style="font-size:12.5px; line-height:1.45; color:#3A3B3C;">Engagement initial {{document.engagement_mois}} mois</span><span class="ar" style="font-weight:700; font-size:13px; color:#232526; white-space:nowrap;">{{total.recurrent_engagement}}</span></div>
    </div>{{/total.mensuel_ht}}
  </div>

  <!-- Recap table -->
  <div class="keep" style="background:#FFFAFA; border:1px solid #E8E3E3; border-radius:8px; box-shadow:0 2px 12px rgba(35,37,38,0.06); padding:26px 30px; margin-bottom:20px;">
    <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#9A9594; margin-bottom:16px;">Récapitulatif de l'investissement{{#total.mensuel_ht}} — {{document.engagement_mois}} premiers mois{{/total.mensuel_ht}}</div>
    <table style="width:100%; border-collapse:collapse;">
      <tbody>
        <tr>
          <td style="font-size:13.5px; line-height:1.5; color:#3A3B3C; padding:11px 0; border-bottom:1px solid #E8E3E3;">Phase 1 — Infrastructure &amp; Lancement (frais unique)</td>
          <td class="ar" style="font-weight:700; font-size:14px; color:#232526; padding:11px 0; border-bottom:1px solid #E8E3E3; text-align:right; white-space:nowrap;">{{total.avant_remise}}</td>
        </tr>
        {{#remise}}<tr>
          <td style="font-size:13.5px; line-height:1.5; color:#C49A2E; padding:11px 0; border-bottom:1px solid #E8E3E3;">Escompte de bienvenue sur la Phase 1 (−{{remise.pourcentage}} %)</td>
          <td class="ar" style="font-weight:700; font-size:14px; color:#C49A2E; padding:11px 0; border-bottom:1px solid #E8E3E3; text-align:right; white-space:nowrap;">−{{remise.montant}}</td>
        </tr>{{/remise}}
        {{#total.mensuel_ht}}<tr>
          <td style="font-size:13.5px; line-height:1.5; color:#3A3B3C; padding:11px 0; border-bottom:1px solid #E8E3E3;">Phase 2 — Gestion mensuelle ({{total.mensuel_ht}}) × {{document.engagement_mois}} mois</td>
          <td class="ar" style="font-weight:700; font-size:14px; color:#232526; padding:11px 0; border-bottom:1px solid #E8E3E3; text-align:right; white-space:nowrap;">{{total.recurrent_engagement}}</td>
        </tr>{{/total.mensuel_ht}}
        <tr>
          <td style="font-size:13.5px; line-height:1.5; color:#232526; font-weight:700; padding:11px 0; border-bottom:1.5px solid #232526;">Total honoraires DigiHunt</td>
          <td class="ar" style="font-weight:800; font-size:15px; color:#232526; padding:11px 0; border-bottom:1.5px solid #232526; text-align:right; white-space:nowrap;">{{total.ht}}</td>
        </tr>
        {{#budget}}<tr>
          <td style="font-size:13.5px; line-height:1.5; color:#7E7978; padding:11px 0; border-bottom:1px solid #E8E3E3;">Budget publicitaire Meta (estimé, payé à Meta)</td>
          <td class="ar" style="font-weight:700; font-size:14px; color:#7E7978; padding:11px 0; border-bottom:1px solid #E8E3E3; text-align:right; white-space:nowrap;">{{budget.total}}</td>
        </tr>{{/budget}}
      </tbody>
    </table>
    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; background:#F5F0F0; border-radius:6px; padding:16px 20px; margin-top:18px;">
      <span class="ar" style="font-weight:700; font-size:14px; color:#232526;">Investissement total estimé sur {{document.engagement_mois}} mois</span>
      <span class="ar" style="font-weight:800; font-size:22px; color:#D0A837; white-space:nowrap;">{{total.global_estime}}</span>
    </div>
  </div>

  {{#budget}}<div class="keep" style="display:flex; gap:13px; align-items:flex-start; background:#F5F0F0; border-radius:8px; padding:18px 22px;">
    <span class="ar" style="color:#D0A837; font-weight:800; font-size:14px; line-height:1.5;">!</span>
    <p style="font-size:13px; line-height:1.7; color:#3A3B3C; margin:0;">Le budget d'achat d'espace publicitaire — l'argent versé directement à Meta, d'environ <strong style="color:#232526;">{{budget.mensuel}} par mois (soit {{budget.quotidien}} par jour)</strong> — est distinct de ces honoraires et sera facturé directement sur votre carte de crédit par Meta. Tous les montants sont en dollars canadiens (CAD), avant taxes applicables (TPS / TVQ).</p>
  </div>{{/budget}}
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>


<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;">
    <span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">04</span>
    <h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Modalités &amp; Engagements Mutuels</h2>
  </div>

  <div class="keep" style="margin-bottom:30px;">
    <h4 class="ar" style="font-weight:700; font-size:15px; letter-spacing:0.02em; color:#232526; margin:0 0 14px; text-transform:uppercase;">Conditions de paiement</h4>
    <p style="font-size:14px; line-height:1.75; color:#3A3B3C; margin:0 0 16px;">La facturation de la Phase 1 s'effectue en deux versements égaux afin de sécuriser le projet de part et d'autre.</p>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="width:24%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Versement</th>
          <th style="width:20%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Montant</th>
          <th style="text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 0 10px 0; border-bottom:1.5px solid #232526;">Déclencheur</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Acompte (50 %)</td>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top; white-space:nowrap;">{{acompte.montant_ht}}</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">À la signature de cette proposition.</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Solde (50 %)</td>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top; white-space:nowrap;">{{solde.montant_ht}}</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">À la livraison et mise en ligne de la Landing Page.</td>
        </tr>
        {{#total.mensuel_ht}}<tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; vertical-align:top;">Mensualité Phase 2</td>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 16px 13px 0; vertical-align:top; white-space:nowrap;">{{total.mensuel_ht}} / mois</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; vertical-align:top;">Facturée au début de chaque mois, dès le lancement.</td>
        </tr>{{/total.mensuel_ht}}
      </tbody>
    </table>
  </div>

  <div class="keep" style="margin-bottom:30px;">
    <h4 class="ar" style="font-weight:700; font-size:15px; letter-spacing:0.02em; color:#232526; margin:0 0 12px; text-transform:uppercase;">Propriété &amp; Transfert</h4>
    <p style="font-size:14px; line-height:1.75; color:#3A3B3C; margin:0;">Le transfert de la Landing Page et des accès administratifs au client est conditionné par le paiement intégral de la balance due. La somme due doit être réglée dans un délai de 14 jours suivant la livraison.</p>
  </div>

  <div class="keep">
    <h4 class="ar" style="font-weight:700; font-size:15px; letter-spacing:0.02em; color:#232526; margin:0 0 12px; text-transform:uppercase;">Ce que le client s'engage à fournir</h4>
    <p style="font-size:14px; line-height:1.75; color:#3A3B3C; margin:0 0 16px;">Pour assurer un lancement rapide et fluide, le client s'engage à fournir les éléments suivants dans les <strong style="color:#232526;">48 heures suivant la signature</strong> :</p>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="width:34%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Élément requis</th>
          <th style="text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 0 10px 0; border-bottom:1.5px solid #232526;">Détail</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Accès au Business Manager Meta</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Rôle d'administrateur sur la page Facebook et le compte publicitaire.</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Nom de domaine</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Accès au registraire (ex. : GoDaddy, Namecheap) ou achat d'un nouveau domaine.</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Adresse courriel professionnelle</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">À créer si inexistante.</td>
        </tr>
        <tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Photos et vidéos de l'entreprise</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Réalisations, ambiance, équipe — pour les créatifs publicitaires.</td>
        </tr>
        {{#brief.systeme_reservation}}<tr>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; vertical-align:top;">Accès au système de réservation {{brief.systeme_reservation}}</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; vertical-align:top;">Pour l'intégration ou la migration vers la nouvelle solution.</td>
        </tr>{{/brief.systeme_reservation}}
      </tbody>
    </table>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>


<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;">
    <span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">05</span>
    <h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Prochaines Étapes</h2>
  </div>
  <p style="font-size:14.5px; line-height:1.78; color:#3A3B3C; margin:0 0 24px;">Dès la signature de cette proposition et la réception du premier versement de {{acompte.montant_ht}}, nous planifierons une rencontre de démarrage (Kick-off) pour remplir le cahier des charges détaillé et collecter les éléments visuels nécessaires. Notre objectif est de lancer vos nouvelles campagnes dans un délai de <strong style="color:#232526;">{{offre_recommandee.delai}}</strong> suivant cette rencontre.</p>

  <div class="keep">
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="width:34px; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 12px 10px 0; border-bottom:1.5px solid #232526;">#</th>
          <th style="text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Action</th>
          <th style="width:22%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 16px 10px 0; border-bottom:1.5px solid #232526;">Responsable</th>
          <th style="width:24%; text-align:left; font-size:10px; font-weight:400; letter-spacing:0.12em; text-transform:uppercase; color:#9A9594; padding:0 0 10px 0; border-bottom:1.5px solid #232526;">Délai</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">1</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Signature de la proposition &amp; versement de l'acompte ({{acompte.montant_ht}})</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">{{client.contact.prenom}}</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Dès réception</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">2</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Rencontre Kick-off &amp; cahier des charges</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Les deux parties</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">48 h après la signature</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">3</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Fourniture des éléments (accès, photos, domaine)</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">{{client.contact.prenom}}</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">48 h après le Kick-off</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">4</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Conception et développement de la Landing Page</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">DigiHunt</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">5 jours ouvrables</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">5</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Configuration Meta Ads &amp; création des annonces</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">DigiHunt</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">3 jours ouvrables</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">6</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Validation client &amp; versement du solde ({{solde.montant_ht}})</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">{{client.contact.prenom}}</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 0; border-bottom:1px solid #E8E3E3; vertical-align:top;">Avant mise en ligne</td>
        </tr>
        <tr>
          <td class="ar" style="font-weight:800; font-size:13px; color:#D0A837; padding:13px 12px 13px 0; vertical-align:top;">7</td>
          <td style="font-size:13px; line-height:1.5; color:#232526; padding:13px 16px 13px 0; vertical-align:top;">Lancement officiel des campagnes</td>
          <td style="font-size:13px; line-height:1.5; color:#3A3B3C; padding:13px 16px 13px 0; vertical-align:top;">DigiHunt</td>
          <td class="ar" style="font-size:13px; line-height:1.5; color:#D0A837; font-weight:700; padding:13px 0; vertical-align:top;">J + 10 après signature</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>


<div class="page">
  <div class="pg-head"><span>DigiHunt — Agence Webflow &amp; Acquisition</span><span>Proposition — {{client.nom}}</span></div>
  <section>
  <div class="keep" style="display:flex; align-items:baseline; gap:18px; margin-bottom:22px;">
    <span class="ar" style="font-weight:800; font-size:34px; line-height:1; color:#D0A837;">06</span>
    <h2 class="ar" style="font-weight:700; font-size:26px; letter-spacing:-0.01em; color:#232526; margin:0;">Acceptation &amp; Signature</h2>
  </div>

  <div class="keep" style="background:#232526; border-radius:8px; padding:26px 30px; margin:0 0 32px;">
    <p style="font-size:14px; line-height:1.7; color:#FFFAFA; margin:0;">En signant ci-dessous, les deux parties acceptent les termes, les livrables, la tarification et les modalités de paiement décrits dans cette proposition de service.</p>
  </div>

  <div class="keep" style="display:flex; gap:40px; flex-wrap:wrap;">
    <div style="flex:1 1 240px;">
      <div style="height:44px; border-bottom:1.5px solid #232526;"></div>
      <div class="ar" style="font-weight:700; font-size:15px; color:#232526; margin-top:10px;">{{client.contact.nom}}</div>
      <div style="font-size:12px; letter-spacing:0.04em; color:#7E7978; text-transform:uppercase; margin-top:3px;">{{client.nom}}</div>
      <div style="font-size:13px; color:#9A9594; margin-top:16px;">Date : ___________________</div>
    </div>
    <div style="flex:1 1 240px;">
      <div style="height:44px; border-bottom:1.5px solid #232526;"></div>
      <div class="ar" style="font-weight:700; font-size:15px; color:#232526; margin-top:10px;">{{agence.representant}}</div>
      <div style="font-size:12px; letter-spacing:0.04em; color:#7E7978; text-transform:uppercase; margin-top:3px;">{{agence.nom}}</div>
      <div style="font-size:13px; color:#9A9594; margin-top:16px;">Date : ___________________</div>
    </div>
  </div>

  <div style="display:flex; align-items:center; gap:12px; margin-top:48px; padding-top:24px; border-top:1px solid #E8E3E3;">
    <img src="{{agence.logo}}" alt="DigiHunt" style="height:26px; width:auto; opacity:0.85;">
    <span style="font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#9A9594;">DigiHunt — Agence Webflow &amp; Acquisition · Québec</span>
  </div>
</section>
  <div class="pg-foot"><span>{{client.nom}} · Confidentiel</span><span>{{document.reference}}</span></div>
</div>

</div>
$gabarit$
 where id = '33330000-0000-0000-0000-000000000006' and body_html is null;

-- ── Contrat de services professionnels (contrat) ──
update public.document_template
   set prefix = coalesce(prefix, 'CT'),
       payment_instructions = coalesce(payment_instructions, 'virement bancaire ou carte de crédit (facturation transmise via QuickBooks ou Stripe)')
 where id = '33330000-0000-0000-0000-000000000004';
update public.document_template
   set body_html = $gabarit$<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Noto+Sans:wght@400;600;700&display=swap');
@page {
    size: Letter;
    margin: 0.9in;
    @top-left { content: "Contrat de services professionnels"; font-family: Archivo, sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8F98; }
    @top-right { content: "{{client.raison_sociale}}"; font-family: Archivo, sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.02em; color: #1C3254; }
    @bottom-left { content: "Agence DigiHunt — Contrat de services"; font-family: Archivo, sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8F98; }
    @bottom-right { content: "Page " counter(page) " sur " counter(pages); font-family: Archivo, sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8F98; }
  }
  html, body { margin: 0; padding: 0; }
  body { background: #fff; font-family: 'Noto Sans', 'Helvetica Neue', sans-serif; font-size: 16px; line-height: 1.65; color: #1a1a1a; }
  /* Pagination propre : aucun paragraphe, puce ou tableau coupé entre deux pages ; jamais de titre orphelin en bas de page */
  .content p, .content li, .content table { break-inside: avoid; }
  .content h2 { break-after: avoid; }
  .content { orphans: 3; widows: 3; }
  /* filled tokens render plain; only remaining to-fill fields stay amber */
  [data-token] { background: transparent !important; color: inherit !important; padding: 0 !important; }
  [data-todo] { background: #FBE9C7 !important; color: #8A5B00 !important; padding: 0 3px !important; border-radius: 2px !important; font-style: normal !important; }
.content { max-width: 8.5in; margin: 0 auto; padding: 0.9in; background: #fff; box-sizing: border-box; }
@media print { .content { max-width: none; padding: 0; } }

</style>
<div class="content">


        <div style="min-height:8.85in;display:flex;flex-direction:column;justify-content:space-between;break-after:page;break-inside:avoid;">
      <div style="padding-top:18px;">
        <img src="{{agence.logo}}" alt="Agence DigiHunt" style="height:54px;display:block;">
      </div>
      <div>
        <div style="width:44px;border-top:3px solid #1C3254;margin-bottom:26px;"></div>
        <div style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#8A8F98;margin-bottom:16px;">Proposition {{proposition.reference}}</div>
        <h1 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:34px;font-weight:800;letter-spacing:0.01em;text-transform:uppercase;line-height:1.2;color:#1a1a1a;margin:0 0 26px;max-width:9em;">Contrat de services professionnels</h1>
        <p style="margin:0;font-size:18px;color:#3A3B3C;">intervenu entre <strong>{{agence.nom}}</strong></p>
        <p style="margin:6px 0 0;font-size:18px;color:#3A3B3C;">et <strong>{{client.raison_sociale}}</strong></p>
      </div>
      <div style="border-top:1px solid #E3E6EB;padding-top:14px;display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8A8F98;">{{agence.ville}}, Canada</span>
        <span style="font-size:15px;color:#3A3B3C;">Date : {{document.date}}</span>
      </div>
    </div>

    <div style="break-inside:avoid;">
      <p style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;">Entre :</p>
      <p style="margin:0 0 8px;"><strong>{{agence.raison_sociale}}</strong>, NEQ {{agence.neq}}, ayant son établissement au {{agence.adresse}}, agissant personnellement,</p>
      <p style="margin:0 0 20px;color:#3A3B3C;">ci-après désigné « <strong>le Prestataire</strong> » ;</p>
      <p style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;">Et :</p>
      <p style="margin:0 0 8px;"><strong>{{client.raison_sociale}}</strong>, {{client.forme_juridique}}, ayant son établissement au {{client.adresse}}, représentée aux fins des présentes par {{client.contact.nom}}, {{client.contact.titre}}, dûment autorisée à cet effet,</p>
      <p style="margin:0 0 20px;color:#3A3B3C;">ci-après désignée « <strong>le Client</strong> » ;</p>
      <p style="margin:0;font-size:15px;color:#6E7178;font-style:italic;">(ci-après collectivement « les Parties » et individuellement « une Partie »)</p>
    </div>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;">Préambule</h2>
      <p style="margin:0 0 10px;">ATTENDU QUE le Client a pris connaissance de la proposition de services numéro {{proposition.reference}} datée du {{proposition.date}} (ci-après la « Proposition ») et l'a acceptée ;</p>
      <p style="margin:0 0 10px;">ATTENDU QUE le Prestataire œuvre dans le domaine du développement web, du référencement (SEO) et de la stratégie numérique, et possède l'expertise nécessaire à la réalisation du mandat décrit aux présentes ;</p>
      <p style="margin:0 0 10px;">ATTENDU QUE les Parties souhaitent établir par écrit les modalités de leur entente ;</p>
      <p style="margin:0;"><strong>EN CONSÉQUENCE, LES PARTIES CONVIENNENT DE CE QUI SUIT :</strong></p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 1 — Objet du contrat</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">1.1</span>&nbsp; Le présent contrat a pour objet d'établir les modalités selon lesquelles le Prestataire fournira au Client les services décrits à l'Annexe A (ci-après le <br>« Mandat »).</p>
      <p style="margin:0 0 6px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">1.2</span>&nbsp; Le présent contrat est constitué des documents suivants, lesquels en font partie intégrante :</p>
      <div style="padding-left:40px;">
        <p style="margin:0 0 4px;">(a) le corps du présent contrat ;</p>
        <p style="margin:0 0 4px;">(b) l'Annexe A — Description détaillée des livrables et échéancier ;</p>
        <p style="margin:0 0 10px;">(c) la Proposition acceptée par le Client.</p>
        <p style="margin:0;">En cas de conflit entre ces documents, l'ordre de priorité ci-dessus prévaut, sauf indication contraire expresse.</p>
      </div>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 2 — Livrables et portée du mandat</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">2.1</span>&nbsp; Les livrables, fonctionnalités, pages, contenus et étapes du Mandat sont décrits de façon exhaustive à l'Annexe A.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">2.2</span>&nbsp; Toute demande ne figurant pas explicitement à l'Annexe A est considérée hors portée (« hors scope ») et fera l'objet d'une offre de service distincte ou d'un avenant écrit au présent contrat, incluant le cas échéant un ajustement des honoraires et de l'échéancier.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">2.3</span>&nbsp; Toute modification substantielle au Mandat en cours de réalisation doit être convenue par écrit entre les Parties (courriel suffisant) avant exécution, et peut entraîner une révision des honoraires et des délais.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 3 — Responsabilités du Prestataire</h2>
      <p style="margin:0 0 10px;">Le Prestataire s'engage à :</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">3.1</span>&nbsp; Réaliser le Mandat avec professionnalisme, diligence et selon les règles de l'art reconnues dans son domaine (incluant, le cas échéant, les meilleures pratiques Webflow et les conventions Client-First) ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">3.2</span>&nbsp; Respecter l'échéancier convenu à l'Annexe A, sous réserve des délais additionnels résultant d'un manquement du Client à ses obligations (article 4 et article 5) ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">3.3</span>&nbsp; Maintenir une communication régulière avec le Client sur l'avancement du Mandat ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">3.4</span>&nbsp; Soumettre les livrables à l'approbation du Client aux étapes clés identifiées à l'Annexe A ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">3.5</span>&nbsp; Aviser promptement le Client de tout enjeu susceptible d'affecter les délais, les coûts ou la qualité du Mandat.</p>
      <p style="margin:0;">Le Prestataire n'est pas responsable des retards, défauts ou limitations résultant du contenu, des accès ou des approbations fournis (ou non fournis) par le Client.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 4 — Responsabilités du Client</h2>
      <p style="margin:0 0 10px;">Le Client s'engage à :</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">4.1</span>&nbsp; Désigner une personne-contact unique autorisée à approuver les livrables et à prendre les décisions relatives au Mandat ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">4.2</span>&nbsp; Fournir, dans les délais convenus, l'ensemble du contenu nécessaire à la réalisation du Mandat (textes, images, logos, accès aux comptes tiers, identifiants, etc.), et garantir qu'il détient tous les droits nécessaires sur ce contenu ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">4.3</span>&nbsp; Répondre aux demandes d'approbation, de rétroaction ou de clarification du Prestataire dans un délai de <strong>5 jours ouvrables</strong>, à défaut de quoi l'échéancier prévu à l'Annexe A sera prolongé d'autant, sans pénalité pour le Prestataire ;</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">4.4</span>&nbsp; Effectuer les paiements selon les modalités et échéances prévues à l'article 6 ;</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">4.5</span>&nbsp; Collaborer de bonne foi et fournir au Prestataire l'ensemble des informations pertinentes à la bonne exécution du Mandat.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 5 — Échéancier et délais de réalisation</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">5.1</span>&nbsp; L'échéancier prévisionnel du Mandat est détaillé à l'Annexe A.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">5.2</span>&nbsp; Cet échéancier est établi en fonction d'une collaboration diligente des deux Parties. Tout retard attribuable au Client (contenu manquant, approbations tardives, changements de direction en cours de mandat) reporte d'autant les dates de livraison, sans que cela ne constitue un manquement du Prestataire.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;">
      <div style="break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 6 — Honoraires et modalités de paiement</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">6.1</span>&nbsp; <strong>Montant total.</strong> Le montant total des honoraires pour le Mandat est de <strong>{{total.ht}}</strong> <strong>$ CAD</strong>, avant les taxes applicables, tel que détaillé dans la Proposition. Le détail est le suivant :</p>
      </div>
      <table style="border-collapse:collapse;width:100%;max-width:440px;margin:4px 0 16px 40px;font-size:15px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 10px 6px 0;border-bottom:1px solid #D9DDE4;"></th>
            <th style="text-align:right;font-family:Archivo,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8A8F98;padding:6px 0;border-bottom:1px solid #D9DDE4;">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">Honoraires professionnels</td><td style="padding:7px 0;border-bottom:1px solid #E3E6EB;text-align:right;">{{total.ht}}</td></tr>
          <tr><td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">TPS</td><td style="padding:7px 0;border-bottom:1px solid #E3E6EB;text-align:right;">{{total.tps}}</td></tr>
          <tr><td style="padding:7px 10px 7px 0;border-bottom:1px solid #E3E6EB;">TVQ</td><td style="padding:7px 0;border-bottom:1px solid #E3E6EB;text-align:right;">{{total.tvq}}</td></tr>
          <tr style="background:#F2F4F8;"><td style="padding:9px 10px 9px 8px;border-bottom:1px solid #D9DDE4;font-weight:700;">Total à payer (taxes incluses)</td><td style="padding:9px 4px 9px 0;border-bottom:1px solid #D9DDE4;text-align:right;font-weight:700;">{{total.ttc}} CAD</td></tr>
        </tbody>
      </table>
      </div>
      <p style="margin:0 0 8px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">6.2</span>&nbsp; <strong>Échéancier de paiement.</strong> Les montants ci-dessous s'entendent taxes incluses et correspondent aux sommes effectivement exigibles.</p>
      <ul style="margin:0 0 10px;padding-left:60px;">
        <li style="margin-bottom:8px;">Un acompte de <strong>{{acompte.pourcentage}} %</strong>, soit <strong>{{acompte.montant_ttc}} CAD taxes incluses</strong> ({{acompte.montant_ht}} + taxes), est exigible à la signature du présent contrat et doit être acquitté avant le début des travaux ;</li>
        <li style="margin-bottom:0;">Le solde de <strong>{{solde.pourcentage}} %</strong>, soit <strong>{{solde.montant_ttc}} CAD taxes incluses</strong> ({{solde.montant_ht}} + taxes), est facturé à la livraison finale du Mandat et payable dans les <strong>15 jours</strong> suivant la date de facturation.</li>
      </ul>
      <p style="margin:0 0 10px;padding-left:40px;">Les taux de taxes applicables sont ceux en vigueur à la date de facturation. Toute modification législative des taux ajuste les montants en conséquence.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">6.3</span>&nbsp; <strong>Modes de paiement acceptés :</strong> {{document.paiement}}.</p>
      <p style="margin:0 0 8px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">6.4</span>&nbsp; <strong>Retard de paiement.</strong> Tout retard de paiement doit être signalé par le Client dans les meilleurs délais. Les Parties conviennent de discuter de bonne foi d'un calendrier de paiement ajusté lorsque le retard résulte de délais administratifs indépendants de la volonté du Client (ex. : processus d'approbation interne, versement d'une subvention, cycle de reddition de comptes). En l'absence d'entente ou en cas de retard dépassant <strong>60 jours</strong> sans justification, le Prestataire se réserve le droit d'appliquer des frais de retard raisonnables et de suspendre les services en cours jusqu'au règlement.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 7 — Annulation et remboursement</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">7.1</span>&nbsp; <strong>Annulation avant le début des travaux.</strong> Si le Client annule le Mandat avant le début des travaux, l'acompte versé demeure acquis au Prestataire et n'est pas remboursable, celui-ci couvrant la réservation de disponibilité, la planification et les travaux préparatoires déjà engagés.</p>
      <p style="margin:0 0 6px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">7.2</span>&nbsp; <strong>Annulation en cours de mandat.</strong> Si le Client met fin au Mandat après le début des travaux :</p>
      <div style="padding-left:40px;">
        <p style="margin:0 0 4px;">(a) l'acompte versé demeure acquis au Prestataire et n'est pas remboursable ;</p>
        <p style="margin:0 0 10px;">(b) toute somme versée au-delà de l'acompte est remboursée <strong>au prorata du travail réellement effectué</strong>, calculé en fonction de l'avancement des livrables prévus à l'Annexe A au moment de la résiliation. Le Prestataire fournit au Client, sur demande, un état détaillé du travail accompli justifiant ce calcul.</p>
      </div>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">7.3</span>&nbsp; <strong>Annulation par le Prestataire.</strong> Si le Prestataire met fin au Mandat sans motif valable imputable au Client, il rembourse au Client les sommes versées correspondant au travail non réalisé.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;">
      <div style="break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 8 — Propriété intellectuelle</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">8.1</span>&nbsp; <strong>Cession des droits.</strong> La cession des droits de propriété intellectuelle sur les livrables (code, design, gabarits produits spécifiquement pour le Mandat) au bénéfice du Client <strong>n'intervient qu'à la réception, par le Prestataire, du paiement intégral et complet du montant total prévu à l'article 6</strong>.</p>
      </div>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">8.2</span>&nbsp; <strong>Avant paiement intégral.</strong> Tant que le paiement complet n'a pas été reçu, le Client bénéficie uniquement d'une licence d'utilisation limitée et non exclusive aux fins d'évaluation des livrables. Aucune reproduction, exploitation commerciale, mise en ligne définitive ou cession à un tiers n'est autorisée avant le règlement intégral des sommes dues.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">8.3</span>&nbsp; <strong>Éléments préexistants du Prestataire.</strong> Les méthodologies, gabarits génériques, composants réutilisables, bibliothèques de code et savoir-faire du Prestataire développés antérieurement ou indépendamment du Mandat demeurent en tout temps la propriété exclusive du Prestataire. Le Client se voit accorder une licence perpétuelle d'utilisation de ces éléments uniquement dans le cadre du livrable final qui lui est remis.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">8.4</span>&nbsp; <strong>Contenu fourni par le Client.</strong> Tout contenu fourni par le Client (textes, images, logos, marques) demeure sa propriété exclusive. Le Client garantit détenir tous les droits nécessaires sur ce contenu et s'engage à indemniser le Prestataire de toute réclamation d'un tiers découlant de l'utilisation de ce contenu.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">8.5</span>&nbsp; <strong>Droit de portfolio.</strong> Sauf entente de confidentialité contraire convenue par écrit, le Prestataire conserve le droit de mentionner le projet réalisé et de l'afficher à titre de référence dans son portfolio et ses communications commerciales.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 9 — Licences et outils tiers</h2>
      <p style="margin:0;">Les abonnements, licences, noms de domaine, services d'hébergement et outils tiers nécessaires au projet (ex. : Webflow, plugins, extensions) sont, sauf entente contraire écrite, souscrits au nom du Client et demeurent sa propriété et sa responsabilité financière. Le Prestataire n'assume aucune responsabilité quant aux frais récurrents de ces services tiers.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 10 — Garantie et support post-livraison</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">10.1</span>&nbsp; Le Prestataire garantit la correction, sans frais, de toute anomalie ou défaut de fonctionnement directement attribuable à son travail, signalé dans les <strong>30 jours</strong> suivant la livraison finale.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">10.2</span>&nbsp; Cette garantie ne couvre pas : les demandes de modification de contenu ou de design, l'ajout de nouvelles fonctionnalités, ni les problèmes résultant de modifications apportées par le Client ou un tiers après la livraison.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">10.3</span>&nbsp; Au-delà de cette période, tout support, mise à jour ou maintenance est couvert par une entente de maintenance distincte.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 11 — Confidentialité</h2>
      <p style="margin:0;">Chaque Partie s'engage à conserver confidentiels tous les renseignements de nature confidentielle ou commercialement sensible de l'autre Partie dont elle prendrait connaissance dans le cadre du Mandat, et à ne pas les divulguer à des tiers sans consentement écrit préalable, sauf obligation légale contraire. Cette obligation survit à la résiliation ou à l'échéance du présent contrat pour une durée de <strong>2 ans</strong>.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 12 — Protection des renseignements personnels</h2>
      <p style="margin:0;">Chaque Partie s'engage à se conformer à la législation applicable en matière de protection des renseignements personnels, incluant la <em>Loi sur la protection des renseignements personnels dans le secteur privé</em> (Loi 25), pour tout renseignement personnel dont elle a la garde ou le contrôle dans le cadre du Mandat.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 13 — Limitation de responsabilité</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">13.1</span>&nbsp; La responsabilité totale du Prestataire envers le Client, pour quelque cause que ce soit découlant du présent contrat, est limitée au montant total des honoraires effectivement versés par le Client en vertu du présent contrat.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">13.2</span>&nbsp; En aucun cas le Prestataire ne pourra être tenu responsable de dommages indirects, accessoires, spéciaux ou consécutifs, incluant notamment la perte de profits, de revenus, de clientèle ou de données, même s'il a été avisé de la possibilité de tels dommages.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">13.3</span>&nbsp; Cette limitation ne s'applique pas en cas de faute lourde ou intentionnelle du Prestataire.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 14 — Force majeure</h2>
      <p style="margin:0;">Aucune des Parties ne peut être tenue responsable d'un manquement à ses obligations résultant d'un cas de force majeure, soit un événement imprévisible et irrésistible échappant à son contrôle raisonnable (incluant, sans s'y limiter, catastrophe naturelle, panne majeure de services essentiels, acte gouvernemental). La Partie affectée doit aviser l'autre dans les meilleurs délais et les Parties conviendront de bonne foi des ajustements nécessaires à l'échéancier.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 15 — Résiliation</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">15.1</span>&nbsp; Une Partie peut résilier le présent contrat en cas de manquement substantiel de l'autre Partie à ses obligations, si ce manquement n'est pas corrigé dans les <strong>10 jours</strong> suivant un avis écrit détaillant le manquement.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">15.2</span>&nbsp; En cas de résiliation, le Client demeure tenu de payer le Prestataire pour l'ensemble du travail réalisé jusqu'à la date de résiliation, sous réserve des modalités de remboursement prévues à l'article 7.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 16 — Langue du contrat</h2>
      <p style="margin:0;">Conformément à la Charte de la langue française, le présent contrat est rédigé et proposé en français. Si les Parties conviennent expressément d'une version dans une autre langue, celle-ci ne sera valide qu'après que le Client aura eu l'occasion de prendre connaissance de la présente version française.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 17 — Droit applicable et juridiction</h2>
      <p style="margin:0;">Le présent contrat est régi par les lois de la province de Québec et les lois fédérales du Canada qui s'y appliquent. Les Parties conviennent de la compétence exclusive des tribunaux du district judiciaire de {{agence.district_judiciaire}} pour tout litige découlant du présent contrat.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;">
      <div style="break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 12px;" class="art-title">Article 18 — Dispositions générales</h2>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">18.1</span>&nbsp; <strong>Intégralité de l'entente.</strong> Le présent contrat, incluant ses annexes, constitue l'intégralité de l'entente entre les Parties et remplace toute entente ou communication antérieure, écrite ou verbale, portant sur le même objet.</p>
      </div>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">18.2</span>&nbsp; <strong>Divisibilité.</strong> Si une clause du présent contrat est jugée invalide ou inexécutable, les autres clauses demeurent en vigueur.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">18.3</span>&nbsp; <strong>Cession.</strong> Le Client ne peut céder ses droits ou obligations en vertu du présent contrat sans le consentement écrit préalable du Prestataire.</p>
      <p style="margin:0 0 10px;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">18.4</span>&nbsp; <strong>Aucune renonciation implicite.</strong> Le fait pour une Partie de ne pas exercer un droit prévu aux présentes ne constitue pas une renonciation à ce droit.</p>
      <p style="margin:0;padding-left:40px;text-indent:-40px;"><span style="font-family:Archivo,'Helvetica Neue',sans-serif;font-weight:600;font-size:14px;color:#1C3254;" class="cl-num">18.5</span>&nbsp; <strong>Signature électronique.</strong> Les Parties reconnaissent la validité juridique d'une signature électronique apposée au présent contrat.</p>
    </section>

    <section style="border-top:1px solid #D9DDE4;margin-top:30px;padding-top:18px;break-inside:avoid;">
      <h2 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1C3254;margin:0 0 8px;">Signatures</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6E7178;">Les Parties reconnaissent avoir lu et compris le présent contrat et en acceptent les modalités.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;">
        <div>
          <p style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1C3254;margin:0 0 72px;">Pour le Prestataire</p>
          <div style="border-bottom:1px solid #1a1a1a;margin-bottom:8px;"></div>
          <p style="margin:0 0 20px;font-family:Archivo,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8A8F98;">Signature</p>
          <p style="margin:0 0 10px;font-size:15px;">Nom : {{agence.representant}}</p>
          <p style="margin:0 0 10px;font-size:15px;">Titre : {{agence.representant_titre}}, {{agence.nom}}</p>
          <p style="margin:0;font-size:15px;">Date : <span style="display:inline-block;width:180px;border-bottom:1px solid #3A3B3C;">&nbsp;</span></p>
        </div>
        <div>
          <p style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1C3254;margin:0 0 72px;">Pour le Client</p>
          <div style="border-bottom:1px solid #1a1a1a;margin-bottom:8px;"></div>
          <p style="margin:0 0 20px;font-family:Archivo,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8A8F98;">Signature</p>
          <p style="margin:0 0 10px;font-size:15px;">Nom : {{client.contact.nom}}</p>
          <p style="margin:0 0 10px;font-size:15px;">Titre : {{client.contact.titre}}</p>
          <p style="margin:0;font-size:15px;">Date : <span style="display:inline-block;width:180px;border-bottom:1px solid #3A3B3C;">&nbsp;</span></p>
        </div>
      </div>
    </section>

    

</div>
$gabarit$
 where id = '33330000-0000-0000-0000-000000000004' and body_html is null;

-- ── Annexe A — Livrables et échéancier (annexe) ──
insert into public.document_template
  (id, agency_id, kind, name, is_default, prefix, include_year, number_padding,
   payment_terms_days, intro, legal_mentions, footer, payment_instructions)
values ('33330000-0000-0000-0000-000000000005', '11110000-0000-0000-0000-000000000001', 'annexe', 'Annexe A — Livrables et échéancier', true, 'AN', true, 3,
        0, null, null, null, null)
on conflict (id) do nothing;
update public.document_template
   set body_html = $gabarit$<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Noto+Sans:wght@400;600;700&display=swap');
@page {
    size: Letter;
    margin: 0.9in;
    @top-left { content: "Annexe A — Livrables et échéancier"; font-family: Archivo, sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8F98; }
    @top-right { content: "{{client.raison_sociale}}"; font-family: Archivo, sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.02em; color: #1C3254; }
    @bottom-left { content: "DigiHunt — Contrat de services"; font-family: Archivo, sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8F98; }
    @bottom-right { content: "Page " counter(page) " sur " counter(pages); font-family: Archivo, sans-serif; font-size: 8.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8F98; }
  }
  html, body { margin: 0; padding: 0; }
  body { background: #fff; font-family: 'Noto Sans', 'Helvetica Neue', sans-serif; font-size: 16px; line-height: 1.65; color: #1a1a1a; }
  a { color: #1C3254; } a:hover { color: #C49A2E; }
  h2.sec { font-family: Archivo, 'Helvetica Neue', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #1C3254; margin: 0 0 12px; }
  h3.sub { font-family: Archivo, 'Helvetica Neue', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; color: #1C3254; margin: 18px 0 8px; }
  table.tab { width: 100%; border-collapse: collapse; font-size: 14.5px; }
  table.tab th { background: #EEF1F5; font-family: Archivo, 'Helvetica Neue', sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #1C3254; text-align: left; padding: 9px 12px; border: 1px solid #D9DDE4; }
  table.tab td { padding: 9px 12px; border: 1px solid #E3E6EB; vertical-align: top; line-height: 1.55; }
  table.tab tr { break-inside: avoid; }
  [data-token] { background: transparent !important; color: inherit !important; padding: 0 !important; }
  [data-todo] { background: #FBE9C7 !important; color: #8A5B00 !important; padding: 0 3px !important; border-radius: 2px !important; font-style: normal !important; }
  .todo { background: #FBE9C7; color: #8A5B00; padding: 0 3px; border-radius: 2px; }
  section.blk { border-top: 1px solid #D9DDE4; margin-top: 30px; padding-top: 18px; }
  h2.sec, h3.sub { break-after: avoid; }
  table.tab thead { break-inside: avoid; break-after: avoid; }
  section.pg { break-before: page; border-top: none; margin-top: 0; padding-top: 6px; }
.content { max-width: 8.5in; margin: 0 auto; padding: 0.9in; background: #fff; box-sizing: border-box; }
@media print { .content { max-width: none; padding: 0; } }

</style>
<div class="content">

    <div style="padding-top:12px;break-inside:avoid;">
    <img src="{{agence.logo}}" alt="DigiHunt" style="height:44px;display:block;margin-bottom:34px;">
    <div style="width:44px;border-top:3px solid #1C3254;margin-bottom:22px;"></div>
    <h1 style="font-family:Archivo,'Helvetica Neue',sans-serif;font-size:28px;font-weight:800;letter-spacing:0.01em;text-transform:uppercase;line-height:1.25;color:#1a1a1a;margin:0 0 10px;">Annexe A — Description détaillée des livrables et échéancier</h1>
    <p style="margin:0 0 4px;font-size:16px;color:#3A3B3C;">Contrat de services professionnels n<sup>o</sup> {{contrat.reference}}</p>
    <p style="margin:0;font-size:16px;color:#3A3B3C;"><strong>{{agence.nom}}</strong> × <strong>{{client.raison_sociale}}</strong></p>
  </div>

  

  <section class="blk">
    <h2 class="sec">1. Portée du mandat</h2>
    {{section.portee}}
  </section>

  <section class="blk pg">
    <h2 class="sec">2. Livrables et révisions incluses</h2>
    <table class="tab">
      <thead>
        <tr>
          <th style="white-space:nowrap;width:61px;font-size:12px;">N<sup>o</sup></th>
          <th style="width:22%;">Livrable</th>
          <th>Description détaillée</th>
          <th style="white-space:nowrap;">Révisions<br>incluses</th>
        </tr>
      </thead>
      <tbody>{{#livrables}}<tr><td><strong>{{livrable.code}}</strong></td><td>{{livrable.titre}}</td><td>{{livrable.description}}</td><td>{{livrable.rondes}}</td></tr>{{/livrables}}</tbody>
    </table>

    <h3 class="sub">2.1 Rondes de révision additionnelles</h3>
    <p style="margin:0 0 10px;">Une « ronde de révision » désigne un ensemble de commentaires consolidés transmis en une seule fois par le Client sur un livrable donné.</p>
    <p style="margin:0;">Toute ronde au-delà du nombre inclus ci-dessus est facturée au taux de {{contrat.taux_horaire}} $/h CAD (+ taxes), sur estimation préalable approuvée par écrit par le Client. Les commentaires transmis de façon fragmentée après la clôture d’une ronde sont considérés comme une nouvelle ronde.</p>

    <h3 class="sub">2.2 Acceptation des livrables</h3>
    <p style="margin:0;">Conformément à l’article 4.3 du contrat, le Client dispose de 5 jours ouvrables pour transmettre ses commentaires sur un livrable soumis à approbation. En l’absence de retour dans ce délai, le livrable est réputé accepté et le projet passe au jalon suivant. Cette disposition vise à éviter l’immobilisation du mandat ; le Prestataire s’engage à transmettre un rappel avant l’échéance.</p>
  </section>

  <section class="blk">
    <h2 class="sec">3. Modalités de l’accompagnement post-lancement (L-11)</h2>
    <p style="margin:0 0 10px;"><strong>3.1</strong>&nbsp; Les heures d’accompagnement (4 à 6 h/mois pendant 3 mois) couvrent le support technique, les ajustements mineurs et les conseils SEO de base.</p>
    <p style="margin:0 0 10px;"><strong>3.2</strong>&nbsp; Les correctifs de bogues ou d’anomalies attribuables au travail du Prestataire ne sont pas décomptés de ces heures. Ils relèvent de la garantie prévue à l’article 10 du contrat (30 jours suivant la livraison finale) et sont effectués sans frais.</p>
    <p style="margin:0 0 10px;"><strong>3.3</strong>&nbsp; Les heures non utilisées au cours d’un mois ne sont ni cumulables ni reportables sur le mois suivant, et ne donnent lieu à aucun remboursement.</p>
    <p style="margin:0 0 10px;"><strong>3.4</strong>&nbsp; Les demandes dépassant le forfait mensuel sont facturées au taux de {{contrat.taux_horaire}} $/h (+ taxes), sur approbation préalable du Client.</p>
    <p style="margin:0;"><strong>3.5</strong>&nbsp; Au terme des 3 mois, l’accompagnement prend fin. La maintenance continue est disponible séparément (voir section 6, Exclusions).</p>
  </section>

  <section class="blk pg">
    <h2 class="sec">4. Jalons et échéancier prévisionnel</h2>
    <p style="margin:0 0 14px;">Le projet débutera {{contrat.date_debut}}, après signature du contrat et réception de l’acompte. Les dates ci-dessous sont prévisionnelles et seront confirmées lors de la rencontre de démarrage.</p>
    <table class="tab">
      <thead>
        <tr>
          <th style="white-space:nowrap;">Jalon</th>
          <th>Description</th>
          <th style="white-space:nowrap;">Responsable</th>
          <th style="width:24%;">Date prévisionnelle</th>
        </tr>
      </thead>
      <tbody>{{#jalons}}<tr><td><strong>{{jalon.code}}</strong></td><td>{{jalon.titre}}</td><td>{{jalon.responsable}}</td><td>{{jalon.date}}</td></tr>{{/jalons}}</tbody>
    </table>
    <div style="margin-top:16px;padding:14px 18px;background:#F4F6F9;border:1px solid #D9DDE4;border-radius:4px;font-size:14.5px;break-inside:avoid;">
      <p style="margin:0 0 8px;"><strong>Note sur l’ordre J-08 → J-10 :</strong> conformément à l’article 8.2 du contrat, la cession des droits et la mise en ligne définitive n’interviennent qu’après réception du paiement intégral. La facturation du solde est donc déclenchée dès l’approbation finale du Client (J-07), et la mise en ligne suit la réception du paiement. Le Client est avisé de cette séquence dès la signature afin de planifier le versement en conséquence.</p>
      <p style="margin:0 0 8px;"><strong>Retards :</strong> tout retard attribuable au Client (contenu manquant, approbations tardives, changements de direction) reporte d’autant les jalons suivants, sans pénalité pour le Prestataire, conformément à l’article 5.2 du contrat.</p>
      <p style="margin:0;"><strong>Date butoir sur le contenu :</strong> si le contenu brut prévu au jalon J-03 n’est pas reçu dans les 60 jours suivant J-01, le Prestataire peut suspendre le mandat et réviser l’échéancier ainsi que les honoraires, sur avis écrit au Client. L’acompte demeure acquis conformément à l’article 7.1.</p>
    </div>
  </section>

  <section class="blk pg">
    <h2 class="sec">5. Contenu à fournir par le Client</h2>
    <p style="margin:0 0 14px;">Le Client s’engage à fournir les éléments suivants au plus tard au jalon J-03, sauf entente contraire écrite :</p>
    <table class="tab">
      <thead>
        <tr>
          <th style="width:24%;">Élément à fournir</th>
          <th style="width:36%;">Format attendu</th>
          <th>Remarques</th>
        </tr>
      </thead>
      <tbody>{{#attendus_client}}<tr><td>{{attendu.texte}}</td><td>{{attendu.format}}</td><td>{{attendu.note}}</td></tr>{{/attendus_client}}</tbody>
    </table>

    <h3 class="sub">5.1 Personne-contact unique</h3>
    <p style="margin:0 0 10px;">Conformément à l’article 4.1 du contrat, le Client désigne {{client.contact.nom}}, {{client.contact.titre}} comme personne-contact unique autorisée à approuver les livrables et à prendre les décisions relatives au Mandat.</p>
    <p style="margin:0 0 10px;">Les approbations transmises par cette personne engagent le Client. Le Prestataire n’est pas tenu d’attendre une résolution du conseil d’administration pour poursuivre les travaux, sauf mention écrite contraire convenue à l’avance.</p>
    <p style="margin:0;">Tout changement de personne-contact doit être communiqué par écrit au Prestataire.</p>
  </section>

  <section class="blk pg">
    <h2 class="sec">6. Exclusions explicites</h2>
    <p style="margin:0 0 14px;">Les éléments suivants ne font pas partie du présent mandat et feront l’objet d’une offre de service distincte si le Client souhaite les ajouter ultérieurement :</p>
    <table class="tab">
      <thead>
        <tr>
          <th style="width:34%;">Élément exclu</th>
          <th>Précision</th>
        </tr>
      </thead>
      <tbody>{{#exclusions}}<tr><td>{{exclusion.texte}}</td><td>{{exclusion.detail}}</td></tr>{{/exclusions}}</tbody>
    </table>
  </section>

  <section class="blk" style="break-inside:avoid;">
    <p style="margin:0;font-size:15px;color:#3A3B3C;">L’Annexe A fait partie intégrante du Contrat de services professionnels n<sup>o</sup> {{contrat.reference}} entre {{agence.nom}} et {{client.raison_sociale}}. En cas de conflit entre la présente Annexe et le corps du contrat, le corps du contrat prévaut.</p>
  </section>

</div>
$gabarit$
 where id = '33330000-0000-0000-0000-000000000005' and body_html is null;
insert into public.document_template_section
  (template_id, key, title, position, default_body, optional, ai_assist, locked_by_agency, max_chars)
values ('33330000-0000-0000-0000-000000000005', 'portee', 'Portée du mandat', 1, '<p style="margin:0 0 10px;">Le présent mandat couvre la conception, le développement et la mise en ligne d’un site web professionnel pour {{client.raison_sociale}}, développé sur la plateforme Webflow. Le site sera sobre, administrable de façon autonome par le Client, et adapté à un public pouvant inclure des personnes moins à l’aise avec la navigation web.</p>
    <p style="margin:0 0 10px;">Le site est conçu selon les bonnes pratiques d’accessibilité web (contrastes suffisants, navigation au clavier, textes alternatifs sur les images, structure sémantique des titres). Le présent mandat n’inclut pas d’audit d’accessibilité formel ni de certification de conformité WCAG 2.1 (niveau A, AA ou AAA).</p>
    <p style="margin:0;">La portée est volontairement structurée pour répondre aux besoins prioritaires de l’organisme sans alourdir le projet. Tout élément ne figurant pas explicitement dans la présente Annexe est considéré hors portée et fait l’objet d’un avenant écrit, conformément à l’article 2.2 du contrat.</p>',
        false, true, false, 1500)
on conflict (template_id, key) do nothing;

-- ── Devis (devis) ──
update public.document_template
   set prefix = coalesce(prefix, 'DV'),
       payment_instructions = coalesce(payment_instructions, 'Paiement à la commande ou selon les modalités convenues. Virement bancaire ou Interac.')
 where id = '33330000-0000-0000-0000-000000000001';
update public.document_template
   set body_html = $gabarit$<style>
.cdoc{padding:40px 46px;font-family:Georgia,'Times New Roman',serif;color:#18181B;font-size:13px;line-height:1.6;max-width:760px;margin:0 auto}
.cdoc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:24px;padding-bottom:14px;border-bottom:2px solid #18181B}
.cdoc-agence{font-size:11px;color:#52525B;line-height:1.5;text-align:right}
.cdoc-title{font-size:20px;font-weight:700;margin-bottom:2px}
.cdoc-ref{font-size:11px;color:#71717A}
.cdoc-section-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:20px 0 7px;color:#3F3F46}
.cdoc-p{margin-bottom:11px}
table.cdoc-table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}
.cdoc-table th{text-align:left;padding:7px 6px;border-bottom:2px solid #18181B;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
.cdoc-table td{padding:7px 6px;border-bottom:1px solid #E4E4E7}
.cdoc-table td.num,.cdoc-table th.num{text-align:right}
.cdoc-totals{margin-left:auto;width:240px;font-size:12px}
.cdoc-totals-row{display:flex;justify-content:space-between;padding:3px 0}
.cdoc-totals-row.ttc{font-weight:700;font-size:14px;border-top:2px solid #18181B;padding-top:7px;margin-top:3px}
.cdoc-list{padding-left:18px;margin-bottom:11px}
.cdoc-list li{margin-bottom:5px}
.cdoc-sign{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:36px;padding-top:20px;border-top:1px solid #E4E4E7}
.cdoc-sign-line{border-top:1px solid #18181B;margin-top:36px;padding-top:5px;font-size:11px;color:#52525B}
.cdoc-foot{margin-top:28px;padding-top:14px;border-top:1px solid #E4E4E7;font-size:10px;color:#A1A1AA;line-height:1.6}
</style>
<div class="cdoc">
<div class="cdoc-head">
  <div><div class="cdoc-title">Devis</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div>
  <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px">{{agence.nom}}</div>{{agence.adresse}}<br>TPS {{agence.tps}} · TVQ {{agence.tvq}}</div>
</div>
<div class="cdoc-p">Préparé pour <b>{{client.raison_sociale}}</b>, à l’attention de {{client.contact.nom}}.</div>
{{#document.introduction}}<div class="cdoc-p">{{document.introduction}}</div>{{/document.introduction}}
<div class="cdoc-section-t">Objet</div>
<div class="cdoc-p">{{document.objet}}</div>
<div class="cdoc-section-t">Détail</div>
<table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead>
<tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.quantite}}</td><td class="num">{{ligne.prix}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>
<div class="cdoc-totals"><div class="cdoc-totals-row"><span>Sous-total</span><span>{{total.ht}}</span></div><div class="cdoc-totals-row"><span>TPS (5 %)</span><span>{{total.tps}}</span></div><div class="cdoc-totals-row"><span>TVQ (9,975 %)</span><span>{{total.tvq}}</span></div><div class="cdoc-totals-row ttc"><span>Total</span><span>{{total.ttc}}</span></div></div>
<div class="cdoc-p">Ce devis est valide jusqu’au {{document.echeance}}. {{document.paiement}}</div>
<div class="cdoc-sign"><div><div class="cdoc-sign-line">Pour {{agence.nom}} — {{agence.representant}}</div></div><div><div class="cdoc-sign-line">Pour {{client.nom}} — {{client.contact.nom}}, {{client.contact.titre}}</div></div></div>
<div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>
</div>
$gabarit$
 where id = '33330000-0000-0000-0000-000000000001' and body_html is null;

-- ── Facture (facture) ──
update public.document_template
   set prefix = coalesce(prefix, 'FA'),
       payment_instructions = coalesce(payment_instructions, 'Paiement dû dans les 15 jours suivant réception. Virement bancaire ou Interac.')
 where id = '33330000-0000-0000-0000-000000000002';
update public.document_template
   set body_html = $gabarit$<style>
.cdoc{padding:40px 46px;font-family:Georgia,'Times New Roman',serif;color:#18181B;font-size:13px;line-height:1.6;max-width:760px;margin:0 auto}
.cdoc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:24px;padding-bottom:14px;border-bottom:2px solid #18181B}
.cdoc-agence{font-size:11px;color:#52525B;line-height:1.5;text-align:right}
.cdoc-title{font-size:20px;font-weight:700;margin-bottom:2px}
.cdoc-ref{font-size:11px;color:#71717A}
.cdoc-section-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:20px 0 7px;color:#3F3F46}
.cdoc-p{margin-bottom:11px}
table.cdoc-table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}
.cdoc-table th{text-align:left;padding:7px 6px;border-bottom:2px solid #18181B;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
.cdoc-table td{padding:7px 6px;border-bottom:1px solid #E4E4E7}
.cdoc-table td.num,.cdoc-table th.num{text-align:right}
.cdoc-totals{margin-left:auto;width:240px;font-size:12px}
.cdoc-totals-row{display:flex;justify-content:space-between;padding:3px 0}
.cdoc-totals-row.ttc{font-weight:700;font-size:14px;border-top:2px solid #18181B;padding-top:7px;margin-top:3px}
.cdoc-list{padding-left:18px;margin-bottom:11px}
.cdoc-list li{margin-bottom:5px}
.cdoc-sign{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:36px;padding-top:20px;border-top:1px solid #E4E4E7}
.cdoc-sign-line{border-top:1px solid #18181B;margin-top:36px;padding-top:5px;font-size:11px;color:#52525B}
.cdoc-foot{margin-top:28px;padding-top:14px;border-top:1px solid #E4E4E7;font-size:10px;color:#A1A1AA;line-height:1.6}
</style>
<div class="cdoc">
<div class="cdoc-head">
  <div><div class="cdoc-title">Facture</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div>
  <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px">{{agence.nom}}</div>{{agence.adresse}}<br>TPS {{agence.tps}} · TVQ {{agence.tvq}}</div>
</div>
<div class="cdoc-p">Facturé à <b>{{client.raison_sociale}}</b><br>{{client.adresse}}<br>À l’attention de {{client.contact.nom}}</div>
<div class="cdoc-section-t">Détail</div>
<table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead>
<tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.quantite}}</td><td class="num">{{ligne.prix}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>
<div class="cdoc-totals"><div class="cdoc-totals-row"><span>Sous-total</span><span>{{total.ht}}</span></div><div class="cdoc-totals-row"><span>TPS (5 %)</span><span>{{total.tps}}</span></div><div class="cdoc-totals-row"><span>TVQ (9,975 %)</span><span>{{total.tvq}}</span></div><div class="cdoc-totals-row ttc"><span>Total dû</span><span>{{total.ttc}}</span></div></div>
<div class="cdoc-p">Échéance de paiement : <b>{{document.echeance}}</b>. {{document.paiement}}</div>
<div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>
</div>
$gabarit$
 where id = '33330000-0000-0000-0000-000000000002' and body_html is null;
