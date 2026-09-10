import { NavSidebar } from '@/components/shell/NavSidebar';
import { OverlayProvider } from '@/components/shell/Overlays';

/**
 * Coquille persistante du CRM : sidebar de navigation à gauche,
 * puis header contextuel + contenu de la page dans la colonne principale.
 *
 * Porte aussi les superpositions partagées (recherche globale, notifications
 * — session 4.3) : montées une fois ici, elles couvrent tout écran du
 * cockpit sans que chaque écran ait à les câbler lui-même.
 */
export function AppShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <OverlayProvider>
      <div className="app-shell">
        <NavSidebar />
        <div className="main">
          {header}
          {children}
        </div>
      </div>
    </OverlayProvider>
  );
}
