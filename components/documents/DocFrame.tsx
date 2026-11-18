'use client';

/**
 * Le rendu d'un document dans un cadre isolé, à la hauteur de son contenu.
 *
 * La page vient de `previewDocument` (ou du HTML figé à l'envoi) : elle porte
 * ses styles et le script qui la réduit à la largeur du cadre. Le cadre se
 * mesure après chargement et à chaque redimensionnement — pas de barre de
 * défilement interne, le document se lit comme une page.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export function DocFrame({ html, title, className, minHeight = 480 }: { html: string; title: string; className?: string; minHeight?: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  const measure = useCallback(() => {
    const doc = ref.current?.contentDocument;
    if (!doc?.documentElement || !doc.body) return;
    // La hauteur du corps, pas celle du cadre : `scrollHeight` ne descend jamais sous la fenêtre, et le cadre ne ferait que grandir.
    const rect = doc.body.getBoundingClientRect();
    const zoom = Number(doc.documentElement.style.zoom || '1') || 1;
    const inner = rect.height > 0 ? rect.top + rect.height : doc.documentElement.scrollHeight * zoom;
    const next = Math.max(minHeight, Math.ceil(inner) + 8);
    setHeight((h) => (Math.abs(h - next) > 2 ? next : h));
  }, [minHeight]);

  useEffect(() => {
    // Le script de mise à l'échelle tourne après le chargement : on remesure un peu après.
    const timers = [120, 400, 1000].map((ms) => window.setTimeout(measure, ms));
    window.addEventListener('resize', measure);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('resize', measure);
    };
  }, [html, measure]);

  return (
    <iframe
      ref={ref}
      className={className}
      title={title}
      srcDoc={html}
      sandbox="allow-same-origin allow-scripts"
      onLoad={measure}
      style={{ height, width: '100%', border: 0, display: 'block', background: '#fff', borderRadius: 10 }}
    />
  );
}

/** Ouvre le document dans un nouvel onglet — et lance l'impression si on le demande. */
export function openDocumentWindow(html: string, print: boolean) {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  if (print) {
    w.addEventListener('load', () => w.print());
    window.setTimeout(() => w.print(), 600);
  }
  return true;
}
