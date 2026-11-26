'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Tema = 'dark' | 'light';
const ThemeContext = createContext<{ tema: Tema; alternar: () => void }>({ tema: 'dark', alternar: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('dark');

  // O script do layout já aplicou a classe; aqui só sincronizamos o estado
  useEffect(() => {
    setTema(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const alternar = useCallback(() => {
    const raiz = document.documentElement;
    const novo: Tema = raiz.classList.contains('dark') ? 'light' : 'dark';
    raiz.classList.add('no-transition');
    raiz.classList.toggle('dark', novo === 'dark');
    requestAnimationFrame(() => raiz.classList.remove('no-transition'));
    try { localStorage.setItem('motor-orcamento:tema', novo); } catch { /* ignora */ }
    setTema(novo);
  }, []);

  return <ThemeContext.Provider value={{ tema, alternar }}>{children}</ThemeContext.Provider>;
}

export const useTema = () => useContext(ThemeContext);
