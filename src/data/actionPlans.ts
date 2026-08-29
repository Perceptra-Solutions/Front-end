import type { ActionPlan } from '@/types'

export const actionPlans: ActionPlan[] = [
  {
    id: 'pa-0091', code: 'PA-0091', nonConformityId: 'nc-00127', nonConformityCode: 'NC-00127',
    title: 'Reescoramento do painel P-12 · PV-06',
    description: 'Reinstalar escoramento do painel P-12 e manter até completar 14 dias de cura, com liberação formal do engenheiro estrutural.',
    rootCause: 'Cronograma de desforma antecipado pela equipe de fôrmas sem consulta ao projeto estrutural.',
    responsible: 'Rafael Menezes', responsibleRole: 'Engenheiro estrutural', executor: 'Carlos Silva',
    priority: 'critical', status: 'in_progress', createdAt: '2026-08-28T15:10:00', deadline: '2026-08-29',
    cost: 8400, progress: 40, evidenceIds: ['ev-0231'],
    timeline: [
      { time: '14:55', date: '28/08', label: 'Detecção da IA', detail: 'Structural Watch v1.4 · confiança 93,3%', author: 'IA-MODEL-03', kind: 'ai' },
      { time: '15:04', date: '28/08', label: 'Triagem confirmada', detail: 'Ocorrência validada pelo engenheiro responsável', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '15:04', date: '28/08', label: 'NC-00127 criada', detail: 'Severidade crítica · prazo 29/08', author: 'Sistema', kind: 'system' },
      { time: '15:10', date: '28/08', label: 'Responsável designado', detail: 'Rafael Menezes · execução Carlos Silva', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '16:20', date: '28/08', label: 'Ação iniciada em campo', detail: 'Escoras reposicionadas em 6 de 15 pontos', author: 'Carlos Silva', kind: 'field' },
    ],
  },
  {
    id: 'pa-0090', code: 'PA-0090', nonConformityId: 'nc-00126', nonConformityCode: 'NC-00126',
    title: 'Desobstrução da rota de fuga · PV-02',
    description: 'Remover entulho da circulação, restabelecer largura mínima de 1,20 m e reforçar a sinalização da rota.',
    rootCause: 'Ausência de ponto de coleta de entulho no pavimento em execução de alvenaria.',
    responsible: 'Ana Souza', responsibleRole: 'Técnica de segurança', executor: 'João Costa',
    priority: 'high', status: 'in_progress', createdAt: '2026-08-28T16:25:00', deadline: '2026-08-30',
    cost: 600, progress: 65, evidenceIds: ['ev-0230'],
    timeline: [
      { time: '16:12', date: '28/08', label: 'Detecção da IA', detail: 'Site Monitoring v2.1 · confiança 89,5%', author: 'IA-MODEL-02', kind: 'ai' },
      { time: '16:20', date: '28/08', label: 'Triagem confirmada', detail: 'Obstrução real registrada em vistoria', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '16:25', date: '28/08', label: 'Responsável designado', detail: 'Ana Souza · execução João Costa', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '17:05', date: '28/08', label: 'Ação iniciada', detail: 'Retirada parcial com carrinho de entulho', author: 'João Costa', kind: 'field' },
    ],
  },
  {
    id: 'pa-0089', code: 'PA-0089', nonConformityId: 'nc-00125', nonConformityCode: 'NC-00125',
    title: 'Bloqueio e sinalização do quadro QD-SS01',
    description: 'Instalar cadeado de bloqueio, etiqueta de identificação e placa de advertência no quadro do subsolo.',
    rootCause: 'Manutenção elétrica executada sem procedimento de bloqueio e etiquetagem (LOTO).',
    responsible: 'Carlos Silva', responsibleRole: 'Encarregado de elétrica', executor: 'Diego Ramos',
    priority: 'critical', status: 'verification', createdAt: '2026-08-28T16:52:00', deadline: '2026-08-28',
    cost: 350, progress: 100, evidenceIds: ['ev-0229', 'ev-0228'],
    timeline: [
      { time: '16:41', date: '28/08', label: 'Detecção da IA', detail: 'Safety Detection v3.2 · confiança 92,8%', author: 'IA-MODEL-01', kind: 'ai' },
      { time: '16:49', date: '28/08', label: 'Triagem confirmada', detail: 'Risco elétrico confirmado', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '16:52', date: '28/08', label: 'Responsável designado', detail: 'Carlos Silva · execução Diego Ramos', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '17:18', date: '28/08', label: 'Evidência enviada', detail: 'Foto do quadro bloqueado e sinalizado', author: 'Diego Ramos', kind: 'field' },
      { time: '17:26', date: '28/08', label: 'Aguardando verificação', detail: 'Encaminhado para engenheiro verificador', author: 'Sistema', kind: 'system' },
    ],
  },
  {
    id: 'pa-0088', code: 'PA-0088', nonConformityId: 'nc-00123', nonConformityCode: 'NC-00123',
    title: 'Instalação de guarda-corpo e rodapé · Fachada Norte',
    description: 'Instalar guarda-corpo a 1,20 m, travessa intermediária a 0,70 m e rodapé de 0,20 m em toda a plataforma.',
    rootCause: 'Montagem do andaime liberada para uso antes da conclusão da proteção coletiva.',
    responsible: 'Ana Souza', responsibleRole: 'Técnica de segurança', executor: 'Equipe de montagem · Terceirizada Alfa',
    priority: 'critical', status: 'verification', createdAt: '2026-08-28T12:00:00', deadline: '2026-08-29',
    cost: 2100, progress: 100, evidenceIds: ['ev-0227', 'ev-0226'],
    timeline: [
      { time: '11:40', date: '28/08', label: 'Detecção da IA', detail: 'Safety Detection v3.2 · confiança 95,7%', author: 'IA-MODEL-01', kind: 'ai' },
      { time: '11:52', date: '28/08', label: 'Triagem confirmada', detail: 'Trabalho interditado no local', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '12:00', date: '28/08', label: 'Responsável designado', detail: 'Ana Souza · execução Terceirizada Alfa', author: 'Marcos Andrade', kind: 'engineer' },
      { time: '14:35', date: '28/08', label: 'Ação concluída', detail: 'Guarda-corpo e rodapé instalados nos 3 módulos', author: 'Equipe Alfa', kind: 'field' },
      { time: '15:02', date: '28/08', label: 'Evidência enviada', detail: '2 fotos + relatório de montagem', author: 'Ana Souza', kind: 'field' },
    ],
  },
  {
    id: 'pa-0087', code: 'PA-0087', nonConformityId: 'nc-00122', nonConformityCode: 'NC-00122',
    title: 'Sinalização do depósito de inflamáveis',
    description: 'Instalar placas de advertência, proibição de fumar e identificação de risco químico na entrada do depósito.',
    rootCause: 'Depósito remanejado sem atualização do plano de sinalização do canteiro.',
    responsible: 'João Costa', responsibleRole: 'Auxiliar de segurança', executor: 'João Costa',
    priority: 'low', status: 'done', createdAt: '2026-08-25T09:00:00', deadline: '2026-08-27',
    cost: 180, progress: 100, evidenceIds: ['ev-0225'],
    verifiedBy: 'Juliana Prado',
    verificationNote: 'Sinalização conferida em campo, conforme NR-26. Ocorrência encerrada.',
    timeline: [
      { time: '08:14', date: '25/08', label: 'NC registrada manualmente', detail: 'Vistoria de rotina no canteiro', author: 'Juliana Prado', kind: 'engineer' },
      { time: '09:00', date: '25/08', label: 'Responsável designado', detail: 'João Costa', author: 'Juliana Prado', kind: 'engineer' },
      { time: '11:20', date: '26/08', label: 'Ação concluída', detail: 'Placas instaladas conforme padrão', author: 'João Costa', kind: 'field' },
      { time: '15:48', date: '27/08', label: 'Evidência enviada', detail: 'Foto frontal do acesso ao depósito', author: 'João Costa', kind: 'field' },
      { time: '16:40', date: '27/08', label: 'Verificação aprovada', detail: 'NC-00122 encerrada', author: 'Juliana Prado', kind: 'engineer' },
    ],
  },
]

export const getActionPlanById = (id: string) => actionPlans.find((p) => p.id === id || p.code === id)
export const getActionPlanByNC = (ncId: string) => actionPlans.find((p) => p.nonConformityId === ncId)
