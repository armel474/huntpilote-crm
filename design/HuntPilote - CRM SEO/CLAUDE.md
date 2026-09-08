# HuntPilote — règles de design persistantes

- Tout nouvel écran doit livrer automatiquement une version **dark ET light** (variables CSS, bascule `data-theme`, respect de `prefers-color-scheme` par défaut).
- Tout nouvel écran doit être **responsive mobile ET bureau** (layout fluide, breakpoints ≤ 768px, cibles tactiles ≥ 44px).
- Exposer thème et viewport comme Tweaks quand un panneau Tweaks existe.
- La barre latérale de navigation est **rétractable** (dépliée avec libellés ↔ compacte icônes + infobulles) via un bouton « Réduire / Agrandir », état persisté (`huntpilote-sidebar-compact`). Réutiliser `hp-sidebar.jsx` (`<NavSidebar active="…" />`) + `hp-shell.css` ; jamais une barre d’icônes seule.
