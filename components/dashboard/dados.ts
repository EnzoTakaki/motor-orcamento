import { PORTES, type PorteChave, type Proposta } from '@/lib/orcamento';

export interface Filtros { periodo: 'tudo' | '30d' | '90d' | '12m'; porte: 'todos' | PorteChave; cliente: string; }
export const FILTROS_PADRAO: Filtros = { periodo: 'tudo', porte: 'todos', cliente: 'todos' };

export function filtrar(lista: Proposta[], f: Filtros) {
  const dias = { '30d': 30, '90d': 90, '12m': 365, tudo: 0 }[f.periodo];
  const agora = Date.now();
  return lista.filter(p =>
    (!dias || agora - new Date(p.dataCriacao).getTime() <= dias * 864e5) &&
    (f.porte === 'todos' || p.entrada.porte === f.porte) &&
    (f.cliente === 'todos' || p.entrada.cliente === f.cliente));
}

export const soma = (l: Proposta[], fn: (p: Proposta) => number) => l.reduce((s, p) => s + (fn(p) || 0), 0);

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function porMes(lista: Proposta[]) {
  const hoje = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 11 + i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const doMes = lista.filter(p => p.dataCriacao.slice(0, 7) === chave);
    return {
      mes: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      valor: soma(doMes, p => p.precoFinal),
      horasEquipe: soma(doMes, p => p.horasFinais),
      horasIA: soma(doMes, p => p.horasPoupadasIA),
    };
  });
}

export function cascata(lista: Proposta[]) {
  const base = soma(lista, p => p.custoTecnico);
  const complexidade = soma(lista, p => p.custoComplexidade - p.custoTecnico);
  const porte = soma(lista, p => p.custoAjustadoPorte - p.custoComplexidade);
  const lucro = soma(lista, p => p.valorLucro);
  const imposto = soma(lista, p => p.valorImposto);
  const total = soma(lista, p => p.precoFinal);
  const passos: { nome: string; delta: number; tipo: 'total' | 'sobe' | 'desce' }[] = [
    { nome: 'Custo', delta: base, tipo: 'total' },
    { nome: 'Complex.', delta: complexidade, tipo: complexidade >= 0 ? 'sobe' : 'desce' },
    { nome: 'Porte', delta: porte, tipo: porte >= 0 ? 'sobe' : 'desce' },
    { nome: 'Lucro', delta: lucro, tipo: 'sobe' },
    { nome: 'Impostos', delta: imposto, tipo: 'sobe' },
  ];
  let acumulado = 0;
  const linhas = passos.map(p => {
    const inicio = p.tipo === 'total' ? 0 : acumulado;
    const fim = p.tipo === 'total' ? p.delta : acumulado + p.delta;
    acumulado = fim;
    return { nome: p.nome, base: Math.min(inicio, fim), valor: Math.abs(fim - inicio), delta: p.delta, tipo: p.tipo };
  });
  linhas.push({ nome: 'Total', base: 0, valor: total, delta: total, tipo: 'total' });
  return linhas;
}

export function ranking(lista: Proposta[], chave: (p: Proposta) => string[], valor: (p: Proposta) => number, limite = 8) {
  const mapa = new Map<string, number>();
  lista.forEach(p => chave(p).forEach(k => mapa.set(k, (mapa.get(k) || 0) + valor(p))));
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, limite).map(([nome, total]) => ({ nome, total }));
}

export const porPorte = (lista: Proposta[]) =>
  (Object.keys(PORTES) as PorteChave[]).map(k => ({ nome: PORTES[k].rotulo, total: soma(lista.filter(p => p.entrada.porte === k), p => p.precoFinal), qtd: lista.filter(p => p.entrada.porte === k).length }));
