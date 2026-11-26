'use client';
import { AnimatePresence, motion } from 'framer-motion';
import type { Modulo } from '@/lib/orcamento';
import { itemStagger } from '@/components/motion/Stagger';

export function ModuloCard({ modulo, selecionado, onAlternar }: { modulo: Modulo; selecionado: boolean; onAlternar: () => void }) {
  return (
    // Camada externa: entra em cascata (herda as variantes do grid)
    <motion.div variants={itemStagger}>
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selecionado}
      onClick={onAlternar}
      initial={false}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
      whileTap={{ scale: 0.97 }}
      animate={{
        borderColor: selecionado ? 'var(--accent)' : 'var(--line)',
        backgroundColor: selecionado ? 'color-mix(in srgb, var(--accent) 10%, var(--field))' : 'var(--field)',
      }}
      className="group relative flex w-full items-start gap-3 rounded-xl border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Caixa de seleção com check desenhado */}
      <motion.span
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2"
        animate={{
          borderColor: selecionado ? 'var(--accent)' : 'var(--line)',
          backgroundColor: selecionado ? 'var(--accent)' : 'transparent',
          scale: selecionado ? [1, 1.25, 1] : 1,
        }}
        transition={{ duration: 0.25 }}
      >
        <AnimatePresence>
          {selecionado && (
            <svg viewBox="0 0 24 24" className="size-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: 0.2 }} />
            </svg>
          )}
        </AnimatePresence>
      </motion.span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug text-fg">{modulo.nome}</span>
        <span className="mt-1 flex flex-wrap gap-1.5 font-mono text-[11px] text-muted">
          <span>{modulo.pf} PF</span>·<span>{modulo.horas}h</span>
          {modulo.ia && <span className="rounded bg-accent/15 px-1.5 text-accent">IA</span>}
        </span>
      </span>

      {/* Brilho sutil que acompanha o hover */}
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-accent/40 transition-opacity group-hover:opacity-100" />
    </motion.button>
    </motion.div>
  );
}
