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

**Todo dado vem do backend.** Não há mais mock: a pasta `src/data` foi removida e cada tela consome a
API real (`src/lib/api/`). O estado compartilhado da operação vive num store React
(`src/store/AppStore.tsx`), que carrega usuário, obra, câmeras, modelos, detecções, NCs e evidências
numa passada só.

Onde o backend genuinamente não tem o dado, a tela **diz isso** em vez de preencher com um valor
plausível — numa tela de gestão, número inventado é indistinguível de medição errada.

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
| `/reports` | Relatórios | **Indicadores reais de `/painel/resumo`**, emissão de relatório PBQP-H (snapshot congelado + SHA-256), lista dos emitidos com download e conferência de integridade, e quatro gráficos derivados de dado real |
| `/works` | Obras e Locais | Obras cadastradas com NCs em aberto, parque de câmeras, locais e período previsto |
| `/cameras` | Câmeras | Parque real com modelo de IA vinculado e heartbeat + **provisionamento** (emitir/revogar credencial, gravar URL de stream cifrada) |
| `/users` | Usuários e Papéis | Equipe real com NCs sob responsabilidade e a regra de segregação executor × verificador |
| `/standards` | Requisitos e Normas | Requisitos agrupados por norma, com as NCs que citam cada item |
| `/ai-models` | Modelos de IA | Versões publicadas, limiar, hash do artefato, métricas do treino e **taxa real de falso positivo** |
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
  hooks/             useRecurso (carregamento com loading/erro/cancelamento)
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

### Dados

Tudo vem da API. Suba o backend (`docker compose up -d --build` e `npm run db:seed`) antes de abrir o
front — sem ele as telas mostram o estado de erro com a mensagem real da API, não uma tela vazia.

Os indicadores são derivados do banco: confirmar ou descartar uma detecção muda os números na hora,
porque a tela relê do backend.

**O que foi removido por não existir no schema** (cada tela traz a nota correspondente): avanço físico
e área da obra, índice de conformidade mensal, MTTR mensal, série de falso positivo por semana,
latência de inferência, IP/resolução/FPS de câmera, último acesso de usuário, vínculo usuário↔obra e o
papel AUDITOR.

### Papéis e o que cada um pode fazer

Nenhum usuário do seed faz tudo — isso é o backend aplicando papéis de verdade:

| Usuário | Papel | Faz | Não faz |
|---|---|---|---|
| `ana@perceptra.dev` | ENGENHEIRO | tria detecção, cria plano de ação | emitir relatório, provisionar câmera |
| `bruno@perceptra.dev` | ENGENHEIRO | verifica a ação da Ana (segregação de função) | — |
| `gestora@perceptra.dev` | GESTOR | emite relatório, provisiona câmera, cancela NC | triar detecção |

O front mostra a ação **desabilitada com o motivo** em vez de deixar clicar e tomar 403. Troque
`VITE_DEMO_EMAIL` para alternar de persona.

---

## Observações técnicas

- Alias `@` aponta para `src/` (configurado em `vite.config.ts` e `tsconfig.json`).
- As fontes (Space Grotesk e JetBrains Mono) são empacotadas pelo próprio projeto via `@fontsource`
  e importadas em `src/main.tsx` — nada é baixado em tempo de execução, então a tipografia fica correta
  mesmo sem internet na hora da apresentação.
- A paleta dos gráficos foi validada para daltonismo e contraste; as cores categóricas são atribuídas em
  ordem fixa e as cores de estado nunca são reaproveitadas como série.
- `prefers-reduced-motion` desliga as animações.
