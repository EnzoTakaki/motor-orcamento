'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useContext, useRef } from 'react';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/*
 * No App Router, a página antiga é trocada pela nova assim que a rota muda,
 * o que impede o AnimatePresence de animar a saída (causa o "flicker").
 * O FrozenRouter congela o contexto do roteador da página que está saindo,
 * para ela continuar renderizando o conteúdo antigo durante o exit.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const contexto = useContext(LayoutRouterContext);
  const congelado = useRef(contexto).current;
  return <LayoutRouterContext.Provider value={congelado}>{children}</LayoutRouterContext.Provider>;
}

const variantes = {
  inicial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visivel: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  saida: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
} as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0 })}>
      <motion.div key={pathname} variants={variantes} initial="inicial" animate="visivel" exit="saida">
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
