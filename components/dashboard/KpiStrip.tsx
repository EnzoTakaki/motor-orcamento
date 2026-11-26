'use client';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';

export interface Kpi { id: string; rotulo: string; valor: number; formatar: (v: number) => string; detalhe: string }

const CHAVE_ORDEM = 'motor-orcamento:ordem-kpis';

function CartaoKpi({ kpi, indice }: { kpi: Kpi; indice: number }) {
  const controles = useDragControls();
  return (
    <Reorder.Item
      value={kpi.id}
      dragListener={false}
      dragControls={controles}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: indice * 0.05, type: 'spring', stiffness: 260, damping: 24 } }}
      whileHover={{ y: -3, boxShadow: '0 10px 30px -12px rgba(0,0,0,.35)' }}
      whileDrag={{ scale: 1.05, rotate: -1.5, zIndex: 10, boxShadow: '0 22px 40px -12px rgba(0,0,0,.45)' }}
      className="group relative flex min-w-[168px] flex-1 flex-col gap-1 rounded-xl border border-line bg-surface p-4"
    >
      {/* Alça de arraste: só ela inicia o drag, assim o scroll horizontal no celular continua funcionando */}
      <motion.button
        type="button"
        aria-label={`Arrastar o cartão ${kpi.rotulo} para reordenar`}
        onPointerDown={e => controles.start(e)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-2 top-2 grid size-6 cursor-grab touch-none place-items-center rounded text-muted opacity-40 transition-opacity active:cursor-grabbing group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>
      </motion.button>
      <span className="pr-6 text-xs font-semibold text-muted">{kpi.rotulo}</span>
      <AnimatedNumber valor={kpi.valor} formatar={kpi.formatar} className="whitespace-nowrap font-mono text-lg font-medium tabular-nums text-fg" />
      <span className="text-[11px] text-muted">{kpi.detalhe}</span>
    </Reorder.Item>
  );
}

export function KpiStrip({ kpis }: { kpis: Kpi[] }) {
  const [ordem, setOrdem] = useState<string[]>(kpis.map(k => k.id));

  useEffect(() => {
    try {
      const salva = JSON.parse(localStorage.getItem(CHAVE_ORDEM) || 'null');
      if (Array.isArray(salva) && salva.length === kpis.length && salva.every((id: string) => kpis.some(k => k.id === id))) setOrdem(salva);
    } catch { /* ignora */ }
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reordenar = (nova: string[]) => {
    setOrdem(nova);
    try { localStorage.setItem(CHAVE_ORDEM, JSON.stringify(nova)); } catch { /* ignora */ }
  };

  return (
    <Reorder.Group axis="x" values={ordem} onReorder={reordenar} layoutScroll className="scroll-fino -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
      {ordem.map((id, i) => {
        const kpi = kpis.find(k => k.id === id);
        return kpi ? <CartaoKpi key={id} kpi={kpi} indice={i} /> : null;
      })}
    </Reorder.Group>
  );
}
