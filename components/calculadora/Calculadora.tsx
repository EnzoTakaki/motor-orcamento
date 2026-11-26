'use client';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { computarOrcamento, criarProposta, ENTRADA_PADRAO, type Entrada, type Proposta } from '@/lib/orcamento';
import { historicoStore } from '@/lib/historico';
import { gerarPropostasExemplo } from '@/lib/exemplo';
import { useToast } from '@/components/providers/ToastProvider';
import { MotionButton } from '@/components/ui/MotionButton';
import { Stepper } from './Stepper';
import { EtapaEquipe, EtapaImpostos, EtapaModulos } from './Etapas';
import { ResumoProposta } from './ResumoProposta';
import { Historico } from './Historico';
import { PropostaModal } from './PropostaModal';

const TOTAL_ETAPAS = 3;

// Desliza para a esquerda ao avançar e para a direita ao voltar
const variantesEtapa = {
  entrar: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  centro: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 32 } },
  sair: (dir: number) => ({ x: dir * -48, opacity: 0, transition: { duration: 0.16 } }),
} as const;

function validar(etapa: number, e: Entrada): string | null {
  if (etapa === 1) {
    if (!e.projeto.trim() || !e.cliente.trim()) return 'Preencha o nome do sistema e do cliente.';
    if (e.modulos.length === 0) return 'Selecione pelo menos 1 módulo para continuar.';
  }
  if (etapa === 2 && (!e.nivel || e.valorHora <= 0)) return 'Escolha a liderança técnica e defina o valor hora.';
  return null;
}

// Link compartilhável: a entrada inteira vai codificada em ?proposta=
const codificar = (e: Entrada) => btoa(unescape(encodeURIComponent(JSON.stringify(e))));
const decodificar = (s: string): Entrada | null => {
  try { return { ...ENTRADA_PADRAO, ...JSON.parse(decodeURIComponent(escape(atob(s)))) }; } catch { return null; }
};

export function Calculadora() {
  const [entrada, setEntrada] = useState<Entrada>(ENTRADA_PADRAO);
  const [etapa, setEtapa] = useState(1);
  const [direcao, setDirecao] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const toast = useToast();
  const tremor = useAnimationControls();

  const resultado = useMemo(() => computarOrcamento(entrada), [entrada]);
  const atualizar = useCallback((parcial: Partial<Entrada>) => setEntrada(e => ({ ...e, ...parcial })), []);

  // Carrega uma proposta vinda do Dashboard (?carregar=id) ou de um link compartilhado (?proposta=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('carregar');
    const compartilhada = params.get('proposta');
    let carregada: Entrada | null = null;
    if (id) {
      const p = [...historicoStore.getSnapshot(), ...gerarPropostasExemplo()].find(x => x.id === id);
      if (p) carregada = p.entrada;
    } else if (compartilhada) {
      carregada = decodificar(compartilhada);
    }
    if (carregada) {
      setEntrada(carregada);
      setEtapa(TOTAL_ETAPAS);
      toast('Proposta carregada na calculadora.', 'info');
    }
    if (id || compartilhada) window.history.replaceState(null, '', window.location.pathname);
  }, [toast]);

  const sacudir = (mensagem: string) => {
    toast(mensagem, 'error');
    tremor.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
  };

  const irPara = (destino: number) => {
    if (destino === etapa || destino < 1 || destino > TOTAL_ETAPAS) return;
    if (destino > etapa) {
      for (let n = etapa; n < destino; n++) {
        const erro = validar(n, entrada);
        if (erro) { if (n !== etapa) { setDirecao(n > etapa ? 1 : -1); setEtapa(n); } sacudir(erro); return; }
      }
    }
    setDirecao(destino > etapa ? 1 : -1);
    setEtapa(destino);
  };

  const finalizar = () => {
    const erro = validar(1, entrada) ?? validar(2, entrada);
    if (erro) return sacudir(erro);
    setModalAberto(true);
  };

  const salvar = () => {
    const erro = validar(1, entrada) ?? validar(2, entrada);
    if (erro) return sacudir(erro);
    historicoStore.adicionar(criarProposta(entrada, resultado));
    toast('Orçamento salvo! Ele já aparece no Dashboard.');
  };

  const copiar = async (texto: string, mensagem: string) => {
    try { await navigator.clipboard.writeText(texto); toast(mensagem); }
    catch { toast('Não foi possível copiar. Seu navegador bloqueou a área de transferência.', 'error'); }
  };

  const restaurarPadroes = () => {
    setEntrada(ENTRADA_PADRAO);
    setDirecao(-1);
    setEtapa(1);
    toast('Formulário restaurado para os valores padrão.', 'info');
  };

  const abrirDoHistorico = (p: Proposta) => {
    setEntrada(p.entrada);
    setDirecao(1);
    setEtapa(TOTAL_ETAPAS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Proposta carregada na calculadora.', 'info');
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]">
      <motion.form
        animate={tremor}
        onSubmit={e => e.preventDefault()}
        className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6"
      >
        <Stepper etapa={etapa} total={TOTAL_ETAPAS} onIr={irPara} />

        <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Etapa {etapa} de {TOTAL_ETAPAS}</span>
          <MotionButton variante="ghost" tamanho="sm" onClick={restaurarPadroes}>↺ Restaurar padrões</MotionButton>
        </div>

        {/* overflow-hidden evita barra de rolagem lateral durante o deslize entre etapas */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direcao} initial={false}>
            <motion.div key={etapa} custom={direcao} variants={variantesEtapa} initial="entrar" animate="centro" exit="sair">
              {etapa === 1 && <EtapaModulos entrada={entrada} resultado={resultado} atualizar={atualizar} />}
              {etapa === 2 && <EtapaEquipe entrada={entrada} resultado={resultado} atualizar={atualizar} />}
              {etapa === 3 && <EtapaImpostos entrada={entrada} atualizar={atualizar} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <AnimatePresence initial={false}>
            {etapa > 1 ? (
              <MotionButton key="voltar" variante="secondary" onClick={() => irPara(etapa - 1)}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                ← Voltar
              </MotionButton>
            ) : <span key="vazio" />}
          </AnimatePresence>
          {etapa < TOTAL_ETAPAS
            ? <MotionButton onClick={() => irPara(etapa + 1)}>Avançar →</MotionButton>
            : <MotionButton variante="success" onClick={finalizar}>Finalizar e ver proposta ✓</MotionButton>}
        </div>
      </motion.form>

      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
        <ResumoProposta
          entrada={entrada}
          resultado={resultado}
          onSalvar={salvar}
          onVisualizar={finalizar}
          onCopiarLink={() => copiar(`${window.location.origin}${window.location.pathname}?proposta=${codificar(entrada)}`, 'Link da proposta copiado!')}
          onCopiarJSON={() => copiar(JSON.stringify(criarProposta(entrada, resultado), null, 2), 'JSON da proposta copiado!')}
        />
        <Historico onAbrir={abrirDoHistorico} />
      </div>

      <PropostaModal aberto={modalAberto} onFechar={() => setModalAberto(false)} entrada={entrada} resultado={resultado} onSalvar={salvar} />
    </div>
  );
}
