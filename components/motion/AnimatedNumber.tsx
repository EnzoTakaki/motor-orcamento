'use client';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

// Número que "rola" até o novo valor quando muda (ex.: preço final da proposta)
export function AnimatedNumber({ valor, formatar, className }: { valor: number; formatar: (v: number) => string; className?: string }) {
  const mv = useMotionValue(valor);
  const texto = useTransform(mv, v => formatar(v));

  useEffect(() => {
    const controle = animate(mv, valor, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
    return () => controle.stop();
  }, [valor, mv]);

  return <motion.span className={className}>{texto}</motion.span>;
}
