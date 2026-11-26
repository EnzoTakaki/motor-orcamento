import type { Moeda } from './orcamento';

export const MOEDAS: Record<Moeda, { taxa: number; locale: string; rotulo: string }> = {
  BRL: { taxa: 1, locale: 'pt-BR', rotulo: 'Real (R$)' },
  USD: { taxa: 0.2, locale: 'en-US', rotulo: 'Dólar ($)' },
  EUR: { taxa: 0.18, locale: 'de-DE', rotulo: 'Euro (€)' },
};

export function formatarMoeda(valorBrl: number, moeda: Moeda = 'BRL', compacto = false) {
  const cfg = MOEDAS[moeda] ?? MOEDAS.BRL;
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency', currency: moeda,
    ...(compacto ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
  }).format((valorBrl || 0) * cfg.taxa);
}

export const formatarNumero = (v: number, casas = 0) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: casas }).format(v || 0);

export const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');
