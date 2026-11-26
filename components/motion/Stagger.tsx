'use client';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

// Variantes reutilizáveis para listas e grids em cascata
export const containerStagger = (atraso = 0.06, inicio = 0.05): Variants => ({
  oculto: {},
  visivel: { transition: { staggerChildren: atraso, delayChildren: inicio } },
});

export const itemStagger: Variants = {
  oculto: { opacity: 0, y: 16, scale: 0.98 },
  visivel: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

type StaggerGroupProps = HTMLMotionProps<'div'> & {
  /** 'viewport' anima quando entra na tela (whileInView); 'montagem' anima ao montar */
  gatilho?: 'viewport' | 'montagem';
  atraso?: number;
};

export function StaggerGroup({ gatilho = 'viewport', atraso = 0.06, children, ...props }: StaggerGroupProps) {
  const animacao = gatilho === 'viewport'
    ? { whileInView: 'visivel', viewport: { once: true, amount: 0.15 } }
    : { animate: 'visivel' };
  return (
    <motion.div variants={containerStagger(atraso)} initial="oculto" {...animacao} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return <motion.div variants={itemStagger} {...props}>{children}</motion.div>;
}
