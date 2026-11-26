import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/motion/PageTransition';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'Motor de Orçamento',
  description: 'Calculadora de projetos de software com APF, IA e dashboard de propostas.',
};

// Aplica o tema antes da hidratação (sem piscar entre claro e escuro)
const scriptTema = `(function(){try{var t=localStorage.getItem('motor-orcamento:tema');var d=t?t==='dark':!window.matchMedia('(prefers-color-scheme: light)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

// Server Component: só estrutura. Tudo que anima fica em Client Components.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}
