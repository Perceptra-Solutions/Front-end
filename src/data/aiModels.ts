import type { AIModel } from '@/types'

export const aiModels: AIModel[] = [
  {
    id: 'ia-01', code: 'IA-MODEL-01', name: 'Safety Detection', version: 'v3.2',
    purpose: 'Detecção de EPI e proteção coletiva',
    precision: 94.8, recall: 91.2, f1: 92.9, threshold: 0.82, status: 'active',
    publishedAt: '2026-07-14', detectionsToday: 148, confirmedRate: 78.4, falsePositiveRate: 6.2,
    classes: ['PERSON', 'HELMET', 'VEST', 'HARNESS', 'GOGGLES', 'EAR_PROTECTION', 'GUARDRAIL'],
    cameras: 9, latencyMs: 42,
  },
  {
    id: 'ia-02', code: 'IA-MODEL-02', name: 'Site Monitoring', version: 'v2.1',
    purpose: 'Áreas restritas, materiais e organização do canteiro',
    precision: 92.1, recall: 89.7, f1: 90.9, threshold: 0.78, status: 'active',
    publishedAt: '2026-05-30', detectionsToday: 96, confirmedRate: 71.9, falsePositiveRate: 8.7,
    classes: ['PERSON', 'TRUCK', 'MATERIAL_STACK', 'RESTRICTED_ZONE', 'DEBRIS', 'LOAD'],
    cameras: 9, latencyMs: 38,
  },
  {
    id: 'ia-03', code: 'IA-MODEL-03', name: 'Structural Watch', version: 'v1.4',
    purpose: 'Escoramento, fôrmas e patologias estruturais aparentes',
    precision: 89.4, recall: 84.6, f1: 86.9, threshold: 0.85, status: 'training',
    publishedAt: '2026-08-11', detectionsToday: 27, confirmedRate: 66.7, falsePositiveRate: 11.4,
    classes: ['SHORING', 'SHORING_MISSING', 'SLAB_PANEL', 'CRACK', 'HONEYCOMB'],
    cameras: 2, latencyMs: 61,
  },
]

export const getModelByCode = (code: string) => aiModels.find((m) => m.code === code)
