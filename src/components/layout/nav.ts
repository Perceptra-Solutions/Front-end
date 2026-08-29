import {
  AlertTriangle,
  Boxes,
  Building2,
  Camera,
  ClipboardList,
  Cpu,
  FileBarChart,
  Image as ImageIcon,
  LayoutDashboard,
  Map,
  Scale,
  Settings,
  Siren,
  User,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** contador exibido à direita (alertas, NCs) */
  badgeKey?: 'alerts' | 'nc' | 'plans'
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: 'Visão geral',
    items: [
      { label: 'Visão Geral', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Central de Alertas', to: '/alerts', icon: Siren, badgeKey: 'alerts' },
      { label: 'Monitoramento', to: '/monitoring', icon: Video },
      { label: 'Mapa da Obra', to: '/map', icon: Map },
      { label: 'Gêmeo Digital', to: '/digital-twin', icon: Boxes },
      { label: 'Não Conformidades', to: '/non-conformities', icon: AlertTriangle, badgeKey: 'nc' },
      { label: 'Planos de Ação', to: '/action-plans', icon: ClipboardList, badgeKey: 'plans' },
      { label: 'Evidências', to: '/evidence', icon: ImageIcon },
      { label: 'Relatórios', to: '/reports', icon: FileBarChart },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Obras', to: '/works', icon: Building2 },
      { label: 'Câmeras', to: '/cameras', icon: Camera },
      { label: 'Usuários', to: '/users', icon: Users },
      { label: 'Normas', to: '/standards', icon: Scale },
      { label: 'Modelos de IA', to: '/ai-models', icon: Cpu },
    ],
  },
]

export const footerNav: NavItem[] = [
  { label: 'Perfil', to: '/profile', icon: User },
  { label: 'Configurações', to: '/settings', icon: Settings },
]
