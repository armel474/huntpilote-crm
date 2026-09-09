/**
 * Jeu d'icônes HuntPilote — trait 2px, viewBox 24×24, `currentColor`.
 * Chaque icône accepte `size` pour surcharger la taille par défaut de la maquette.
 */
import type { SVGProps } from 'react';

export type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>;

/** Base commune : trait arrondi, sans remplissage, hérite de la couleur du texte. */
function Svg({ size = 12, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── Navigation ── */
export const IcoDash = (p: IconProps) => (
  <Svg size={14} {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Svg>
);

export const IcoUsers = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </Svg>
);

export const IcoPipe = (p: IconProps) => (
  <Svg size={14} {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Svg>
);

export const IcoZap = (p: IconProps) => (
  <Svg size={13} {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

export const IcoTool = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </Svg>
);

export const IcoCog = (p: IconProps) => (
  <Svg size={14} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
  </Svg>
);

export const IcoBell = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </Svg>
);

export const IcoSrch = (p: IconProps) => (
  <Svg size={12} {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const IcoSun = (p: IconProps) => (
  <Svg size={13} {...p}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Svg>
);

export const IcoMoon = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);

/* ── Contenu ── */
export const IcoMail = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Svg>
);

export const IcoPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.21 2 2 0 012 0h3a2 2 0 012 1.72c.167.96.391 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.309 1.85.533 2.81.7A2 2 0 0122 14.92v2z" />
  </Svg>
);

export const IcoGlobe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </Svg>
);

export const IcoPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const IcoUser = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const IcoCal = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

export const IcoCheck = (p: IconProps) => (
  <Svg size={11} strokeWidth={2.5} {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const IcoUp = (p: IconProps) => (
  <Svg size={9} strokeWidth={2.5} {...p}>
    <polyline points="18 15 12 9 6 15" />
  </Svg>
);

export const IcoDown = (p: IconProps) => (
  <Svg size={9} strokeWidth={2.5} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const IcoPlus = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const IcoLink = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </Svg>
);

export const IcoDoc = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Svg>
);

export const IcoFile = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Svg>
);

export const IcoMore = (p: IconProps) => (
  <Svg size={14} {...p}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Svg>
);

export const IcoChevD = (p: IconProps) => (
  <Svg size={10} strokeWidth={2.5} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const IcoChevU = (p: IconProps) => (
  <Svg size={10} strokeWidth={2.5} {...p}>
    <polyline points="18 15 12 9 6 15" />
  </Svg>
);

export const IcoChevR = (p: IconProps) => (
  <Svg size={11} strokeWidth={2.5} {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const IcoChevL = (p: IconProps) => (
  <Svg size={11} strokeWidth={2.5} {...p}>
    <polyline points="15 18 9 12 15 6" />
  </Svg>
);

export const IcoWarn = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const IcoSpin = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </Svg>
);

export const IcoDl = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Svg>
);

export const IcoSend = (p: IconProps) => (
  <Svg {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Svg>
);

export const IcoEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IcoCard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </Svg>
);

export const IcoRepeat = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </Svg>
);

export const IcoTarget = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Svg>
);

export const IcoTrend = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Svg>
);

export const IcoX = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const IcoGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Svg>
);

export const IcoList = (p: IconProps) => (
  <Svg {...p}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </Svg>
);

export const IcoFilter = (p: IconProps) => (
  <Svg {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Svg>
);

export const IcoClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

/* ── Écrans de détail (priorité, tâche, audit) ── */

export const IcoEyeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

/** Base de données — marque une source de mesure. */
export const IcoDb = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </Svg>
);

export const IcoTask = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </Svg>
);

/** Trophée — preuve de valeur. */
export const IcoTrophy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0012 0V2z" />
  </Svg>
);

export const IcoArrowR = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Svg>
);

export const IcoArrowL = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Svg>
);

export const IcoPen = (p: IconProps) => (
  <Svg size={11} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

/** Lien sortant. */
export const IcoExt = (p: IconProps) => (
  <Svg size={11} {...p}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Svg>
);

/** Trombone — pièce jointe. */
export const IcoClip = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </Svg>
);

