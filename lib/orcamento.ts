// Motor de cálculo do orçamento (TypeScript puro, sem React).
// Usado pela calculadora e pelo dashboard (dados de exemplo).

export type Moeda = 'BRL' | 'USD' | 'EUR';
export type PorteChave = 'pequena' | 'media' | 'grande';
export type Nivel = '' | 'JUNIOR' | 'PLENO' | 'SENIOR';
export type Criticidade = 'nenhum' | 'baixo' | 'medio' | 'alto' | 'urgente';

export interface Modulo {
  id: string;
  nome: string;
  categoria: string;
  horas: number;
  pf: number;
  ia?: boolean;
}

export const CATEGORIAS = [
  { id: 'seguranca', titulo: 'Autenticação & Segurança', icone: '🔐', dica: 'Proteção de dados, controle de acessos e conformidade com a LGPD.' },
  { id: 'frontend', titulo: 'Interfaces & Experiência', icone: '💻', dica: 'Telas e painéis com os quais o usuário final interage.' },
  { id: 'backend', titulo: 'Backend, Negócio & Pagamentos', icone: '⚙️', dica: 'Regras de negócio, processamento e serviços financeiros.' },
  { id: 'ia', titulo: 'Inteligência Artificial & Automações', icone: '🤖', dica: 'LLMs e busca semântica para automação inteligente.' },
] as const;

export const MODULOS: Modulo[] = [
  { id: 'auth', nome: 'Auth OAuth2 / JWT', categoria: 'seguranca', horas: 20, pf: 15 },
  { id: '2fa', nome: 'Autenticação 2FA & Biometria', categoria: 'seguranca', horas: 30, pf: 25 },
  { id: 'rbac', nome: 'Gestão de Permissões (RBAC)', categoria: 'seguranca', horas: 25, pf: 20 },
  { id: 'dashboard', nome: 'Dashboard Interativo com Gráficos', categoria: 'frontend', horas: 60, pf: 50 },
  { id: 'crud', nome: 'CRUD Básico de Entidades', categoria: 'frontend', horas: 15, pf: 12 },
  { id: 'i18n', nome: 'Interface Multi-idioma (i18n)', categoria: 'frontend', horas: 35, pf: 30 },
  { id: 'checkout', nome: 'Checkout & Gateways de Pagamento', categoria: 'backend', horas: 50, pf: 45 },
  { id: 'agenda', nome: 'Motor de Agendamento / Reservas', categoria: 'backend', horas: 40, pf: 35 },
  { id: 'export', nome: 'Emissão e Exportação de PDF/Excel', categoria: 'backend', horas: 45, pf: 40 },
  { id: 'chatbot', nome: 'Chatbot IA Assistente (LLM)', categoria: 'ia', horas: 70, pf: 65, ia: true },
  { id: 'rag', nome: 'Busca em Documentos (RAG / Embeddings)', categoria: 'ia', horas: 90, pf: 80, ia: true },
  { id: 'visao', nome: 'Classificação / Visão Computacional', categoria: 'ia', horas: 50, pf: 45, ia: true },
];

export const PORTES: Record<PorteChave, { nome: string; rotulo: string; fatorDesconto: number; tokensMes: number }> = {
  pequena: { nome: 'Pequena / Startup (até R$ 300 mil)', rotulo: 'Pequena / Startup', fatorDesconto: 0.8, tokensMes: 800 },
  media: { nome: 'Média Empresa (até R$ 600 mil)', rotulo: 'Média Empresa', fatorDesconto: 0.92, tokensMes: 2500 },
  grande: { nome: 'Grande Corporação (R$ 1 milhão+)', rotulo: 'Grande Corporação', fatorDesconto: 1.0, tokensMes: 12000 },
};

export const NIVEIS: { valor: Exclude<Nivel, ''>; rotulo: string; valorHora: number }[] = [
  { valor: 'JUNIOR', rotulo: 'Júnior / Suporte', valorHora: 50 },
  { valor: 'PLENO', rotulo: 'Pleno + Copilot', valorHora: 85 },
  { valor: 'SENIOR', rotulo: 'Sênior Tech Lead', valorHora: 130 },
];

export const FATORES_IA = [
  { valor: 0.1, rotulo: 'Baixo (10% IA — tradicional)' },
  { valor: 0.3, rotulo: 'Médio (30% IA — recomendado)' },
  { valor: 0.5, rotulo: 'Alto (50% IA — redução máxima)' },
];

export const COMPLEXIDADE_FRONT = [
  { valor: 1.0, rotulo: 'Baixa (1.0x)' }, { valor: 1.2, rotulo: 'Média (1.2x)' }, { valor: 1.5, rotulo: 'Alta (1.5x)' },
];
export const COMPLEXIDADE_BACK = [
  { valor: 1.0, rotulo: 'Baixa (1.0x)' }, { valor: 1.3, rotulo: 'Média (1.3x)' }, { valor: 1.7, rotulo: 'Alta (1.7x)' },
];

export const REGIMES = [
  { valor: 0.06, rotulo: 'Simples Nacional (6%)' },
  { valor: 0.1425, rotulo: 'Lucro Presumido (14,25%)' },
  { valor: 0.165, rotulo: 'Lucro Real (16,5%)' },
  { valor: 0, rotulo: 'Isento (0%)' },
];

