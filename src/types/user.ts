export type UserRole = 'gestor' | 'engenheiro' | 'executor' | 'auditor'

export interface User {
  id: string
  code: string
  name: string
  email: string
  role: UserRole
  roleLabel: string
  crea?: string
  works: string[]
  active: boolean
  lastAccess: string
  openActions: number
}
