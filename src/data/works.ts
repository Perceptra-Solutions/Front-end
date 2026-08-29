import type { Work } from '@/types'

export const works: Work[] = [
  {
    id: 'obra-001', code: 'OBR-2025-014', name: 'Residencial Horizonte', client: 'Incorporadora Vértice',
    city: 'Santa Rita do Sapucaí', state: 'MG', status: 'execution', progress: 68, compliance: 94.2,
    activeAlerts: 12, camerasOnline: 18, camerasTotal: 20, blocks: 3, floors: 12,
    startDate: '2025-03-10', deadline: '2027-02-26', responsible: 'Marcos Andrade', crea: 'CREA-MG 154.882/D',
    area: 18420, coordinates: '22°15\'08"S 45°42\'11"W',
  },
  {
    id: 'obra-002', code: 'OBR-2025-021', name: 'Edifício Cristal Corporate', client: 'Grupo Sinal',
    city: 'Pouso Alegre', state: 'MG', status: 'finishing', progress: 87, compliance: 96.8,
    activeAlerts: 4, camerasOnline: 12, camerasTotal: 12, blocks: 1, floors: 18,
    startDate: '2024-08-02', deadline: '2026-11-14', responsible: 'Juliana Prado', crea: 'CREA-MG 168.204/D',
    area: 11250, coordinates: '22°13\'46"S 45°56\'12"W',
  },
  {
    id: 'obra-003', code: 'OBR-2026-003', name: 'Condomínio Serra Azul', client: 'Incorporadora Vértice',
    city: 'Itajubá', state: 'MG', status: 'foundation', progress: 21, compliance: 91.5,
    activeAlerts: 7, camerasOnline: 8, camerasTotal: 9, blocks: 4, floors: 6,
    startDate: '2026-02-17', deadline: '2028-05-30', responsible: 'Rafael Menezes', crea: 'CREA-MG 172.911/D',
    area: 24800, coordinates: '22°25\'33"S 45°27\'08"W',
  },
]

export const currentWork = works[0]
