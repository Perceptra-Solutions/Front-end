# PERCEPTRA

**Inteligência para a operação da sua obra.**

Plataforma de gestão inteligente de obras de engenharia civil: câmeras + visão computacional detectam
riscos no canteiro, o engenheiro faz a triagem, e a ocorrência confirmada percorre um ciclo rastreável
até o fechamento.

> A IA **recomenda**. O engenheiro **decide**. Nenhuma não conformidade é aberta ou fechada sem uma
> pessoa com CREA assinando embaixo — é isso que sustenta a auditoria.

---

## Como rodar

Requisitos: **Node.js 18+** (recomendado 20 ou 22) e npm. O gêmeo digital usa WebGL — qualquer
navegador atual atende.

```bash
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173` e abre o navegador automaticamente.

Outros comandos:

```bash
npm run build     # checagem de tipos + build de produção em dist/
npm run preview   # serve o build de produção
npm run lint      # apenas a checagem de tipos (tsc --noEmit)
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Base | React 18 + TypeScript + Vite 5 |
| Estilo | Tailwind CSS 3 (design tokens próprios) |
| Componentes | shadcn/ui — primitivos Radix escritos no projeto (`src/components/ui`) |
| Ícones | Lucide React |
| Rotas | React Router 6 |
| Gráficos | Recharts |
| 3D | three.js (WebGL) — apenas no gêmeo digital |

Sem back-end: os dados são mockados em `src/data` e o estado da operação vive em um store React
(`src/store/AppStore.tsx`), o que permite executar o fluxo completo durante a apresentação.

---

## O fluxo que a demonstração precisa mostrar

```
IA DETECTA  →  ENGENHEIRO ANALISA  →  DECISÃO HUMANA  →  NÃO CONFORMIDADE
       →  PLANO DE AÇÃO  →  EVIDÊNCIA  →  VERIFICAÇÃO  →  RESOLVIDA
```

### Roteiro sugerido (≈ 3 minutos)

1. **Visão Geral** — os quatro indicadores da obra e o aviso vermelho de ocorrência crítica sem triagem.
2. Clicar em **Analisar** no alerta `ALT-2026-0841` (Ausência de EPI, CAM-07, PV-04, 96,4%).
3. **Análise da detecção** — frame com as *bounding boxes*, `PERSON 96.4%` / `HELMET 12.3%`, a confiança
   comparada ao limiar do modelo e o painel **Decisão do engenheiro**.
4. Clicar em **Confirmar ocorrência** → escolher severidade, responsável e prazo → o sistema abre a
   **NC-00128** e vincula o frame como evidência.
5. Ir em **Não Conformidades**, abrir a NC recém-criada → **Criar plano de ação** (executor, causa raiz,
   prazo, custo).
6. No mesmo painel: **Anexar evidência** → **Enviar para verificação**.
7. **Verificar e fechar** → comparação antes/depois + parecer → **Aprovar** → a NC vira **RESOLVIDA** e a
   linha do ciclo fecha em verde.

O botão de recarregar na barra superior (ícone ⟳, ao lado de "última atualização") **reinicia a
demonstração** com os dados originais — útil entre uma apresentação e outra.

---

## Telas

| Rota | Tela | O que mostra |
|---|---|---|
| `/dashboard` | Visão Geral | KPIs da obra, alertas recentes, situação da obra, modelos de IA, NCs em aberto |
| `/alerts` | Central de Alertas | Fila de detecções com filtros por status, severidade, categoria e câmera |
| `/alerts/:id` | Análise da Detecção | Frame com bounding boxes, leitura do modelo e a decisão do engenheiro |
| `/monitoring` | Monitoramento | Mural de câmeras ao vivo (2×, 3×, 4×) e visualização ampliada |
| `/map` | Mapa da Obra | Planta do canteiro com setores, área restrita e câmeras posicionadas |
| `/digital-twin` | Gêmeo Digital | Maquete 3D do Bloco A: sobe da planta até a cobertura e gira com o mouse |
| `/non-conformities` | Não Conformidades | Tabela profissional + ficha lateral com o ciclo completo |
| `/action-plans` | Planos de Ação | Lista, detalhe, timeline da execução e evidências |
| `/evidence` | Evidências | Galeria por tipo (foto, vídeo, câmera, documento) com hash de integridade |
| `/reports` | Relatórios | Sete gráficos Recharts: conformidade, categorias, tipos, MTTR, câmeras, falsos positivos, modelos |
| `/works` | Obras e Locais | Três empreendimentos com avanço físico, conformidade e parque de câmeras |
| `/cameras` | Câmeras | Ficha técnica dos 20 equipamentos e o modelo de IA vinculado |
| `/users` | Usuários e Papéis | Equipe e a regra de segregação executor × verificador |
| `/standards` | Requisitos e Normas | NR-18, NR-35, NR-10, NR-06 e NBR 15575 com itens e ocorrências |
| `/ai-models` | Modelos de IA | Precision, recall, F1, limiar de confiança e taxa de falsos positivos |
| `/settings` · `/profile` | Configurações · Perfil | Preferências da obra e registro do responsável técnico |

---

## Estrutura

```
src/
  components/
    layout/          AppLayout, Sidebar (expandida/recolhida), Topbar, Logo, nav
    dashboard/       KpiCard, WorkProgressPanel, ModelStatusPanel, DetectionActivityChart
    alerts/          AlertCard
    cameras/         CameraScene (cena sintética), DetectionFrame (HUD + boxes), CameraTile
    map/             SitePlan (planta baixa em SVG)
    twin/            HologramBuilding (maquete 3D em canvas) + geometry (modelo do bloco)
    nonconformities/ NCTable, NCDetailDrawer (ciclo completo da NC)
    action-plans/    EventTimeline
    reports/         ChartFrame, ChartTooltip
    shared/          PageHeader, StatusBadge, FlowTimeline
    ui/              primitivos shadcn/ui: button, card, badge, table, dialog, drawer,
                     tabs, tooltip, input, select, progress, separator, avatar, switch,
                     dropdown-menu
  pages/             uma tela por rota
  data/              dados mockados da obra (alertas, câmeras, NCs, planos, normas…)
  types/             contratos de domínio
  store/             AppStore (estado vivo da operação) e toast
  lib/               utils (datas, formatação) e chartTheme (paleta dos gráficos)
