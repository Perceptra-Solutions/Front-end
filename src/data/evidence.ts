import type { Evidence } from '@/types'

export const evidences: Evidence[] = [
  {
    id: 'ev-0231', code: 'EV-0231', kind: 'camera', title: 'Frame da detecção · escoramento P-12',
    capturedAt: '2026-08-28T14:55:09', author: 'IA-MODEL-03', blockCode: 'BLOCO A', locationLabel: 'Pavimento 06',
    relatedCode: 'NC-00127', relatedType: 'NC', hash: 'a91f7c2e', sizeLabel: '1,8 MB', sceneVariant: 'slab',
  },
  {
    id: 'ev-0230', code: 'EV-0230', kind: 'photo', title: 'Circulação obstruída · antes',
    capturedAt: '2026-08-28T16:31:20', author: 'João Costa', blockCode: 'BLOCO A', locationLabel: 'Pavimento 02',
    relatedCode: 'PA-0090', relatedType: 'PA', hash: '3d5b81aa', sizeLabel: '2,4 MB', sceneVariant: 'slab',
  },
  {
    id: 'ev-0229', code: 'EV-0229', kind: 'photo', title: 'Quadro QD-SS01 bloqueado · depois',
    capturedAt: '2026-08-28T17:18:44', author: 'Diego Ramos', blockCode: 'SUBSOLO', locationLabel: 'Subsolo 01',
    relatedCode: 'PA-0089', relatedType: 'PA', hash: '77c4e019', sizeLabel: '3,1 MB', sceneVariant: 'basement',
  },
  {
    id: 'ev-0228', code: 'EV-0228', kind: 'document', title: 'Procedimento LOTO assinado',
    capturedAt: '2026-08-28T17:20:02', author: 'Carlos Silva', blockCode: 'SUBSOLO', locationLabel: 'Subsolo 01',
    relatedCode: 'PA-0089', relatedType: 'PA', hash: 'ba0927fd', sizeLabel: '420 KB', sceneVariant: 'document',
  },
  {
    id: 'ev-0227', code: 'EV-0227', kind: 'photo', title: 'Guarda-corpo instalado · módulo 3',
    capturedAt: '2026-08-28T14:35:51', author: 'Ana Souza', blockCode: 'BLOCO B', locationLabel: 'Fachada Norte',
    relatedCode: 'PA-0088', relatedType: 'PA', hash: '5e2a63c8', sizeLabel: '2,9 MB', sceneVariant: 'facade',
  },
  {
    id: 'ev-0226', code: 'EV-0226', kind: 'video', title: 'Percurso da plataforma · vistoria',
    capturedAt: '2026-08-28T14:41:08', author: 'Ana Souza', blockCode: 'BLOCO B', locationLabel: 'Fachada Norte',
    relatedCode: 'PA-0088', relatedType: 'PA', hash: 'c8471b90', sizeLabel: '18,6 MB', sceneVariant: 'facade',
  },
  {
    id: 'ev-0225', code: 'EV-0225', kind: 'photo', title: 'Sinalização do depósito instalada',
    capturedAt: '2026-08-27T15:48:33', author: 'João Costa', blockCode: 'BLOCO B', locationLabel: 'Depósito de inflamáveis',
    relatedCode: 'PA-0087', relatedType: 'PA', hash: '2f9d4471', sizeLabel: '2,2 MB', sceneVariant: 'yard',
  },
  {
    id: 'ev-0224', code: 'EV-0224', kind: 'camera', title: 'Frame da detecção · andaime sem guarda-corpo',
    capturedAt: '2026-08-28T11:40:15', author: 'IA-MODEL-01', blockCode: 'BLOCO B', locationLabel: 'Fachada Norte',
    relatedCode: 'ALT-2026-0829', relatedType: 'ALT', hash: '9b30ea55', sizeLabel: '1,6 MB', sceneVariant: 'facade',
  },
  {
    id: 'ev-0223', code: 'EV-0223', kind: 'document', title: 'Relatório de inspeção semanal · SEM-34',
    capturedAt: '2026-08-24T17:02:11', author: 'Juliana Prado', blockCode: 'OBRA', locationLabel: 'Residencial Horizonte',
    relatedCode: 'NC-00120', relatedType: 'NC', hash: 'e14c7702', sizeLabel: '1,1 MB', sceneVariant: 'document',
  },
  {
    id: 'ev-0222', code: 'EV-0222', kind: 'photo', title: 'Infiltração na divisa leste',
    capturedAt: '2026-08-26T10:35:47', author: 'Juliana Prado', blockCode: 'BLOCO C', locationLabel: 'Bloco C · Pavimento 01',
    relatedCode: 'NC-00120', relatedType: 'NC', hash: '6a8f2130', sizeLabel: '2,7 MB', sceneVariant: 'shaft',
  },
  {
    id: 'ev-0221', code: 'EV-0221', kind: 'camera', title: 'Frame da detecção · EPI ausente PV-04',
    capturedAt: '2026-08-28T17:38:21', author: 'IA-MODEL-01', blockCode: 'BLOCO A', locationLabel: 'Pavimento 04',
    relatedCode: 'ALT-2026-0841', relatedType: 'ALT', hash: 'd7e91c04', sizeLabel: '1,9 MB', sceneVariant: 'slab',
  },
  {
    id: 'ev-0220', code: 'EV-0220', kind: 'video', title: 'Movimentação sob carga suspensa',
    capturedAt: '2026-08-28T14:31:57', author: 'IA-MODEL-02', blockCode: 'BLOCO A', locationLabel: 'Setor da grua',
    relatedCode: 'ALT-2026-0832', relatedType: 'ALT', hash: '0c53ab8e', sizeLabel: '22,4 MB', sceneVariant: 'yard',
  },
]
