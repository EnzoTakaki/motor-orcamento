'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { formatarMoeda, formatarNumero } from '@/lib/formatar';
import { SLAS, type Entrada, type Resultado } from '@/lib/orcamento';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';
import { MotionButton } from '@/components/ui/MotionButton';

interface Props {
  entrada: Entrada;
  resultado: Resultado;
  onSalvar: () => void;
  onVisualizar: () => void;
  onCopiarLink: () => void;
  onCopiarJSON: () => void;
}

function Metrica({ rotulo, children, destaque }: { rotulo: string; children: React.ReactNode; destaque?: string }) {
  return (
    <StaggerItem className="rounded-lg border border-line bg-field px-3 py-2.5">
      <span className="block text-[11px] text-muted">{rotulo}</span>
      <strong className={`font-mono text-[15px] font-medium tabular-nums ${destaque ?? 'text-fg'}`}>{children}</strong>
    </StaggerItem>
  );
}

export function ResumoProposta({ entrada, resultado: r, onSalvar, onVisualizar, onCopiarLink, onCopiarJSON }: Props) {
  const m = (v: number) => formatarMoeda(v, entrada.moeda);
  const sla = SLAS.find(s => s.valor === entrada.criticidade);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="overflow-hidden rounded-2xl border border-line bg-surface"
      aria-label="Resumo da proposta"
    >
      <div className="flex items-center gap-1.5 border-b border-line bg-field px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ef4444]" /><span className="size-2.5 rounded-full bg-[#f59e0b]" /><span className="size-2.5 rounded-full bg-[#10b981]" />
        <span className="ml-2 font-mono text-xs text-muted">OUTPUT_PROPOSAL_APF.json</span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-field px-3 py-2">
          <div className="min-w-0"><span className="block text-[10px] font-bold tracking-wider text-muted">CLIENTE</span><strong className="block truncate text-sm">{entrada.cliente || 'Não definido'}</strong></div>
          <div className="min-w-0"><span className="block text-[10px] font-bold tracking-wider text-muted">SISTEMA</span><strong className="block truncate text-sm">{entrada.projeto || 'Novo projeto'}</strong></div>
        </div>

        <div className="rounded-lg border border-line bg-field px-3 py-2">
          <span className="block text-[10px] font-bold tracking-wider text-muted">PONTOS DE FUNÇÃO (APF)</span>
          <AnimatedNumber valor={r.totalPF} formatar={v => `${formatarNumero(v)} PF`} className="font-mono text-lg text-accent" />
          <span className="block text-xs text-muted">{formatarNumero(r.pfHumano, 1)} PF humano · {formatarNumero(r.pfIA, 1)} PF IA</span>
        </div>

        <div className="rounded-lg border border-line bg-field px-3 py-2">
          <span className="block text-[10px] font-bold tracking-wider text-muted">MÓDULOS SELECIONADOS</span>
          {/* Chips entram e saem com mola; layout reorganiza os vizinhos suavemente */}
          <motion.ul layout className="mt-1.5 flex flex-wrap gap-1.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {r.modulos.length === 0 && (
                <motion.li key="vazio" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-muted">Nenhum módulo selecionado</motion.li>
              )}
              {r.modulos.map(mod => (
                <motion.li
                  key={mod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent"
                >
                  {mod.nome}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>

        <StaggerGroup gatilho="montagem" className="grid grid-cols-2 gap-2.5">
          <Metrica rotulo="Horas dev finais">
            <AnimatedNumber valor={r.horasFinais} formatar={v => `${Math.round(v)}h`} />
            {r.horasPoupadasIA > 0 && <span className="ml-1 text-xs text-muted">(−{Math.round(r.horasPoupadasIA)}h IA)</span>}
          </Metrica>
          <Metrica rotulo="Tokens IA / mês" destaque="text-accent"><AnimatedNumber valor={r.tokensMes} formatar={m} /></Metrica>
          <Metrica rotulo="Margem de lucro"><AnimatedNumber valor={r.valorLucro} formatar={m} /></Metrica>
          <Metrica rotulo="Impostos (NF)" destaque="text-danger"><AnimatedNumber valor={r.valorImposto} formatar={m} /></Metrica>
        </StaggerGroup>

        <div className="my-1 border-t border-line" />

        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-muted">Investimento total otimizado</span>
          <AnimatedNumber valor={r.precoFinal} formatar={m} className="my-1 block font-mono text-3xl font-medium tabular-nums text-success sm:text-4xl" />
          <span className="inline-block rounded-full bg-accent/12 px-2.5 py-1 text-xs text-muted">{r.prazoSemanas} semana(s) de sprint (base: 40h/sem)</span>
        </div>

        <div className="rounded-lg border border-line bg-field px-3 py-2">
          <span className="block text-[10px] font-bold tracking-wider text-muted">MARCOS DE PAGAMENTO</span>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {[['30% Kickoff', r.parcelas.kickoff], ['40% Homologação', r.parcelas.homologacao], ['30% Entrega', r.parcelas.entrega]].map(([rot, v]) => (
              <div key={rot as string} className="min-w-0 rounded-md border border-line bg-surface px-2 py-1.5">
                <span className="block text-[10px] text-muted">{rot}</span>
                <strong className="block truncate font-mono text-xs">{m(v as number)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-field p-2.5">
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] text-success">{entrada.criticidade === 'nenhum' ? 'SEM SLA' : `SLA ${entrada.criticidade.toUpperCase()}`}</span>
              <span className="text-[11px] text-muted">{sla?.valor === 'nenhum' ? 'Sem suporte' : 'Suporte/mês'}</span>
            </div>
            <AnimatedNumber valor={r.valorSLA} formatar={m} className="font-mono text-base text-success" />
          </div>
          <div className="rounded-lg border border-accent/30 bg-field p-2.5">
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">CLOUD + TOKENS</span>
              <span className="text-[11px] text-muted">Por mês</span>
            </div>
            <AnimatedNumber valor={r.recorrenteCloud} formatar={m} className="font-mono text-base text-success" />
          </div>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <MotionButton variante="secondary" tamanho="sm" onClick={onSalvar}>💾 Salvar</MotionButton>
          <MotionButton variante="secondary" tamanho="sm" onClick={onCopiarLink}>🔗 Link</MotionButton>
          <MotionButton variante="secondary" tamanho="sm" onClick={onCopiarJSON}>📋 JSON</MotionButton>
          <MotionButton tamanho="sm" onClick={onVisualizar}>📄 Proposta</MotionButton>
        </div>
      </div>
    </motion.section>
  );
}