```

---

## Identidade visual

Central de operações de obra, não dashboard SaaS genérico:

- **Cores** — azul marinho (`navy`) na navegação, azul técnico (`technical`) nas ações, cinza grafite
  (`graphite`) no texto e nas superfícies. Vermelho, laranja, verde e azul aparecem **só** como estado
  (crítico, atenção, resolvido, informação).
- **Tipografia** — Space Grotesk nos títulos e no texto (geométrica, cara de produto de tecnologia),
  JetBrains Mono em todo identificador técnico: `CAM-07`, `PV-04`, `NC-00124`, `IND-CONF-01`,
  `REQ-NR18-042`.
- **Elementos de projeto** — malha de papel milimetrado ao fundo, marcações de canto nos indicadores,
  hachura nas áreas restritas, eixos, cotas e rosa dos ventos na planta, cones de visão nas câmeras.
- **Imagem das câmeras** — as cenas do canteiro são desenhadas em SVG (`CameraScene`), com HUD, timestamp
  e as caixas de detecção sobrepostas. Nenhuma imagem externa: o projeto roda offline depois do
  `npm install`.
- **Gêmeo digital** — modelo 3D em WebGL (three.js) na escala real da obra: 26 × 16 m de projeção,
  pé-direito de 3,00 m e 40,60 m de altura total. Geometria 100% procedural (`src/components/twin/geometry.ts`):
  fundação, térreo em pilotis, 12 pavimentos com laje aparente, pele de vidro, montantes e sacada,
  empena cega lateral, casa de máquinas, reservatório e antena — mais calçada, árvores e veículos que
  dão escala. Iluminação de fim de tarde com sol direcional e sombra projetada (PCF soft), reflexo de
  ambiente via PMREM, tone mapping ACES filmic. Nenhum arquivo de modelo externo.

### Dados mockados

18 alertas · 20 câmeras · 8 não conformidades · 5 planos de ação · 12 evidências · 3 obras · 5 usuários ·
3 modelos de IA · 5 normas — todos com nomenclatura real de canteiro.

Os indicadores do painel são **derivados dos dados**, não fixos: confirmar ou descartar uma detecção
muda os números na hora.

---

## Observações técnicas

- Alias `@` aponta para `src/` (configurado em `vite.config.ts` e `tsconfig.json`).
- As fontes (Space Grotesk e JetBrains Mono) são empacotadas pelo próprio projeto via `@fontsource`
  e importadas em `src/main.tsx` — nada é baixado em tempo de execução, então a tipografia fica correta
  mesmo sem internet na hora da apresentação.
- A paleta dos gráficos foi validada para daltonismo e contraste; as cores categóricas são atribuídas em
  ordem fixa e as cores de estado nunca são reaproveitadas como série.
- `prefers-reduced-motion` desliga as animações.
