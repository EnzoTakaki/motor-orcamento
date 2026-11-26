'use client';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { formatarData, formatarMoeda, formatarNumero } from '@/lib/formatar';
import { NIVEIS, REGIMES, SLAS, type Entrada, type Resultado } from '@/lib/orcamento';
import { containerStagger, itemStagger } from '@/components/motion/Stagger';
import { useToast } from '@/components/providers/ToastProvider';
import { MotionButton } from '@/components/ui/MotionButton';
import { Modal } from '@/components/ui/Modal';

interface Props { aberto: boolean; onFechar: () => void; entrada: Entrada; resultado: Resultado; onSalvar: () => void }

export function PropostaModal({ aberto, onFechar, entrada, resultado: r, onSalvar }: Props) {
  const documentoRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);
  const toast = useToast();
  const m = (v: number) => formatarMoeda(v, entrada.moeda);
  const hoje = new Date();
  const validade = new Date(hoje.getTime() + 15 * 864e5);

  const baixarPDF = async () => {
    if (!documentoRef.current) return;
    setGerando(true);
    try {
      // Import dinâmico: a biblioteca de PDF só é baixada quando o usuário pede
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: 10,
        filename: `Proposta_${(entrada.cliente || 'Cliente').replace(/\s+/g, '_')}_${hoje.toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(documentoRef.current).save();
      toast('PDF gerado com sucesso!');
    } catch {
      toast('Não foi possível gerar o PDF.', 'error');
    } finally {
      setGerando(false);
    }
  };

  const linha = 'flex justify-between gap-4 border-b border-slate-200 py-1.5 text-sm';

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Proposta comercial"
      descricao="Confira o documento antes de enviar ao cliente."
      largura="lg"
      rodape={
        <>
          <MotionButton variante="secondary" onClick={onSalvar}>💾 Salvar no histórico</MotionButton>
          <MotionButton onClick={baixarPDF} disabled={gerando}>
            {gerando ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="inline-block size-4 rounded-full border-2 border-white/40 border-t-white" />
            ) : '📄'}
            {gerando ? 'Gerando…' : 'Baixar PDF'}
          </MotionButton>
        </>
      }
    >
      {/* O documento é sempre claro (papel), independente do tema da interface */}
      <motion.div
        ref={documentoRef}
        variants={containerStagger(0.07, 0.12)}
        initial="oculto"
        animate="visivel"
        className="rounded-lg bg-white p-6 text-slate-800 shadow-inner"
      >
        <motion.header variants={itemStagger} className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b-2 border-sky-600 pb-4">
          <div>
            <p className="text-xl font-extrabold text-sky-600">bit<span className="text-amber-500">⚡</span>ar <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">solutions</span></p>
            <h3 className="mt-1 text-lg font-bold">Proposta de desenvolvimento de software</h3>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Emitida em {formatarData(hoje.toISOString())}</p>
            <p>Válida até {formatarData(validade.toISOString())}</p>
          </div>
        </motion.header>

        <motion.section variants={itemStagger} className="mb-4 grid gap-1 sm:grid-cols-2">
          <p className="text-sm"><span className="text-slate-500">Cliente:</span> <strong>{entrada.cliente || '—'}</strong></p>
          <p className="text-sm"><span className="text-slate-500">Sistema:</span> <strong>{entrada.projeto || '—'}</strong></p>
          <p className="text-sm"><span className="text-slate-500">Porte:</span> {r.porte.rotulo}</p>
          <p className="text-sm"><span className="text-slate-500">Liderança:</span> {NIVEIS.find(n => n.valor === entrada.nivel)?.rotulo ?? '—'}</p>
        </motion.section>

        <motion.section variants={itemStagger} className="mb-4">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">1. Escopo</h4>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-300 text-left text-xs text-slate-500"><th className="py-1">Módulo</th><th className="py-1 text-right">PF</th><th className="py-1 text-right">Horas</th></tr></thead>
            <tbody>
              {r.modulos.map(mod => (
                <tr key={mod.id} className="border-b border-slate-100"><td className="py-1">{mod.nome}</td><td className="py-1 text-right tabular-nums">{mod.pf}</td><td className="py-1 text-right tabular-nums">{mod.horas}h</td></tr>
              ))}
              <tr className="font-semibold"><td className="py-1">Total</td><td className="py-1 text-right tabular-nums">{r.totalPF}</td><td className="py-1 text-right tabular-nums">{r.horasBrutas}h</td></tr>
            </tbody>
          </table>
          <p className="mt-1 text-xs text-slate-500">Com automação por IA de {Math.round(entrada.fatorIA * 100)}%, a equipe executa {formatarNumero(r.horasFinais)}h em cerca de {r.prazoSemanas} semana(s).</p>
        </motion.section>

        <motion.section variants={itemStagger} className="mb-4">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">2. Investimento</h4>
          <div className={linha}><span>Desenvolvimento</span><span className="tabular-nums">{m(r.custoAjustadoPorte + r.valorLucro)}</span></div>
          <div className={linha}><span>Impostos ({REGIMES.find(x => x.valor === entrada.aliquota)?.rotulo})</span><span className="tabular-nums">{m(r.valorImposto)}</span></div>
          <div className="flex justify-between gap-4 py-2 text-base font-bold text-emerald-700"><span>Investimento total</span><span className="tabular-nums">{m(r.precoFinal)}</span></div>
        </motion.section>

        <motion.section variants={itemStagger} className="mb-4">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">3. Condições de pagamento</h4>
          <div className={linha}><span>30% na assinatura (kickoff)</span><span className="tabular-nums">{m(r.parcelas.kickoff)}</span></div>
          <div className={linha}><span>40% na homologação</span><span className="tabular-nums">{m(r.parcelas.homologacao)}</span></div>
          <div className={linha}><span>30% na entrega</span><span className="tabular-nums">{m(r.parcelas.entrega)}</span></div>
        </motion.section>

        <motion.section variants={itemStagger}>
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">4. Custos mensais recorrentes</h4>
          <div className={linha}><span>Suporte ({SLAS.find(s => s.valor === entrada.criticidade)?.rotulo})</span><span className="tabular-nums">{m(r.valorSLA)}</span></div>
          <div className={linha}><span>Cloud + tokens de IA</span><span className="tabular-nums">{m(r.recorrenteCloud)}</span></div>
        </motion.section>
      </motion.div>
    </Modal>
  );
}
