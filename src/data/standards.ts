import type { Standard } from '@/types'

export const standards: Standard[] = [
  {
    id: 'std-01', code: 'REQ-NR18-042', ref: 'NR-18', title: 'Segurança e Saúde no Trabalho na Indústria da Construção',
    description: 'Condições e meio ambiente de trabalho na indústria da construção: proteção coletiva, EPI, circulação e armazenamento.',
    category: 'seguranca', status: 'atencao', occurrences: 34, openOccurrences: 4,
    lastVerification: '2026-08-28T11:52:38', responsible: 'Ana Souza',
    items: [
      { ref: '18.23.1', text: 'Fornecimento e uso obrigatório de EPI adequado ao risco' },
      { ref: '18.15.6', text: 'Andaimes com guarda-corpo, travessa intermediária e rodapé' },
      { ref: '18.24.1', text: 'Armazenamento de materiais sem obstruir circulação' },
      { ref: '18.30.2', text: 'Rotas de fuga sinalizadas e desobstruídas' },
    ],
  },
  {
    id: 'std-02', code: 'REQ-NR35-011', ref: 'NR-35', title: 'Trabalho em Altura',
    description: 'Requisitos de proteção para atividades acima de 2,00 m com risco de queda: análise de risco, sistemas de ancoragem e permissão de trabalho.',
    category: 'seguranca', status: 'nao_conforme', occurrences: 12, openOccurrences: 2,
    lastVerification: '2026-08-28T16:58:12', responsible: 'Ana Souza',
    items: [
      { ref: '35.5.1', text: 'Sistema de proteção contra quedas obrigatório acima de 2,00 m' },
      { ref: '35.4.5', text: 'Permissão de trabalho emitida antes da atividade' },
      { ref: '35.5.3', text: 'Pontos de ancoragem inspecionados antes do uso' },
    ],
  },
  {
    id: 'std-03', code: 'REQ-NR10-007', ref: 'NR-10', title: 'Segurança em Instalações e Serviços em Eletricidade',
    description: 'Medidas de controle e sistemas preventivos em instalações elétricas, incluindo bloqueio, sinalização e desenergização.',
    category: 'eletrica', status: 'atencao', occurrences: 9, openOccurrences: 1,
    lastVerification: '2026-08-28T16:49:02', responsible: 'Carlos Silva',
    items: [
      { ref: '10.3.9', text: 'Instalações com bloqueio e sinalização durante manutenção' },
      { ref: '10.11.2', text: 'Instalações provisórias protegidas mecanicamente' },
    ],
  },
  {
    id: 'std-04', code: 'REQ-NR06-003', ref: 'NR-06', title: 'Equipamento de Proteção Individual',
    description: 'Obrigações quanto ao fornecimento, uso, guarda e higienização dos equipamentos de proteção individual.',
    category: 'seguranca', status: 'conforme', occurrences: 21, openOccurrences: 0,
    lastVerification: '2026-08-27T09:30:00', responsible: 'Ana Souza',
    items: [
      { ref: '6.3', text: 'Fornecimento gratuito de EPI adequado ao risco da atividade' },
      { ref: '6.6.1', text: 'Registro de entrega e treinamento de uso' },
    ],
  },
  {
    id: 'std-05', code: 'REQ-NBR15575-028', ref: 'NBR 15575', title: 'Desempenho de Edificações Habitacionais',
    description: 'Requisitos de desempenho estrutural, térmico, acústico e de estanqueidade ao longo da vida útil da edificação.',
    category: 'desempenho', status: 'atencao', occurrences: 17, openOccurrences: 2,
    lastVerification: '2026-08-28T15:04:31', responsible: 'Juliana Prado',
    items: [
      { ref: '7.2', text: 'Estabilidade e resistência estrutural em uso e execução' },
      { ref: '10.2', text: 'Estanqueidade à água de vedações verticais externas' },
      { ref: '12.3', text: 'Desempenho acústico entre unidades habitacionais' },
    ],
  },
]
