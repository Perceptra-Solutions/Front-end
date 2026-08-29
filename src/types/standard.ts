export interface Standard {
  id: string
  code: string
  ref: string
  title: string
  description: string
  category: 'seguranca' | 'desempenho' | 'estrutural' | 'eletrica'
  status: 'conforme' | 'atencao' | 'nao_conforme'
  occurrences: number
  openOccurrences: number
  lastVerification: string
  responsible: string
  items: { ref: string; text: string }[]
}
