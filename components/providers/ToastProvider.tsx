'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type TipoToast = 'success' | 'error' | 'info';
interface Toast { id: number; mensagem: string; tipo: TipoToast; acao?: { rotulo: string; onClick: () => void } }

const ToastContext = createContext<(mensagem: string, tipo?: TipoToast, acao?: Toast['acao']) => void>(() => {});

const CORES: Record<TipoToast, string> = {
  success: 'before:bg-success',
  error: 'before:bg-danger',
  info: 'before:bg-accent',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const proximoId = useRef(0);

  const fechar = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  const mostrar = useCallback((mensagem: string, tipo: TipoToast = 'success', acao?: Toast['acao']) => {
    const id = ++proximoId.current;
    setToasts(t => [...t.slice(-3), { id, mensagem, tipo, acao }]);
    setTimeout(() => fechar(id), acao ? 5000 : 3200);
  }, [fechar]);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.96, transition: { duration: 0.18 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.6 }}
              onDragEnd={(_, info) => { if (info.offset.x > 80) fechar(t.id); }}
              className={`pointer-events-auto relative flex cursor-grab items-center gap-3 overflow-hidden rounded-lg border border-line bg-surface py-3 pl-5 pr-3 text-sm text-fg shadow-lg shadow-black/20 before:absolute before:inset-y-0 before:left-0 before:w-1 active:cursor-grabbing ${CORES[t.tipo]}`}
            >
              <span className="flex-1">{t.mensagem}</span>
              {t.acao && (
                <button
                  type="button"
                  onClick={() => { t.acao!.onClick(); fechar(t.id); }}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/10"
                >
                  {t.acao.rotulo}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
