import type { User } from '@/types'

export const users: User[] = [
  {
    id: 'usr-01', code: 'USR-0012', name: 'Marcos Andrade', email: 'marcos.andrade@vertice.eng.br',
    role: 'engenheiro', roleLabel: 'Engenheiro responsável', crea: 'CREA-MG 154.882/D',
    works: ['Residencial Horizonte'], active: true, lastAccess: '2026-08-28T17:41:12', openActions: 4,
  },
  {
    id: 'usr-02', code: 'USR-0018', name: 'Juliana Prado', email: 'juliana.prado@vertice.eng.br',
    role: 'engenheiro', roleLabel: 'Engenheira de qualidade', crea: 'CREA-MG 168.204/D',
    works: ['Residencial Horizonte', 'Edifício Cristal Corporate'], active: true, lastAccess: '2026-08-28T16:58:40', openActions: 2,
  },
  {
    id: 'usr-03', code: 'USR-0024', name: 'Ana Souza', email: 'ana.souza@vertice.eng.br',
    role: 'executor', roleLabel: 'Técnica de segurança do trabalho',
    works: ['Residencial Horizonte'], active: true, lastAccess: '2026-08-28T17:22:03', openActions: 3,
  },
  {
    id: 'usr-04', code: 'USR-0031', name: 'Carlos Silva', email: 'carlos.silva@vertice.eng.br',
    role: 'executor', roleLabel: 'Encarregado de obra',
    works: ['Residencial Horizonte'], active: true, lastAccess: '2026-08-28T17:05:55', openActions: 5,
  },
  {
    id: 'usr-05', code: 'USR-0040', name: 'Renata Lima', email: 'renata.lima@vertice.eng.br',
    role: 'gestor', roleLabel: 'Gerente de obras',
    works: ['Residencial Horizonte', 'Edifício Cristal Corporate', 'Condomínio Serra Azul'], active: true,
    lastAccess: '2026-08-28T14:12:31', openActions: 0,
  },
]

export const currentUser = users[0]
