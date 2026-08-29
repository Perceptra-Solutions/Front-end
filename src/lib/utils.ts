import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 28/08/2026 */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** 17:38:21 */
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** 28 AGO 2026 */
export function formatDateTechnical(date: Date) {
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  return `${String(date.getDate()).padStart(2, '0')} ${meses[date.getMonth()]} ${date.getFullYear()}`
}

/** "há 4 min" */
export function timeAgo(iso: string, now: Date = new Date()) {
  const diff = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  return `há ${Math.floor(diff / 86400)} d`
}

/** 94,2% */
export function pct(value: number, decimals = 1) {
  return `${value.toFixed(decimals).replace('.', ',')}%`
}

export function num(value: number, decimals = 0) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
