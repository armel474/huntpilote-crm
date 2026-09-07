'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'huntpilote-theme';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Script injecté avant l'hydratation pour appliquer le thème stocké
 * dès le premier paint — sinon un flash de thème clair apparaît au chargement.
 */
export const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (t !== 'dark' && t !== 'light') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Le rendu serveur part de 'light' ; le script ci-dessus a déjà posé
  // le bon attribut sur <html>, et cet effet resynchronise l'état React.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark' || current === 'light') setTheme(current);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;

      // Les transitions de couleur ne sont actives que pendant la bascule,
      // pour ne pas interférer avec les autres animations de l'interface.
      root.setAttribute('data-theme-switching', '');
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* stockage indisponible (navigation privée) : la bascule reste effective */
      }
      window.setTimeout(() => root.removeAttribute('data-theme-switching'), 500);

      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans un <ThemeProvider>');
  return ctx;
}
