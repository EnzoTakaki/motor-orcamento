// CSV pronto para o Power BI Desktop (UTF-8, ponto e vírgula, vírgula decimal).
import { PORTES, type Proposta } from './orcamento';

export function gerarCSV(lista: Proposta[]) {
  const num = (v: number) => (Number(v) || 0).toFixed(2).replace('.', ',');
  const txt = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const cab = ['data', 'cliente', 'projeto', 'porte', 'nivel_equipe', 'qtd_modulos', 'modulos', 'pontos_funcao', 'pf_humano', 'pf_ia',
    'horas_brutas', 'horas_poupadas_ia', 'horas_finais', 'valor_hora', 'custo_tecnico', 'margem_lucro_pct', 'valor_lucro',
    'aliquota_imposto_pct', 'valor_imposto', 'preco_final_brl', 'prazo_semanas', 'sla', 'sla_mensal_brl', 'cloud_tokens_mensal_brl', 'dado_de_exemplo'];
  const linhas = lista.map(p => [
    p.dataCriacao.slice(0, 10), txt(p.entrada.cliente), txt(p.entrada.projeto), txt(PORTES[p.entrada.porte]?.rotulo), txt(p.entrada.nivel),
    p.modulosNomes.length, txt(p.modulosNomes.join(' | ')), num(p.totalPF), num(p.pfHumano), num(p.pfIA),
    num(p.horasBrutas), num(p.horasPoupadasIA), num(p.horasFinais), num(p.entrada.valorHora), num(p.custoTecnico),
    num(p.entrada.margemLucro), num(p.valorLucro), num(p.entrada.aliquota * 100), num(p.valorImposto), num(p.precoFinal),
    p.prazoSemanas, txt(p.entrada.criticidade), num(p.valorSLA), num(p.recorrenteCloud), p.exemplo ? 'sim' : 'nao',
  ].join(';'));
  return [cab.join(';'), ...linhas].join('\r\n');
}

export function baixarArquivo(conteudo: string, nome: string, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿' + conteudo], { type: tipo }));
  const a = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
