'use client';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { useTema } from '@/components/providers/ThemeProvider';
import { itemStagger, containerStagger } from '@/components/motion/Stagger';
import { formatarMoeda, formatarNumero } from '@/lib/formatar';
import type { Moeda, Proposta } from '@/lib/orcamento';
import { cascata, porMes, porPorte, ranking } from './dados';

// Paleta validada para daltonismo, com passos próprios para cada tema
const PALETA = {
  dark: { serie1: '#338ced', serie2: '#e76624', negativo: '#eb6263', total: '#71717a', grade: '#2a2a30', texto: '#a1a1aa' },
  light: { serie1: '#257de0', serie2: '#f47230', negativo: '#ec4647', total: '#8c959f', grade: '#e8ebef', texto: '#6e7781' },
};

function Cartao({ titulo, subtitulo, className = '', children }: { titulo: string; subtitulo?: string; className?: string; children: React.ReactNode }) {
  return (
    <motion.article
      variants={itemStagger}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
      className={`flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-4 transition-shadow hover:shadow-lg hover:shadow-black/10 ${className}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        {subtitulo && <span className="text-[11px] text-muted">{subtitulo}</span>}
      </header>
      <div className="h-64">{children}</div>
    </motion.article>
  );
}

function Dica({ active, payload, label, formatar }: TooltipProps<number, string> & { formatar: (v: number, nome?: string, item?: unknown) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-fg">{label}</p>
      {payload.filter(p => p.dataKey !== 'base').map(p => (
        <p key={String(p.dataKey)} className="flex items-center gap-2 text-fg">
          <span className="size-2.5 rounded-sm" style={{ background: p.color }} />
          {formatar(Number(p.value), String(p.name), p.payload)}
        </p>
      ))}
    </div>
  );
}

export function Graficos({ lista, moeda, onFiltrarCliente }: { lista: Proposta[]; moeda: Moeda; onFiltrarCliente: (nome: string) => void }) {
  const { tema } = useTema();
  const c = PALETA[tema];
  const curta = (v: number) => formatarMoeda(v, moeda, true);
  const cheia = (v: number) => formatarMoeda(v, moeda);
  const eixo = { stroke: c.texto, fontSize: 11, tickLine: false, axisLine: false } as const;
  const cursor = { fill: tema === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)' };
  const meses = porMes(lista);
  const passos = cascata(lista);
  const clientes = ranking(lista, p => [p.entrada.cliente], p => p.precoFinal);
  const modulos = ranking(lista, p => p.modulosNomes, () => 1);
  const portes = porPorte(lista);
  const corPasso = (t: string) => (t === 'total' ? c.total : t === 'sobe' ? c.serie1 : c.negativo);
  const encurtar = (t: string) => (t.length > 20 ? `${t.slice(0, 19)}…` : t);

  return (
    // Cada cartão entra em cascata quando a grade chega na viewport
    <motion.div
      variants={containerStagger(0.08)}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.1 }}
      className="grid gap-3 lg:grid-cols-3"
    >
      <Cartao titulo="Valor orçado por mês" subtitulo="últimos 12 meses" className="lg:col-span-2">
        <ResponsiveContainer>
          <BarChart data={meses} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grade} />
            <XAxis dataKey="mes" {...eixo} />
            <YAxis tickFormatter={curta} width={72} {...eixo} />
            <Tooltip cursor={cursor} content={<Dica formatar={v => cheia(v)} />} />
            <Bar dataKey="valor" name="Valor orçado" fill={c.serie1} radius={[4, 4, 0, 0]} maxBarSize={34} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </Cartao>

      <Cartao titulo="Como o preço é formado" subtitulo="custo técnico → preço final">
        <ResponsiveContainer>
          <BarChart data={passos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grade} />
            <XAxis dataKey="nome" {...eixo} interval={0} fontSize={10} />
            <YAxis tickFormatter={curta} width={72} {...eixo} />
            <Tooltip cursor={cursor} content={<Dica formatar={(_, __, item) => {
              const p = item as (typeof passos)[number];
              return p.tipo === 'total' ? cheia(p.delta) : `${p.delta >= 0 ? '+' : '−'}${cheia(Math.abs(p.delta))}`;
            }} />} />
            <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="valor" stackId="a" name="Valor" radius={4} animationDuration={700}>
              {passos.map(p => <Cell key={p.nome} fill={corPasso(p.tipo)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Cartao>

      <Cartao titulo="Horas da equipe e horas poupadas pela IA" subtitulo="por mês" className="lg:col-span-3">
        <ResponsiveContainer>
          <BarChart data={meses} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grade} />
            <XAxis dataKey="mes" {...eixo} />
            <YAxis tickFormatter={v => `${formatarNumero(v)} h`} width={64} {...eixo} />
            <Tooltip cursor={cursor} content={<Dica formatar={(v, nome) => `${nome}: ${formatarNumero(v)} h`} />} />
            {/* Texto da legenda na cor de texto; a cor da série fica só no quadradinho */}
            <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
              formatter={valor => <span style={{ color: c.texto }}>{valor}</span>} />
            <Bar dataKey="horasEquipe" name="Horas da equipe" stackId="h" fill={c.serie1} maxBarSize={34} stroke={tema === 'dark' ? '#1a1a1e' : '#ffffff'} strokeWidth={1} />
            <Bar dataKey="horasIA" name="Horas poupadas pela IA" stackId="h" fill={c.serie2} radius={[4, 4, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </Cartao>

      <Cartao titulo="Valor por porte de empresa">
        <ResponsiveContainer>
          <BarChart data={portes} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke={c.grade} />
            <XAxis type="number" tickFormatter={curta} {...eixo} tickCount={4} />
            <YAxis type="category" dataKey="nome" width={118} {...eixo} />
            <Tooltip cursor={cursor} content={<Dica formatar={(v, _, item) => `${cheia(v)} · ${(item as { qtd: number }).qtd} proposta(s)`} />} />
            <Bar dataKey="total" fill={c.serie1} radius={[0, 4, 4, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Cartao>

      <Cartao titulo="Maiores clientes" subtitulo="clique para filtrar">
        <ResponsiveContainer>
          <BarChart data={clientes} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke={c.grade} />
            <XAxis type="number" tickFormatter={curta} {...eixo} tickCount={4} />
            <YAxis type="category" dataKey="nome" width={150} tickFormatter={encurtar} {...eixo} />
            <Tooltip cursor={cursor} content={<Dica formatar={v => `${cheia(v)} (clique para filtrar)`} />} />
            <Bar dataKey="total" fill={c.serie1} radius={[0, 4, 4, 0]} maxBarSize={18} className="cursor-pointer"
              onClick={(d: { nome?: string }) => d?.nome && onFiltrarCliente(d.nome)} />
          </BarChart>
        </ResponsiveContainer>
      </Cartao>

      <Cartao titulo="Módulos mais orçados" subtitulo="nº de propostas">
        <ResponsiveContainer>
          <BarChart data={modulos} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke={c.grade} />
            <XAxis type="number" allowDecimals={false} {...eixo} tickCount={4} />
            <YAxis type="category" dataKey="nome" width={150} tickFormatter={encurtar} {...eixo} />
            <Tooltip cursor={cursor} content={<Dica formatar={v => `${v} proposta(s)`} />} />
            <Bar dataKey="total" fill={c.serie1} radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </Cartao>
    </motion.div>
  );
}
