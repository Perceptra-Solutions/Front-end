/** Séries usadas nos gráficos da página de relatórios (Recharts). */

export const complianceSeries = [
  { month: 'MAR', conformidade: 88.4, meta: 92 },
  { month: 'ABR', conformidade: 89.9, meta: 92 },
  { month: 'MAI', conformidade: 90.6, meta: 92 },
  { month: 'JUN', conformidade: 91.8, meta: 92 },
  { month: 'JUL', conformidade: 90.8, meta: 92 },
  { month: 'AGO', conformidade: 94.2, meta: 92 },
]

export const alertsByCategory = [
  { categoria: 'EPI', total: 62, confirmados: 48 },
  { categoria: 'Área restrita', total: 41, confirmados: 29 },
  { categoria: 'Material', total: 35, confirmados: 22 },
  { categoria: 'Altura', total: 28, confirmados: 24 },
  { categoria: 'Elétrica', total: 19, confirmados: 14 },
  { categoria: 'Estrutural', total: 12, confirmados: 8 },
]

export const ncByType = [
  { name: 'Segurança do trabalho', value: 38, color: '#C8322B' },
  { name: 'Organização do canteiro', value: 24, color: '#C97A0E' },
  { name: 'Execução de serviço', value: 19, color: '#1567B3' },
  { name: 'Desempenho / NBR 15575', value: 12, color: '#1B8A54' },
  { name: 'Documentação', value: 7, color: '#7C8996' },
]

export const resolutionTime = [
  { month: 'MAR', dias: 6.8 },
  { month: 'ABR', dias: 6.1 },
  { month: 'MAI', dias: 5.4 },
  { month: 'JUN', dias: 4.9 },
  { month: 'JUL', dias: 4.2 },
  { month: 'AGO', dias: 3.4 },
]

export const alertsByCamera = [
  { camera: 'CAM-07', alertas: 28 },
  { camera: 'CAM-09', alertas: 24 },
  { camera: 'CAM-03', alertas: 19 },
  { camera: 'CAM-12', alertas: 17 },
  { camera: 'CAM-04', alertas: 14 },
  { camera: 'CAM-02', alertas: 11 },
  { camera: 'CAM-05', alertas: 8 },
  { camera: 'CAM-08', alertas: 6 },
]

export const falsePositiveTrend = [
  { week: 'S30', taxa: 14.2 },
  { week: 'S31', taxa: 12.8 },
  { week: 'S32', taxa: 11.9 },
  { week: 'S33', taxa: 10.4 },
  { week: 'S34', taxa: 8.6 },
  { week: 'S35', taxa: 7.1 },
]

export const modelPerformance = [
  { modelo: 'Safety v3.2', precision: 94.8, recall: 91.2, f1: 92.9 },
  { modelo: 'Site v2.1', precision: 92.1, recall: 89.7, f1: 90.9 },
  { modelo: 'Structural v1.4', precision: 89.4, recall: 84.6, f1: 86.9 },
]

export const dailyDetections = [
  { hora: '07h', deteccoes: 12, confirmadas: 5 },
  { hora: '09h', deteccoes: 24, confirmadas: 11 },
  { hora: '11h', deteccoes: 31, confirmadas: 14 },
  { hora: '13h', deteccoes: 27, confirmadas: 9 },
  { hora: '15h', deteccoes: 38, confirmadas: 17 },
  { hora: '17h', deteccoes: 42, confirmadas: 21 },
]
