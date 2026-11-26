// Store do histórico em localStorage, compatível com useSyncExternalStore.
import type { Proposta } from './orcamento';

const CHAVE = 'motor-orcamento:historico';
const LIMITE = 200;
const VAZIO: Proposta[] = [];

let cache: Proposta[] | null = null;
const ouvintes = new Set<() => void>();

function ler(): Proposta[] {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) || '[]');
    return Array.isArray(bruto) ? bruto : VAZIO;
  } catch {
    return VAZIO;
  }
}

function gravar(lista: Proposta[]) {
  cache = lista.slice(0, LIMITE);
  try { localStorage.setItem(CHAVE, JSON.stringify(cache)); } catch { /* armazenamento indisponível */ }
  ouvintes.forEach(fn => fn());
}

export const historicoStore = {
  subscribe(fn: () => void) {
    ouvintes.add(fn);
    const aoMudarEmOutraAba = (e: StorageEvent) => { if (e.key === CHAVE) { cache = null; fn(); } };
    window.addEventListener('storage', aoMudarEmOutraAba);
    return () => { ouvintes.delete(fn); window.removeEventListener('storage', aoMudarEmOutraAba); };
  },
  getSnapshot(): Proposta[] {
    if (cache === null) cache = ler();
    return cache;
  },
  getServerSnapshot(): Proposta[] {
    return VAZIO;
  },
  adicionar(p: Proposta) { gravar([p, ...historicoStore.getSnapshot()]); },
  remover(id: string) { gravar(historicoStore.getSnapshot().filter(p => p.id !== id)); },
  restaurar(p: Proposta, indice: number) {
    const lista = [...historicoStore.getSnapshot()];
    lista.splice(Math.min(indice, lista.length), 0, p);
    gravar(lista);
  },
  limpar() { gravar([]); },
};
