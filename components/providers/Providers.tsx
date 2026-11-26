'use client';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": respeita "reduzir movimento" do sistema operacional
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
