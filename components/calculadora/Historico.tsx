'use client';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useState } from 'react';
import { useHistorico } from '@/hooks/useHistorico';
import { historicoStore } from '@/lib/historico';
import { formatarData, formatarMoeda } from '@/lib/formatar';
import type { Proposta } from '@/lib/orcamento';
import { useToast } from '@/components/providers/ToastProvider';
import { MotionButton } from '@/components/ui/MotionButton';
import { Modal } from '@/components/ui/Modal';

const LIMIAR_EXCLUIR = -110;

// Item com gesto: arraste para a esquerda para excluir (com feedback visual progressivo)
function ItemHistorico({ proposta, onAbrir, onExcluir }: { proposta: Proposta; onAbrir: () => void; onExcluir: () => void }) {
  const x = useMotionValue(0);
  const opacidadeFundo = useTransform(x, [0, LIMIAR_EXCLUIR], [0, 1]);
  const escalaIcone = useTransform(x, [-30, LIMIAR_EXCLUIR], [0.6, 1.15]);

  const aoSoltar = (_: unknown, info: PanInfo) => {
    if (info.offset.x < LIMIAR_EXCLUIR || info.velocity.x < -600) onExcluir();
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -260, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
      className="relative overflow-hidden rounded-lg"
    >
      <motion.div style={{ opacity: opacidadeFundo }} className="absolute inset-0 flex items-center justify-end rounded-lg bg-danger/90 pr-4 text-white" aria-hidden>
        <motion.span style={{ scale: escalaIcone }} className="text-sm font-semibold">🗑 Excluir</motion.span>
      </motion.div>
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.7, right: 0.05 }}
        onDragEnd={aoSoltar}
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        className="relative flex cursor-grab touch-pan-y items-center justify-between gap-2 rounded-lg border border-line bg-field px-3 py-2"
      >
        <div className="min-w-0">
          <strong className="block truncate text-[13px]">{proposta.entrada.cliente} — {proposta.entrada.projeto}</strong>
          <span className="text-[11px] text-muted">{formatarData(proposta.dataCriacao)} · {formatarMoeda(proposta.precoFinal, proposta.entrada.moeda)}</span>
        </div>
        <div className="flex shrink-0 gap-1">
          <MotionButton tamanho="sm" variante="ghost" className="!h-7 text-accent" onClick={onAbrir}>Abrir</MotionButton>
          <MotionButton tamanho="sm" variante="ghost" className="!h-7 !px-2 text-danger" onClick={onExcluir} aria-label={`Excluir ${proposta.entrada.cliente}`}>✕</MotionButton>
        </div>
      </motion.div>
    </motion.li>
  );
}

export function Historico({ onAbrir }: { onAbrir: (p: Proposta) => void }) {
  const historico = useHistorico();
  const toast = useToast();
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  const excluir = (p: Proposta) => {
    const indice = historico.findIndex(x => x.id === p.id);
    historicoStore.remover(p.id);
    toast('Orçamento removido.', 'info', { rotulo: 'Desfazer', onClick: () => historicoStore.restaurar(p, indice) });
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4" aria-label="Histórico de orçamentos">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">📚 Histórico ({historico.length})</h3>
        {historico.length > 0 && (
          <MotionButton variante="ghost" tamanho="sm" className="!h-7 text-danger" onClick={() => setConfirmarLimpeza(true)}>Limpar tudo</MotionButton>
        )}
      </div>

      {historico.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted">Nenhum orçamento salvo. Use 💾 Salvar para alimentar o Dashboard.</p>
      ) : (
        <>
          <ul className="scroll-fino flex max-h-64 flex-col gap-1.5 overflow-y-auto overflow-x-hidden">
            <AnimatePresence initial={false}>
              {historico.map(p => <ItemHistorico key={p.id} proposta={p} onAbrir={() => onAbrir(p)} onExcluir={() => excluir(p)} />)}
            </AnimatePresence>
          </ul>
          <p className="mt-2 text-center text-[11px] text-muted">Dica: arraste um item para a esquerda para excluir.</p>
        </>
      )}

      <Modal
        aberto={confirmarLimpeza}
        onFechar={() => setConfirmarLimpeza(false)}
        titulo="Limpar todo o histórico?"
        descricao={`Os ${historico.length} orçamentos salvos neste navegador serão apagados e o Dashboard volta a mostrar dados de exemplo.`}
        largura="sm"
        rodape={
          <>
            <MotionButton variante="secondary" onClick={() => setConfirmarLimpeza(false)}>Cancelar</MotionButton>
            <MotionButton variante="danger" onClick={() => { historicoStore.limpar(); setConfirmarLimpeza(false); toast('Histórico apagado.', 'info'); }}>Apagar tudo</MotionButton>
          </>
        }
      >
        <p className="text-sm text-muted">Essa ação não pode ser desfeita.</p>
      </Modal>
    </section>
  );
}
