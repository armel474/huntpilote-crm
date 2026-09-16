/**
 * L'aperçu d'un modèle rempli : le document HTML complet qu'on montre dans
 * un cadre isolé (une `<iframe>`) ou qu'on ouvre pour l'impression. Le corps
 * du modèle porte ses propres styles ; ce fichier n'ajoute que le socle —
 * la page Lettre, le fond blanc, et les classes `.cdoc-*` des modèles
 * simples (devis, facture).
 */
import { renderTemplate, type DocData } from '@/lib/documents/balises';

/** Le socle des modèles simples : la mise en page `.cdoc` des maquettes 9.3. */
export const CDOC_CSS = `
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
`;

const BASE_CSS = `
html,body{margin:0;padding:0;background:#fff;color:#18181B}
body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
@page{size:Letter;margin:0}
mark.cdoc-unfilled{background:#FEF3C7;color:#92400E;border:1px dashed #D97706;border-radius:3px;padding:0 3px;font-family:ui-monospace,monospace;font-size:.85em}
img[src=""]{display:none!important}
${CDOC_CSS}`;

export type PreviewOptions = {
  /** Souligner les balises restées sans valeur — dans l'éditeur, pas à l'impression. */
  highlightUnfilled?: boolean;
  /** Réduire la page pour qu'elle tienne dans la largeur du cadre — dans l'éditeur, pas à l'impression. */
  fit?: boolean;
  title?: string;
};

/** Une page Lettre fait 216 mm ; dans une colonne de 400 px, on la réduit plutôt que de la faire défiler. */
const FIT_SCRIPT = `<script>(function(){
var h=document.documentElement;
function over(){var w=window.innerWidth,els=document.body.getElementsByTagName('*');
  for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();if(r.width&&(r.left<-0.5||r.right>w+0.5))return true;}
  return h.scrollWidth>h.clientWidth+0.5;}
function fit(){h.style.zoom='1';var z=Math.min(1,window.innerWidth/h.scrollWidth);h.style.zoom=String(z);
  for(var n=0;n<40&&over();n++){z*=0.97;h.style.zoom=String(z);}}
fit();window.addEventListener('resize',fit);
})();</script>`;

/** Remplit le corps et l'entoure d'une page complète. */
export function previewDocument(bodyHtml: string, data: DocData, { highlightUnfilled = true, fit = false, title = 'Aperçu' }: PreviewOptions = {}): string {
  let rendered = renderTemplate(bodyHtml, data);
  if (highlightUnfilled) {
    // Seulement dans le texte : une balise restée dans un attribut (`src="{{agence.logo}}"`) ne se souligne pas.
    rendered = rendered.replace(/(<[^>]*>)|\{\{([a-z][a-z0-9_.]*)\}\}/g, (m, tag: string | undefined) => (tag ? tag : `<mark class="cdoc-unfilled">${m}</mark>`));
  }
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}</style>
</head>
<body>
${rendered}
${fit ? FIT_SCRIPT : ''}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}
