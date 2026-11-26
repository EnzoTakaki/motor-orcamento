# Motor de Orçamento (Next.js + Tailwind + Framer Motion)

Calculadora de projetos de software (APF, IA, equipe, impostos e margem) com dashboard de propostas.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # gera o site estático em /out
```

## Estrutura

```
app/
  layout.tsx            Server Component: fontes, tema sem "piscar", Navbar e PageTransition
  page.tsx              Rota "/" (Calculadora)
  dashboard/page.tsx    Rota "/dashboard"
  globals.css           Tailwind v4 + tokens de cor (claro/escuro)
components/
  motion/
    PageTransition.tsx  Transição entre rotas (AnimatePresence + FrozenRouter)
    Stagger.tsx         StaggerGroup / StaggerItem: cascata com whileInView ou na montagem
    AnimatedNumber.tsx  Números que "rolam" até o novo valor
  ui/
    MotionButton.tsx    Botão com whileHover (elevação + brilho) e whileTap (compressão)
    Modal.tsx           Modal com scale up, backdrop com fade, ESC, clique fora e focus trap
    Campo.tsx           Label, input e select padronizados
  layout/Navbar.tsx     Abas com "pílula" animada (layoutId) e troca de tema animada
  providers/            Tema, toasts (arrastáveis para dispensar) e MotionConfig
  calculadora/          Wizard em 3 etapas, cards de módulo, resumo, histórico e modal da proposta
  dashboard/            Filtros, KPIs reordenáveis (drag), gráficos (Recharts) e tabela
lib/                    Lógica pura (sem React): cálculo, formatação, histórico, CSV, dados de exemplo
hooks/useHistorico.ts   Histórico do localStorage via useSyncExternalStore
```

## Onde está cada animação

| Requisito | Onde |
| --- | --- |
| Transição de páginas | `components/motion/PageTransition.tsx` (no `app/layout.tsx`) |
| Modais animados | `components/ui/Modal.tsx`, usado na proposta comercial e na confirmação de limpar histórico |
| Listas em cascata | Cards de módulo (`Etapas.tsx`), métricas do resumo, gráficos do dashboard (`whileInView`), linhas da tabela |
| Botões interativos | `components/ui/MotionButton.tsx` em toda a interface |
| Gestos | Arrastar item do histórico para a esquerda para excluir (com Desfazer), reordenar KPIs pela alça, arrastar toast para dispensar |

Todas as animações respeitam a opção "reduzir movimento" do sistema (`MotionConfig reducedMotion="user"`).

## Observação sobre a transição de páginas

O App Router troca o conteúdo da rota assim que a URL muda, o que corta a animação de saída.
O `FrozenRouter` congela o contexto do roteador da página que está saindo usando
`LayoutRouterContext`, um import interno do Next.js. Ao atualizar o Next.js, confira se a transição continua funcionando.

## Hospedar de graça

O build é estático (`output: 'export'`), então a pasta `out/` funciona em qualquer hospedagem estática:

- **Vercel** ou **Netlify**: importe o repositório do GitHub; o build é detectado automaticamente.
- **GitHub Pages**: rode `NEXT_PUBLIC_BASE_PATH=/nome-do-repositorio npm run build` e publique a pasta `out/`.
