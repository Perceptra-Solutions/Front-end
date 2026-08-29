export type EvidenceKind = 'photo' | 'video' | 'camera' | 'document'

export interface Evidence {
  id: string
  code: string
  kind: EvidenceKind
  title: string
  capturedAt: string
  author: string
  blockCode: string
  locationLabel: string
  relatedCode: string
  relatedType: 'NC' | 'PA' | 'ALT'
  hash: string
  sizeLabel: string
  sceneVariant: 'slab' | 'facade' | 'yard' | 'shaft' | 'basement' | 'document'
}
