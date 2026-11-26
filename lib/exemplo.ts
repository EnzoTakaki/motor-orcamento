// Propostas de exemplo (determinísticas) para o dashboard não abrir vazio.
import { computarOrcamento, criarProposta, MODULOS, type Entrada, type PorteChave, type Proposta, type Criticidade, type Nivel } from './orcamento';

function aleatorio(semente: number) {
  let s = semente;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

export function gerarPropostasExemplo(qtd = 36): Proposta[] {
  const rnd = aleatorio(42);
  const um = <T,>(l: readonly T[]) => l[Math.floor(rnd() * l.length)];
  const clientes: [string, PorteChave][] = [
    ['Clínica Vida Plena', 'pequena'], ['Padaria Trigo de Ouro', 'pequena'], ['Agro Sertão Cooperativa', 'media'],
    ['Logística Rota Sul', 'media'], ['Banco Horizonte', 'grande'], ['Varejo MaxCompra', 'grande'],
    ['EducaMais Escolas', 'media'], ['Startup PetCare', 'pequena'], ['Construtora Alicerce', 'media'],
  ];
  const projetos = ['Portal do Cliente', 'App de Agendamento', 'ERP Financeiro', 'Assistente Virtual', 'Loja Virtual', 'Painel Gerencial', 'API de Integração'];
  const niveis: [Nivel, number][] = [['JUNIOR', 50], ['PLENO', 85], ['SENIOR', 130]];
  const slas: Criticidade[] = ['nenhum', 'baixo', 'medio', 'alto'];
  const hoje = new Date();

  return Array.from({ length: qtd }, (_, i) => {
    const [cliente, porte] = um(clientes);
    const [nivel, valorHora] = um(niveis);
    const criticidade = um(slas);
    const modulos = [...MODULOS].sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 5)).map(m => m.id);
    const entrada: Entrada = {
      projeto: um(projetos), cliente, porte, moeda: 'BRL', modulos, nivel, valorHora,
      fatorIA: um([0.1, 0.3, 0.3, 0.5]), compFront: um([1, 1.2, 1.5]), compBack: um([1, 1.3, 1.7]),
      margemLucro: um([20, 25, 30, 35]), aliquota: um([0.06, 0.06, 0.1425, 0.165]),
      criticidade, horasSLA: criticidade === 'nenhum' ? 0 : um([10, 20, 40]), cloudBase: um([0, 300, 800, 1500]),
    };
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 27), 10);
    return criarProposta(entrada, computarOrcamento(entrada), { dataCriacao: data.toISOString(), exemplo: true, id: `exemplo-${i}` });
  }).sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}
