'use client';
import { motion } from 'framer-motion';
import {
  CATEGORIAS, COMPLEXIDADE_BACK, COMPLEXIDADE_FRONT, FATORES_IA, MODULOS, NIVEIS, PORTES, REGIMES, SLAS,
  type Entrada, type Nivel, type PorteChave, type Resultado,
} from '@/lib/orcamento';
import { MOEDAS } from '@/lib/formatar';
import { Campo, Entrada as Input, Selecao } from '@/components/ui/Campo';
import { containerStagger } from '@/components/motion/Stagger';
import { ModuloCard } from './ModuloCard';

type Props = { entrada: Entrada; atualizar: (p: Partial<Entrada>) => void; resultado?: Resultado };

function Titulo({ numero, children }: { numero: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="rounded-md bg-accent/12 px-2 py-0.5 font-mono text-xs text-accent">{numero}</span>
      <h2 className="text-base font-semibold sm:text-lg">{children}</h2>
    </div>
  );
}

const numeroDe = (v: string) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);

export function EtapaModulos({ entrada, atualizar, resultado }: Props) {
  const alternar = (id: string) =>
    atualizar({ modulos: entrada.modulos.includes(id) ? entrada.modulos.filter(m => m !== id) : [...entrada.modulos, id] });

  return (
    <section>
      <Titulo numero="01">Configuração do sistema & mapeamento APF</Titulo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome do sistema / solução *">{id => <Input id={id} value={entrada.projeto} placeholder="Ex.: Platform Core API" onChange={e => atualizar({ projeto: e.target.value })} />}</Campo>
        <Campo rotulo="Nome do cliente / empresa *">{id => <Input id={id} value={entrada.cliente} placeholder="Ex.: Acme Corp" onChange={e => atualizar({ cliente: e.target.value })} />}</Campo>
        <Campo rotulo="Porte / capacidade da empresa" dica="Define o desconto por porte e a cota mensal estimada de tokens de IA.">
          {id => <Selecao<PorteChave> id={id} valor={entrada.porte} onMudar={porte => atualizar({ porte })} opcoes={(Object.keys(PORTES) as PorteChave[]).map(k => ({ valor: k, rotulo: PORTES[k].nome }))} />}
        </Campo>
        <Campo rotulo="Moeda de cobrança">
          {id => <Selecao id={id} valor={entrada.moeda} onMudar={moeda => atualizar({ moeda })} opcoes={(Object.keys(MOEDAS) as (keyof typeof MOEDAS)[]).map(k => ({ valor: k, rotulo: MOEDAS[k].rotulo }))} />}
        </Campo>
      </div>

      <motion.div
        key={entrada.modulos.length}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        className={`mt-5 inline-flex rounded-lg border px-3 py-2 font-mono text-xs ${entrada.modulos.length ? 'border-accent text-accent' : 'border-line text-muted'}`}
      >
        ✨ {entrada.modulos.length} módulo(s) · {resultado?.horasBrutas ?? 0}h · {resultado?.totalPF ?? 0} PF
      </motion.div>

      <div className="mt-4 flex flex-col gap-5">
        {CATEGORIAS.map((cat, i) => (
          <div key={cat.id}>
            <p className="mb-2 text-sm font-bold text-accent" title={cat.dica}>{cat.icone} {cat.titulo}</p>
            {/* Cards aparecem em cascata ao montar a etapa */}
            <motion.div
              className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
              variants={containerStagger(0.05, i * 0.08)}
              initial="oculto"
              animate="visivel"
            >
              {MODULOS.filter(m => m.categoria === cat.id).map(m => (
                <ModuloCard key={m.id} modulo={m} selecionado={entrada.modulos.includes(m.id)} onAlternar={() => alternar(m.id)} />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EtapaEquipe({ entrada, atualizar, resultado }: Props) {
  return (
    <section>
      <Titulo numero="02">Alocação de equipe & substituição por IA</Titulo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nível de automação por IA" dica="Assistentes de código assumem parte das tarefas de desenvolvedores juniores.">
          {id => <Selecao id={id} valor={entrada.fatorIA} onMudar={fatorIA => atualizar({ fatorIA })} opcoes={FATORES_IA} />}
        </Campo>
        <Campo rotulo="Liderança técnica *">
          {id => (
            <Selecao<Nivel>
              id={id}
              valor={entrada.nivel}
              placeholder="Selecione o nível..."
              onMudar={nivel => atualizar({ nivel, valorHora: NIVEIS.find(n => n.valor === nivel)?.valorHora ?? entrada.valorHora })}
              opcoes={NIVEIS.map(n => ({ valor: n.valor, rotulo: `${n.rotulo} (R$ ${n.valorHora}/h)` }))}
            />
          )}
        </Campo>
        <Campo rotulo="Horas brutas do projeto">{id => <Input id={id} type="number" value={resultado?.horasBrutas ?? 0} readOnly />}</Campo>
        <Campo rotulo="Valor hora técnico médio (R$) *">
          {id => <Input id={id} type="number" min={0} value={entrada.valorHora || ''} placeholder="0" onChange={e => atualizar({ valorHora: numeroDe(e.target.value) })} />}
        </Campo>
        <Campo rotulo="Complexidade do frontend">{id => <Selecao id={id} valor={entrada.compFront} onMudar={compFront => atualizar({ compFront })} opcoes={COMPLEXIDADE_FRONT} />}</Campo>
        <Campo rotulo="Complexidade do backend">{id => <Selecao id={id} valor={entrada.compBack} onMudar={compBack => atualizar({ compBack })} opcoes={COMPLEXIDADE_BACK} />}</Campo>
      </div>
    </section>
  );
}

export function EtapaImpostos({ entrada, atualizar }: Props) {
  return (
    <section>
      <Titulo numero="03">Custos recorrentes, impostos & SLA</Titulo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Regime tributário (NF)">{id => <Selecao id={id} valor={entrada.aliquota} onMudar={aliquota => atualizar({ aliquota })} opcoes={REGIMES} />}</Campo>
        <Campo rotulo="Margem de lucro (%)">{id => <Input id={id} type="number" min={0} value={entrada.margemLucro} onChange={e => atualizar({ margemLucro: numeroDe(e.target.value) })} />}</Campo>
        <div className="sm:col-span-2">
          <Campo rotulo="Contrato de suporte & SLA">{id => <Selecao id={id} valor={entrada.criticidade} onMudar={criticidade => atualizar({ criticidade })} opcoes={SLAS} />}</Campo>
        </div>
        <Campo rotulo="Horas de suporte por mês">{id => <Input id={id} type="number" min={0} value={entrada.horasSLA} onChange={e => atualizar({ horasSLA: numeroDe(e.target.value) })} />}</Campo>
        <Campo rotulo="Servidor cloud base (R$/mês)">{id => <Input id={id} type="number" min={0} value={entrada.cloudBase} onChange={e => atualizar({ cloudBase: numeroDe(e.target.value) })} />}</Campo>
      </div>
    </section>
  );
}
