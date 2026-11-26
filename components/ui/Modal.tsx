'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  largura?: 'sm' | 'md' | 'lg';
}

const LARGURAS = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Modal({ aberto, onFechar, titulo, descricao, children, rodape, largura = 'md' }: ModalProps) {
  const [montado, setMontado] = useState(false);
  const painelRef = useRef<HTMLDivElement>(null);
  const focoAnterior = useRef<HTMLElement | null>(null);
  const idTitulo = useId();
  const idDescricao = useId();

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!aberto) return;
    focoAnterior.current = document.activeElement as HTMLElement;

    // Trava a rolagem do fundo enquanto o modal está aberto
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onFechar(); }
      // Mantém o foco do teclado dentro do modal (focus trap)
      if (e.key === 'Tab' && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focaveis.length) return;
        const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    };
    document.addEventListener('keydown', aoTeclar);
    const t = setTimeout(() => painelRef.current?.focus(), 50);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
      focoAnterior.current?.focus?.();
    };
  }, [aberto, onFechar]);

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          {/* Backdrop: fade + desfoque. Clique fora fecha. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onFechar}
          />
          {/* Painel: scale up + leve subida */}
          <motion.div
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            aria-describedby={descricao ? idDescricao : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } }}
            exit={{ opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.18, ease: 'easeIn' } }}
            className={`relative flex max-h-[92dvh] w-full ${LARGURAS[largura]} flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl outline-none sm:rounded-2xl`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div>
                <h2 id={idTitulo} className="text-base font-semibold text-fg">{titulo}</h2>
                {descricao && <p id={idDescricao} className="mt-0.5 text-sm text-muted">{descricao}</p>}
              </div>
              <motion.button
                type="button"
                onClick={onFechar}
                aria-label="Fechar"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-field hover:text-fg"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </motion.button>
            </header>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {rodape && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{rodape}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