export const IcoPlay = ({ size = 11, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <polygon points="6 3 20 12 6 21" />
  </svg>
);

export const IcoPause = ({ size = 11, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

/** Cadenas — publication verrouillée, lien révoqué. */
export const IcoLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </Svg>
);

/* ── Audit ── */

/** Prise électrique — état d'une connexion à une source de données. */
export const IcoPlug = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 22v-5" />
    <path d="M9 8V2M15 8V2" />
    <path d="M18 8v3a6 6 0 01-12 0V8z" />
  </Svg>
);

/** Deux barres inégales — comparaison. */
export const IcoCompare = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="7" height="16" rx="1" />
    <rect x="14" y="4" width="7" height="10" rx="1" />
  </Svg>
);

/* ── Cadre des outils ── */

/** Disquette — enregistrer dans la fiche. */
export const IcoSave = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Svg>
);

/** Appareil photo — instantané non historisé (prospect). */
export const IcoSnap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </Svg>
);

/** Pièce — coût facturé par le fournisseur de données. */
export const IcoCoin = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9.5A3 3 0 0012 8h-1a2 2 0 000 4h2a2 2 0 010 4h-1a3 3 0 01-3-1.5" />
  </Svg>
);

export const IcoInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="11" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

/* ── Site Audit (familles de constats) ── */

export const IcoIndex = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </Svg>
);

/** Constat en anomalie — famille « Erreurs ». */
export const IcoAlert = (p: IconProps) => (
  <Svg size={13} {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
);

/** Bloc de texte — famille « On-page ». */
export const IcoType = (p: IconProps) => (
  <Svg size={13} {...p}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </Svg>
);

/** Compteur — famille « Performance ». */
export const IcoGauge = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M3.5 18a9 9 0 1117 0" />
    <line x1="12" y1="14" x2="16" y2="9.5" />
  </Svg>
);

/** Arborescence de pages — famille « Structure ». */
export const IcoSitemap = (p: IconProps) => (
  <Svg size={13} {...p}>
    <rect x="9" y="2" width="6" height="5" rx="1" />
    <rect x="2" y="17" width="6" height="5" rx="1" />
    <rect x="16" y="17" width="6" height="5" rx="1" />
    <path d="M12 7v4M5 17v-3h14v3" />
  </Svg>
);

export const IcoStop = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </Svg>
);

/** Marque HuntPilote — éclair stylisé. */
export const IcoLogo = (p: IconProps) => (
  <Svg size={13} strokeWidth={2.5} {...p}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Svg>
);

/* ── Position Tracking / Backlink Analyse / Keyword Hunter / Keyword Gap ── */

/** Trait plat — variation stable, ni hausse ni baisse. */
export const IcoFlat = (p: IconProps) => (
  <Svg size={11} strokeWidth={2.4} {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

/** Embranchement — cannibalisation, deux URL sur la même requête. */
export const IcoFork = (p: IconProps) => (
  <Svg size={12} {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <path d="M6 8.5V12a4 4 0 004 4M18 8.5V12a4 4 0 01-4 4" />
  </Svg>
);

/** Tête de mort — lien toxique ou suspect. */
export const IcoSkull = (p: IconProps) => (
  <Svg size={12} {...p}>
    <circle cx="12" cy="11" r="7" />
    <line x1="9" y1="11" x2="9.01" y2="11" strokeWidth={3} />
    <line x1="15" y1="11" x2="15.01" y2="11" strokeWidth={3} />
    <path d="M10 19l-1 3M14 19l1 3" />
  </Svg>
);

/** Cercle barré — désavouer un lien. */
export const IcoBan = (p: IconProps) => (
  <Svg size={12} {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" />
  </Svg>
);

/** Tendance saisonnière — pic en hiver. */
export const IcoSnow = (p: IconProps) => (
  <Svg size={11} {...p}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="4.9" y1="7" x2="19.1" y2="17" />
    <line x1="4.9" y1="17" x2="19.1" y2="7" />
  </Svg>
);

/** Requête où seul le compte suit — Keyword Gap. */
export const IcoStar = (p: IconProps) => (
  <Svg size={12} {...p}>
    <path d="M12 2l2.4 7.4H22l-6 4.4 2.4 7.4L12 16.8l-6.4 4.4L8 13.8l-6-4.4h7.6z" />
  </Svg>
);

/* ── Domain Overview / Organic Research ── */

/** Bouclier — autorité du domaine. */
export const IcoShield = (p: IconProps) => (
  <Svg size={13} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

/** Carte — répartition géographique du trafic. */
export const IcoMap = (p: IconProps) => (
  <Svg size={13} {...p}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </Svg>
);

/** Personne avec plus — créer un prospect. */
export const IcoUserPlus = (p: IconProps) => (
  <Svg size={12} {...p}>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </Svg>
);
