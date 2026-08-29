import type { NonConformity } from '@/types'

/** Não conformidades da obra Residencial Horizonte. */
export const nonConformities: NonConformity[] = [
  {
    id: 'nc-00127', code: 'NC-00127', title: 'Escoramento removido antes do prazo',
    description: 'Escoras do painel P-12 retiradas com 9 dias de cura, contra os 14 dias previstos em projeto estrutural.',
    blockCode: 'BLOCO A', locationCode: 'PV-06', locationLabel: 'Pavimento 06', severity: 'critical', status: 'open',
    responsible: 'Rafael Menezes', responsibleRole: 'Engenheiro estrutural', openedAt: '2026-08-28T15:04:31',
    deadline: '2026-08-29', origin: 'ai', alertId: 'alt-0833', standardRef: 'NBR 15575 · 7.2',
    standardTitle: 'Desempenho estrutural — estabilidade e resistência', cost: 8400, actionPlanId: 'pa-0091',
  },
  {
    id: 'nc-00126', code: 'NC-00126', title: 'Rota de fuga obstruída por entulho',
    description: 'Acúmulo de entulho na circulação junto à escada de emergência, reduzindo a largura útil da rota.',
    blockCode: 'BLOCO A', locationCode: 'PV-02', locationLabel: 'Pavimento 02', severity: 'warning', status: 'in_progress',
    responsible: 'Ana Souza', responsibleRole: 'Técnica de segurança', openedAt: '2026-08-28T16:20:44',
    deadline: '2026-08-30', origin: 'ai', alertId: 'alt-0836', standardRef: 'NR-18 · 18.30.2',
    standardTitle: 'Proteção contra incêndio — rotas de fuga', cost: 600, actionPlanId: 'pa-0090',
  },
  {
    id: 'nc-00125', code: 'NC-00125', title: 'Quadro elétrico sem bloqueio',
    description: 'Quadro de distribuição QD-SS01 aberto, sem cadeado e sem sinalização de manutenção em andamento.',
    blockCode: 'SUBSOLO', locationCode: 'SS-01', locationLabel: 'Subsolo 01', severity: 'critical', status: 'in_progress',
    responsible: 'Carlos Silva', responsibleRole: 'Encarregado de elétrica', openedAt: '2026-08-28T16:49:02',
    deadline: '2026-08-28', origin: 'ai', alertId: 'alt-0837', standardRef: 'NR-10 · 10.3.9',
    standardTitle: 'Segurança em instalações elétricas — bloqueio e sinalização', cost: 350, actionPlanId: 'pa-0089',
  },
  {
    id: 'nc-00124', code: 'NC-00124', title: 'Ausência de EPI em área operacional',
    description: 'Colaborador sem capacete em laje com movimentação de carga suspensa, identificado pela CAM-07.',
    blockCode: 'BLOCO A', locationCode: 'PV-04', locationLabel: 'Pavimento 04', severity: 'critical', status: 'open',
    responsible: 'Carlos Silva', responsibleRole: 'Encarregado de obra', openedAt: '2026-08-28T09:41:00',
    deadline: '2026-08-30', origin: 'ai', standardRef: 'NR-18 · 18.23.1',
    standardTitle: 'Equipamentos de proteção individual na construção', cost: 0, recurrenceOf: 'NC-00118',
  },
  {
    id: 'nc-00123', code: 'NC-00123', title: 'Andaime sem guarda-corpo',
    description: 'Plataforma do andaime fachadeiro no nível +18,60 m sem guarda-corpo e rodapé instalados.',
    blockCode: 'BLOCO B', locationCode: 'FCH-N', locationLabel: 'Fachada Norte', severity: 'critical', status: 'verification',
    responsible: 'Ana Souza', responsibleRole: 'Técnica de segurança', openedAt: '2026-08-28T11:52:38',
    deadline: '2026-08-30', origin: 'ai', alertId: 'alt-0829', standardRef: 'NR-18 · 18.15.6',
    standardTitle: 'Andaimes e plataformas de trabalho', cost: 2100, actionPlanId: 'pa-0088',
  },
  {
    id: 'nc-00122', code: 'NC-00122', title: 'Sinalização de segurança insuficiente',
    description: 'Ausência de placas de advertência na entrada da área de armazenamento de inflamáveis.',
    blockCode: 'BLOCO B', locationCode: 'ST-INF', locationLabel: 'Depósito de inflamáveis', severity: 'info', status: 'resolved',
    responsible: 'João Costa', responsibleRole: 'Auxiliar de segurança', openedAt: '2026-08-25T08:14:22',
    deadline: '2026-08-27', closedAt: '2026-08-27T16:40:11', origin: 'manual', standardRef: 'NR-26 · 26.1',
    standardTitle: 'Sinalização de segurança', cost: 180, actionPlanId: 'pa-0087',
  },
  {
    id: 'nc-00121', code: 'NC-00121', title: 'Material estocado fora da área delimitada',
    description: 'Blocos cerâmicos estocados sobre via de circulação de pedestres no pátio externo.',
    blockCode: 'PÁTIO', locationCode: 'ST-EXT', locationLabel: 'Pátio externo', severity: 'warning', status: 'in_progress',
    responsible: 'Ana Souza', responsibleRole: 'Técnica de segurança', openedAt: '2026-08-27T14:02:19',
    deadline: '2026-09-02', origin: 'ai', standardRef: 'NR-18 · 18.24.1',
    standardTitle: 'Armazenamento e manuseio de materiais', cost: 420,
  },
  {
    id: 'nc-00120', code: 'NC-00120', title: 'Infiltração em parede de divisa',
    description: 'Manchas de umidade recorrentes na parede da divisa leste do Bloco C, sem estanqueidade adequada.',
    blockCode: 'BLOCO C', locationCode: 'PV-01', locationLabel: 'Bloco C · Pavimento 01', severity: 'warning', status: 'open',
    responsible: 'Juliana Prado', responsibleRole: 'Engenheira de qualidade', openedAt: '2026-08-26T10:35:47',
    deadline: '2026-09-05', origin: 'manual', standardRef: 'NBR 15575 · 10.2',
    standardTitle: 'Estanqueidade à água de vedações verticais', cost: 5600, recurrenceOf: 'NC-00109',
  },
]

export const getNonConformityById = (id: string) => nonConformities.find((n) => n.id === id || n.code === id)
export const openNonConformities = () => nonConformities.filter((n) => n.status !== 'resolved')
