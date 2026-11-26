'use client';
import { motion } from 'framer-motion';

const ROTULOS = ['Módulos & APF', 'Equipe & IA', 'Tokens & Impostos'];

export function Stepper({ etapa, total, onIr }: { etapa: number; total: number; onIr: (n: number) => void }) {
  return (
    <ol className="relative mb-6 flex justify-between px-2 sm:px-6" aria-label="Etapas do orçamento">
      {/* Trilho + barra de progresso com mola */}
      <div className="absolute left-10 right-10 top-[18px] h-[3px] rounded-full bg-line sm:left-14 sm:right-14" aria-hidden>
        <motion.div
          className="h-full rounded-full bg-success"
          initial={false}
          animate={{ width: `${((etapa - 1) / (total - 1)) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
        />
      </div>
      {ROTULOS.map((rotulo, i) => {
        const n = i + 1;
        const concluida = n < etapa;
        const atual = n === etapa;
        return (
          <li key={rotulo} className="relative z-10">
            <motion.button
              type="button"
              onClick={() => onIr(n)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.92 }}
              aria-current={atual ? 'step' : undefined}
              className="flex flex-col items-center gap-1.5"
            >
              <motion.span
                className="grid size-9 place-items-center rounded-full text-sm font-bold text-white"
                initial={false}
                animate={{
                  backgroundColor: concluida || atual ? 'var(--success)' : 'var(--accent)',
                  scale: atual ? 1.12 : 1,
                  boxShadow: atual ? '0 0 0 6px color-mix(in srgb, var(--success) 22%, transparent)' : '0 0 0 0px transparent',
                }}
              >
                {concluida ? (
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
                  </svg>
                ) : n}
              </motion.span>
              <span className={`text-[11px] font-semibold sm:text-xs ${atual ? 'text-fg' : 'text-muted'}`}>{rotulo}</span>
            </motion.button>
          </li>
        );
      })}
    </ol>
  );
}