export const SLAS: { valor: Criticidade; rotulo: string; fator: number }[] = [
  { valor: 'nenhum', rotulo: 'Sem contrato de suporte', fator: 1 },
  { valor: 'baixo', rotulo: 'Baixo — atendimento em até 48h', fator: 1 },
  { valor: 'medio', rotulo: 'Médio — priorizado em até 24h', fator: 1.2 },
  { valor: 'alto', rotulo: 'Alto — crítico em até 8h', fator: 1.5 },
  { valor: 'urgente', rotulo: 'Urgente — 24/7 em até 2h', fator: 2 },
];

export interface Entrada {
  projeto: string;
  cliente: string;
  porte: PorteChave;
  moeda: Moeda;
  modulos: string[]; // ids
  nivel: Nivel;
  valorHora: number;
  fatorIA: number;
  compFront: number;
  compBack: number;
  margemLucro: number;
  aliquota: number;
  criticidade: Criticidade;
  horasSLA: number;
  cloudBase: number;
}

export const ENTRADA_PADRAO: Entrada = {
  projeto: '', cliente: '', porte: 'pequena', moeda: 'BRL', modulos: [], nivel: '', valorHora: 0,
  fatorIA: 0.3, compFront: 1, compBack: 1, margemLucro: 25, aliquota: 0.06, criticidade: 'nenhum', horasSLA: 0, cloudBase: 0,
};

export function computarOrcamento(e: Entrada) {
  const porte = PORTES[e.porte] ?? PORTES.pequena;
  const modulos = MODULOS.filter(m => e.modulos.includes(m.id));

  const horasBrutas = modulos.reduce((s, m) => s + m.horas, 0);
  const totalPF = modulos.reduce((s, m) => s + m.pf, 0);
  const temIA = modulos.some(m => m.ia);

  const pfIA = totalPF * e.fatorIA;
  const pfHumano = totalPF - pfIA;
  const horasPoupadasIA = horasBrutas * e.fatorIA;
  const horasFinais = horasBrutas === 0 ? 0 : Math.max(1, horasBrutas - horasPoupadasIA);

  const custoTecnico = horasFinais * e.valorHora;
  const fatorComplexidade = (e.compFront + e.compBack) / 2;
  const custoComplexidade = custoTecnico * fatorComplexidade;
  const custoAjustadoPorte = custoComplexidade * porte.fatorDesconto;

  const valorLucro = custoAjustadoPorte * (e.margemLucro / 100);
  const subtotal = custoAjustadoPorte + valorLucro;
  const valorImposto = subtotal * e.aliquota;
  const precoFinal = subtotal + valorImposto;

  const prazoSemanas = horasFinais === 0 ? 0 : Math.ceil(horasFinais / 40);
  const fatorSLA = SLAS.find(s => s.valor === e.criticidade)?.fator ?? 1;
  const valorSLA = e.criticidade === 'nenhum' ? 0 : e.horasSLA * e.valorHora * fatorSLA;
  const tokensMes = temIA ? porte.tokensMes : 0;
  const recorrenteCloud = e.cloudBase + tokensMes;

  return {
    porte, modulos, horasBrutas, totalPF, temIA, pfIA, pfHumano, horasPoupadasIA, horasFinais,
    custoTecnico, fatorComplexidade, custoComplexidade, custoAjustadoPorte, valorLucro, valorImposto,
    precoFinal, prazoSemanas, valorSLA, tokensMes, recorrenteCloud,
    parcelas: { kickoff: precoFinal * 0.3, homologacao: precoFinal * 0.4, entrega: precoFinal * 0.3 },
  };
}

export type Resultado = ReturnType<typeof computarOrcamento>;

// Registro salvo no histórico e lido pelo dashboard
export interface Proposta {
  id: string;
  dataCriacao: string;
  exemplo?: boolean;
  entrada: Entrada;
  modulosNomes: string[];
  totalPF: number;
  pfHumano: number;
  pfIA: number;
  horasBrutas: number;
  horasPoupadasIA: number;
  horasFinais: number;
  custoTecnico: number;
  custoComplexidade: number;
  custoAjustadoPorte: number;
  valorLucro: number;
  valorImposto: number;
  precoFinal: number;
  prazoSemanas: number;
  valorSLA: number;
  recorrenteCloud: number;
}

export function criarProposta(entrada: Entrada, r: Resultado, extras: { dataCriacao?: string; exemplo?: boolean; id?: string } = {}): Proposta {
  const dataCriacao = extras.dataCriacao ?? new Date().toISOString();
  return {
    id: extras.id ?? `${dataCriacao}-${Math.random().toString(36).slice(2, 8)}`,
    dataCriacao,
    exemplo: extras.exemplo,
    entrada: { ...entrada, modulos: [...entrada.modulos] },
    modulosNomes: r.modulos.map(m => m.nome),
    totalPF: r.totalPF, pfHumano: r.pfHumano, pfIA: r.pfIA,
    horasBrutas: r.horasBrutas, horasPoupadasIA: r.horasPoupadasIA, horasFinais: r.horasFinais,
    custoTecnico: r.custoTecnico, custoComplexidade: r.custoComplexidade, custoAjustadoPorte: r.custoAjustadoPorte,
    valorLucro: r.valorLucro, valorImposto: r.valorImposto, precoFinal: r.precoFinal,
    prazoSemanas: r.prazoSemanas, valorSLA: r.valorSLA, recorrenteCloud: r.recorrenteCloud,
  };
}
