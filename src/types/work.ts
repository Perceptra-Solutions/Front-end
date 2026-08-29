export type WorkStatus = 'execution' | 'foundation' | 'finishing' | 'delivered'

export interface Work {
  id: string
  code: string
  name: string
  client: string
  city: string
  state: string
  status: WorkStatus
  progress: number
  compliance: number
  activeAlerts: number
  camerasOnline: number
  camerasTotal: number
  blocks: number
  floors: number
  startDate: string
  deadline: string
  responsible: string
  crea: string
  area: number
  coordinates: string
}
