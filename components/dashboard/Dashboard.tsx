'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useHistorico } from '@/hooks/useHistorico';
import { gerarPropostasExemplo } from '@/lib/exemplo';
import { baixarArquivo, gerarCSV } from '@/lib/csv';
import { formatarMoeda, formatarNumero, MOEDAS } from '@/lib/formatar';
import { PORTES, type Moeda, type PorteChave, type Proposta } from '@/lib/orcamento';
import { useToast } from '@/components/providers/ToastProvider';
import { Campo, Selecao } from '@/components/ui/Campo';
import { MotionButton } from '@/components/ui/MotionButton';
import { KpiStrip, type Kpi } from './KpiStrip';
import { Graficos } from './Graficos';
import { TabelaPropostas } from './TabelaPropostas';
import { filtrar, FILTROS_PADRAO, soma, type Filtros } from './dados';

const ABAS = [{ id: 'visao', rotulo: 'Visão geral' }, { id: 'detalhe', rotulo: 'Detalhamento' }] as const;
type Aba = (typeof ABAS)[number]['id'];

export function Dashboard() {
  const historico = useHistorico();
  // Os exemplos dependem da data atual: gerados só no navegador, para o HTML estático
  // (gerado no build) bater com a primeira renderização do cliente.
  const [exemplo, setExemplo] = useState<Proposta[] | null>(null);
  useEffect(() => setExemplo(gerarPropostasExemplo()), []);
  const usandoExemplo = historico.length === 0;
  const dados = usandoExemplo ? exemplo ?? [] : historico;

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_PADRAO);
  const [moeda, setMoeda] = useState<Moeda>('BRL');
  const [aba, setAba] = useState<Aba>('visao');
  const toast = useToast();

  const clientes = useMemo(() => [...new Set(dados.map(p => p.entrada.cliente))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [dados]);
  const lista = useMemo(() => filtrar(dados, filtros), [dados, filtros]);
  const filtrosAtivos = filtros.periodo !== 'tudo' || filtros.porte !== 'todos' || filtros.cliente !== 'todos';

  const total = soma(lista, p => p.precoFinal);
  const lucro = soma(lista, p => p.valorLucro);
  const horasBrutas = soma(lista, p => p.horasBrutas);
  const horasIA = soma(lista, p => p.horasPoupadasIA);
  const pct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
  const m = (v: number) => formatarMoeda(v, moeda);

  const kpis: Kpi[] = [
    { id: 'total', rotulo: 'Valor total orçado', valor: total, formatar: m, detalhe: `${lista.length} proposta(s)` },
    { id: 'ticket', rotulo: 'Ticket médio', valor: lista.length ? total / lista.length : 0, formatar: m, detalhe: 'por proposta' },
    { id: 'lucro', rotulo: 'Margem de lucro', valor: lucro, formatar: m, detalhe: total ? `${pct((lucro / total) * 100)}% do valor total` : '—' },
    { id: 'horas', rotulo: 'Horas de desenvolvimento', valor: soma(lista, p => p.horasFinais), formatar: v => `${formatarNumero(v)} h`, detalhe: `${formatarNumero(soma(lista, p => p.totalPF))} pontos de função` },
    { id: 'ia', rotulo: 'Horas poupadas pela IA', valor: horasIA, formatar: v => `${formatarNumero(v)} h`, detalhe: horasBrutas ? `${pct((horasIA / horasBrutas) * 100)}% das horas brutas` : '—' },
    { id: 'recorrente', rotulo: 'Receita recorrente', valor: soma(lista, p => p.valorSLA + p.recorrenteCloud), formatar: m, detalhe: 'por mês (SLA + cloud + tokens)' },
  ];

  const exportar = () => {
    const csv = gerarCSV(lista);
    baixarArquivo(csv, `orcamentos_powerbi_${new Date().toISOString().slice(0, 10)}.csv`);
    toast(`CSV com ${lista.length} proposta(s) exportado para o Power BI.`);
  };

  const mudarFiltro = (parcial: Partial<Filtros>) => setFiltros(f => ({ ...f, ...parcial }));

  return (
    <div className="flex flex-col gap-5">
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Relatório</span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Painel de Orçamentos</h1>
          <p className="text-xs text-muted">{!usandoExemplo ? `Fonte: ${dados.length} orçamento(s) salvos neste navegador` : exemplo ? `Fonte: ${dados.length} propostas de exemplo` : 'Carregando dados…'}</p>
        </div>
        <MotionButton variante="secondary" onClick={exportar}>⬇ Exportar CSV (Power BI)</MotionButton>
      </motion.header>

      <AnimatePresence>
        {usandoExemplo && exemplo && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-accent/35 bg-accent/10 px-4 py-3 text-sm"
          >
            <strong>Dados de exemplo.</strong> Você ainda não salvou orçamentos neste navegador. Monte um orçamento na{' '}
            <Link href="/" className="font-semibold text-accent underline underline-offset-2">Calculadora</Link> e clique em 💾 Salvar: o painel passa a mostrar só os seus dados.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Segmentações (filtros) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
        className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
      >
        <Campo rotulo="Período">{id => <Selecao id={id} valor={filtros.periodo} onMudar={periodo => mudarFiltro({ periodo })}
          opcoes={[{ valor: 'tudo', rotulo: 'Todo o histórico' }, { valor: '30d', rotulo: 'Últimos 30 dias' }, { valor: '90d', rotulo: 'Últimos 90 dias' }, { valor: '12m', rotulo: 'Últimos 12 meses' }]} />}</Campo>
        <Campo rotulo="Porte da empresa">{id => <Selecao<'todos' | PorteChave> id={id} valor={filtros.porte} onMudar={porte => mudarFiltro({ porte })}
          opcoes={[{ valor: 'todos', rotulo: 'Todos os portes' }, ...(Object.keys(PORTES) as PorteChave[]).map(k => ({ valor: k, rotulo: PORTES[k].rotulo }))]} />}</Campo>
        <Campo rotulo="Cliente">{id => <Selecao id={id} valor={filtros.cliente} onMudar={cliente => mudarFiltro({ cliente })}
          opcoes={[{ valor: 'todos', rotulo: 'Todos os clientes' }, ...clientes.map(c => ({ valor: c, rotulo: c }))]} />}</Campo>
        <Campo rotulo="Moeda">{id => <Selecao id={id} valor={moeda} onMudar={setMoeda}
          opcoes={(Object.keys(MOEDAS) as Moeda[]).map(k => ({ valor: k, rotulo: MOEDAS[k].rotulo }))} />}</Campo>
        <div className="flex items-end">
          <AnimatePresence>
            {filtrosAtivos && (
              <MotionButton variante="ghost" tamanho="sm" onClick={() => setFiltros(FILTROS_PADRAO)}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                ✕ Limpar filtros
              </MotionButton>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <KpiStrip kpis={kpis} />

      {/* Abas de página do relatório, com sublinhado animado */}
      <div role="tablist" aria-label="Páginas do relatório" className="flex gap-1 border-b border-line">
        {ABAS.map(a => (
          <button
            key={a.id}
            role="tab"
            type="button"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${aba === a.id ? 'text-fg' : 'text-muted hover:text-fg'}`}
          >
            {a.rotulo}
            {aba === a.id && <motion.span layoutId="aba-relatorio" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={aba}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
        >
          {aba === 'visao'
            ? <Graficos lista={lista} moeda={moeda} onFiltrarCliente={nome => mudarFiltro({ cliente: filtros.cliente === nome ? 'todos' : nome })} />
            : <TabelaPropostas lista={lista} moeda={moeda} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
