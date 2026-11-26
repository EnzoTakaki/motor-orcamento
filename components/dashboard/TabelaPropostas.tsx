'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatarData, formatarMoeda, formatarNumero } from '@/lib/formatar';
import { PORTES, type Moeda, type Proposta } from '@/lib/orcamento';
import { MotionButton } from '@/components/ui/MotionButton';
import { soma } from './dados';

type Campo = 'data' | 'cliente' | 'projeto' | 'pf' | 'horas' | 'prazo' | 'valor';
const COLUNAS: { campo: Campo; rotulo: string; num?: boolean; valor: (p: Proposta) => string | number }[] = [
  { campo: 'data', rotulo: 'Data', valor: p => p.dataCriacao },
  { campo: 'cliente', rotulo: 'Cliente', valor: p => p.entrada.cliente.toLowerCase() },
  { campo: 'projeto', rotulo: 'Projeto', valor: p => p.entrada.projeto.toLowerCase() },
  { campo: 'pf', rotulo: 'PF', num: true, valor: p => p.totalPF },
  { campo: 'horas', rotulo: 'Horas', num: true, valor: p => p.horasFinais },
  { campo: 'prazo', rotulo: 'Prazo', num: true, valor: p => p.prazoSemanas },
  { campo: 'valor', rotulo: 'Valor', num: true, valor: p => p.precoFinal },
];

const linhaVariantes = {
  oculto: { opacity: 0, x: -12 },
  visivel: (i: number) => ({ opacity: 1, x: 0, transition: { delay: Math.min(i, 15) * 0.03 } }),
};

export function TabelaPropostas({ lista, moeda }: { lista: Proposta[]; moeda: Moeda }) {
  const router = useRouter();
  const [ordem, setOrdem] = useState<{ campo: Campo; asc: boolean }>({ campo: 'data', asc: false });

  const ordenada = useMemo(() => {
    const col = COLUNAS.find(c => c.campo === ordem.campo)!;
    return [...lista].sort((a, b) => {
      const va = col.valor(a), vb = col.valor(b);
      return (va < vb ? -1 : va > vb ? 1 : 0) * (ordem.asc ? 1 : -1);
    });
  }, [lista, ordem]);

  return (
    <div className="scroll-fino overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[760px] border-collapse text-sm tabular-nums">
        <thead>
          <tr>
            {COLUNAS.map(c => {
              const ativo = ordem.campo === c.campo;
              return (
                <th key={c.campo} aria-sort={ativo ? (ordem.asc ? 'ascending' : 'descending') : 'none'} className={`border-b border-line px-3 py-2.5 ${c.num ? 'text-right' : 'text-left'}`}>
                  <button
                    type="button"
                    onClick={() => setOrdem(o => ({ campo: c.campo, asc: o.campo === c.campo ? !o.asc : false }))}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${ativo ? 'text-fg' : 'text-muted hover:text-fg'}`}
                  >
                    {c.rotulo}
                    <motion.span animate={{ rotate: ativo && ordem.asc ? 180 : 0, opacity: ativo ? 1 : 0.3 }} className="inline-block">▼</motion.span>
                  </button>
                </th>
              );
            })}
            <th className="border-b border-line px-3 py-2.5"><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        {/* key muda com a ordenação: as linhas reaparecem em cascata */}
        <motion.tbody key={`${ordem.campo}-${ordem.asc}`} initial="oculto" animate="visivel">
          {ordenada.length === 0 && (
            <tr><td colSpan={8} className="px-3 py-10 text-center text-muted">Nenhuma proposta para os filtros escolhidos.</td></tr>
          )}
          {ordenada.map((p, i) => (
            <motion.tr key={p.id} custom={i} variants={linhaVariantes} className="border-b border-line transition-colors last:border-0 hover:bg-field">
              <td className="whitespace-nowrap px-3 py-2">{formatarData(p.dataCriacao)}</td>
              <td className="whitespace-nowrap px-3 py-2">{p.entrada.cliente}</td>
              <td className="whitespace-nowrap px-3 py-2">
                {p.entrada.projeto}
                <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">{PORTES[p.entrada.porte].rotulo}</span>
              </td>
              <td className="px-3 py-2 text-right font-mono">{formatarNumero(p.totalPF)}</td>
              <td className="px-3 py-2 text-right font-mono">{formatarNumero(p.horasFinais)} h</td>
              <td className="px-3 py-2 text-right font-mono">{p.prazoSemanas} sem</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-mono font-semibold">{formatarMoeda(p.precoFinal, moeda)}</td>
              <td className="px-3 py-2 text-right">
                <MotionButton tamanho="sm" variante="ghost" className="!h-7 text-accent" onClick={() => router.push(`/?carregar=${encodeURIComponent(p.id)}`)}>Abrir</MotionButton>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
        <tfoot>
          <tr className="border-t-2 border-line font-semibold">
            <td colSpan={3} className="px-3 py-2.5">Total ({ordenada.length})</td>
            <td className="px-3 py-2.5 text-right font-mono">{formatarNumero(soma(ordenada, p => p.totalPF))}</td>
            <td className="px-3 py-2.5 text-right font-mono">{formatarNumero(soma(ordenada, p => p.horasFinais))} h</td>
            <td />
            <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono">{formatarMoeda(soma(ordenada, p => p.precoFinal), moeda)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
