'use client';
import { useSyncExternalStore } from 'react';
import { historicoStore } from '@/lib/historico';

export function useHistorico() {
  return useSyncExternalStore(historicoStore.subscribe, historicoStore.getSnapshot, historicoStore.getServerSnapshot);
}
