'use client';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTema } from '@/components/providers/ThemeProvider';

const LINKS = [
  { href: '/', rotulo: 'Calculadora' },
  { href: '/dashboard/', rotulo: 'Dashboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const { tema, alternar } = useTema();
  const ativo = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, '')));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex flex-col leading-none" aria-label="Motor de Orçamento, início">
          <span className="text-xl font-extrabold tracking-tight text-accent">
            bit
            <motion.span
              className="inline-block text-amber"
              whileHover={{ rotate: [0, -14, 10, -6, 0], scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >⚡</motion.span>
            ar
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">solutions</span>
        </Link>

        <nav aria-label="Telas" className="order-3 flex w-full rounded-xl border border-line bg-field p-1 sm:order-none sm:w-auto">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo(l.href) ? 'page' : undefined}
              className={`relative flex-1 rounded-lg px-4 py-1.5 text-center text-sm font-semibold transition-colors sm:flex-none ${ativo(l.href) ? 'text-white' : 'text-muted hover:text-fg'}`}
            >
              {/* A "pílula" desliza entre as abas graças ao layoutId compartilhado */}
              {ativo(l.href) && (
                <motion.span
                  layoutId="nav-pilula"
                  className="absolute inset-0 rounded-lg bg-accent shadow-md shadow-accent/30"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{l.rotulo}</span>
            </Link>
          ))}
        </nav>

        <motion.button
          type="button"
          onClick={alternar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="flex h-9 items-center gap-2 overflow-hidden rounded-full border border-line bg-field px-3 text-sm text-fg"
          aria-label={tema === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tema}
              initial={{ y: -16, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 16, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {tema === 'dark' ? '🌙' : '☀️'}
            </motion.span>
          </AnimatePresence>
          <span className="hidden sm:inline">{tema === 'dark' ? 'Modo escuro' : 'Modo claro'}</span>
        </motion.button>
      </div>
    </header>
  );
}
