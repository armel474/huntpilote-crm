import type { Metadata, Viewport } from 'next';
import { ThemeProvider, themeInitScript } from '@/components/shell/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'HuntPilote — CRM SEO',
  description:
    "Cockpit de livraison client pour agence web et SEO : diagnostics, priorités, tâches, rapports et suivi commercial.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Le contenu passe sous les encoches ; les zones sûres sont gérées en CSS.
  viewportFit: 'cover',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Applique le thème stocké avant le premier paint pour éviter le flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
