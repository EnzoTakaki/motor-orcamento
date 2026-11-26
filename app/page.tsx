import { Calculadora } from '@/components/calculadora/Calculadora';

// Server Component: a página só compõe; a interatividade fica no Client Component.
export default function PaginaCalculadora() {
  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Calculadora de Esforço, APF & Custos de IA</h1>
        <p className="mx-auto mt-2 max-w-2xl text-balance text-sm text-muted sm:text-base">
          Precificação técnica com Análise de Pontos de Função, aceleração por IA e adequação ao porte do cliente.
        </p>
      </header>
      <Calculadora />
    </>
  );
}
