import { NavSidebar } from '@/components/shell/NavSidebar';

/**
 * Coquille persistante du CRM : sidebar de navigation à gauche,
 * puis header contextuel + contenu de la page dans la colonne principale.
 */
export function AppShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <NavSidebar />
      <div className="main">
        {header}
        {children}
      </div>
    </div>
  );
}
