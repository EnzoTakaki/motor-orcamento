'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Tamanho = 'sm' | 'md' | 'lg';

const VARIANTES: Record<Variante, string> = {
  primary: 'bg-accent text-white shadow-[0_0_0_0_var(--accent)] hover:bg-accent-strong',
  secondary: 'bg-field text-fg border border-line hover:border-muted',
  ghost: 'text-muted hover:text-fg hover:bg-field',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/15',
  success: 'bg-success text-white',
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

// Brilho (glow) na cor da variante ao passar o mouse
const BRILHO: Record<Variante, string> = {
  primary: '0 8px 24px -6px color-mix(in srgb, var(--accent) 60%, transparent)',
  secondary: '0 6px 18px -8px rgba(0,0,0,.35)',
  ghost: 'none',
  danger: '0 8px 22px -8px color-mix(in srgb, var(--danger) 55%, transparent)',
  success: '0 8px 24px -6px color-mix(in srgb, var(--success) 60%, transparent)',
};

export interface MotionButtonProps extends HTMLMotionProps<'button'> {
  variante?: Variante;
  tamanho?: Tamanho;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(function MotionButton(
  { variante = 'primary', tamanho = 'md', className = '', disabled, type = 'button', children, ...props }, ref
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      // Elevação + brilho no hover, compressão sutil no clique
      whileHover={disabled ? undefined : { y: -2, boxShadow: BRILHO[variante] }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.96 }}
      whileFocus={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`relative inline-flex select-none items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
});
