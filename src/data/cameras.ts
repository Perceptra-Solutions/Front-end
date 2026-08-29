import type { Camera } from '@/types'

/**
 * Parque de câmeras da obra Residencial Horizonte.
 * A posição `plan` é a coordenada da câmera na planta baixa do canteiro (%).
 */
export const cameras: Camera[] = [
  {
    id: 'cam-01', code: 'CAM-01', name: 'Portaria principal', blockCode: 'ACESSO', locationCode: 'PT-01',
    locationLabel: 'Portaria · Acesso de veículos', status: 'online', model: 'Axis P3265-LV', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.11', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T15:47:20', alertsToday: 3, uptimeDays: 128,
    plan: { x: 9, y: 83, rotation: 45 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-02', code: 'CAM-02', name: 'Circulação PV-02', blockCode: 'BLOCO A', locationCode: 'PV-02',
    locationLabel: 'Bloco A · Pavimento 02', status: 'online', model: 'Intelbras VIP 3230', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.12', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T16:12:05', alertsToday: 2, uptimeDays: 96,
    plan: { x: 22, y: 38, rotation: 120 }, sceneVariant: 'slab',
  },
  {
    id: 'cam-03', code: 'CAM-03', name: 'Pátio de materiais', blockCode: 'PÁTIO', locationCode: 'ST-EXT',
    locationLabel: 'Pátio externo · Estocagem', status: 'online', model: 'Axis Q1656', resolution: '2688×1520',
    fps: 30, protocol: 'RTSP/H.265', ip: '10.42.7.13', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T17:22:47', alertsToday: 4, uptimeDays: 128,
    plan: { x: 22, y: 71, rotation: 20 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-04', code: 'CAM-04', name: 'Setor da grua', blockCode: 'BLOCO A', locationCode: 'ST-GRU',
    locationLabel: 'Bloco A · Raio de içamento', status: 'online', model: 'Axis Q1656', resolution: '2688×1520',
    fps: 30, protocol: 'RTSP/H.265', ip: '10.42.7.14', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T14:31:57', alertsToday: 2, uptimeDays: 74,
    plan: { x: 36, y: 56, rotation: 300 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-05', code: 'CAM-05', name: 'Subsolo · Elétrica', blockCode: 'SUBSOLO', locationCode: 'SS-01',
    locationLabel: 'Subsolo 01 · Casa de máquinas', status: 'online', model: 'Intelbras VIP 3230', resolution: '1920×1080',
    fps: 20, protocol: 'RTSP/H.264', ip: '10.42.7.15', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T16:41:33', alertsToday: 1, uptimeDays: 52,
    plan: { x: 30, y: 24, rotation: 180 }, sceneVariant: 'basement',
  },
  {
    id: 'cam-06', code: 'CAM-06', name: 'Circulação PV-03', blockCode: 'BLOCO A', locationCode: 'PV-03',
    locationLabel: 'Bloco A · Pavimento 03', status: 'online', model: 'Intelbras VIP 3230', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.16', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T13:58:22', alertsToday: 1, uptimeDays: 96,
    plan: { x: 26, y: 30, rotation: 150 }, sceneVariant: 'slab',
  },
  {
    id: 'cam-07', code: 'CAM-07', name: 'Laje PV-04', blockCode: 'BLOCO A', locationCode: 'PV-04',
    locationLabel: 'Bloco A · Pavimento 04', status: 'online', model: 'Axis P3265-LV', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.17', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T17:38:21', alertsToday: 5, uptimeDays: 118,
    plan: { x: 20, y: 22, rotation: 95 }, sceneVariant: 'slab',
  },
  {
    id: 'cam-08', code: 'CAM-08', name: 'Central de corte', blockCode: 'BLOCO A', locationCode: 'PV-05',
    locationLabel: 'Bloco A · Pavimento 05', status: 'online', model: 'Intelbras VIP 5232', resolution: '2304×1296',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.18', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T15:20:41', alertsToday: 2, uptimeDays: 61,
    plan: { x: 14, y: 28, rotation: 60 }, sceneVariant: 'slab',
  },
  {
    id: 'cam-09', code: 'CAM-09', name: 'Fachada Norte', blockCode: 'BLOCO B', locationCode: 'FCH-N',
    locationLabel: 'Bloco B · Fachada Norte', status: 'online', model: 'Axis Q1656', resolution: '2688×1520',
    fps: 30, protocol: 'RTSP/H.265', ip: '10.42.7.19', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T16:58:12', alertsToday: 4, uptimeDays: 74,
    plan: { x: 59, y: 20, rotation: 210 }, sceneVariant: 'facade',
  },
  {
    id: 'cam-10', code: 'CAM-10', name: 'Laje PV-06', blockCode: 'BLOCO A', locationCode: 'PV-06',
    locationLabel: 'Bloco A · Pavimento 06', status: 'online', model: 'Axis P3265-LV', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.20', aiModelCode: 'IA-MODEL-03',
    lastDetectionAt: '2026-08-28T14:55:09', alertsToday: 1, uptimeDays: 118,
    plan: { x: 28, y: 16, rotation: 110 }, sceneVariant: 'slab',
  },
  {
    id: 'cam-11', code: 'CAM-11', name: 'Bloco C · Térreo', blockCode: 'BLOCO C', locationCode: 'PV-01',
    locationLabel: 'Bloco C · Pavimento 01', status: 'online', model: 'Intelbras VIP 3230', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.264', ip: '10.42.7.21', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T13:22:48', alertsToday: 1, uptimeDays: 41,
    plan: { x: 78, y: 26, rotation: 250 }, sceneVariant: 'shaft',
  },
  {
    id: 'cam-12', code: 'CAM-12', name: 'Periferia Bloco B', blockCode: 'BLOCO B', locationCode: 'PV-02',
    locationLabel: 'Bloco B · Periferia leste', status: 'online', model: 'Axis P3265-LV', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.22', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T17:31:04', alertsToday: 3, uptimeDays: 88,
    plan: { x: 62, y: 34, rotation: 285 }, sceneVariant: 'facade',
  },
  {
    id: 'cam-13', code: 'CAM-13', name: 'Estacionamento', blockCode: 'ACESSO', locationCode: 'EST-01',
    locationLabel: 'Estacionamento de obra', status: 'online', model: 'Intelbras VIP 3230', resolution: '1920×1080',
    fps: 20, protocol: 'RTSP/H.264', ip: '10.42.7.23', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T17:05:33', alertsToday: 0, uptimeDays: 128,
    plan: { x: 77, y: 79, rotation: 330 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-14', code: 'CAM-14', name: 'Área restrita · Içamento', blockCode: 'BLOCO B', locationCode: 'ZR-01',
    locationLabel: 'Zona restrita de içamento', status: 'online', model: 'Axis Q1656', resolution: '2688×1520',
    fps: 30, protocol: 'RTSP/H.265', ip: '10.42.7.24', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T17:12:19', alertsToday: 2, uptimeDays: 74,
    plan: { x: 56, y: 61, rotation: 15 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-15', code: 'CAM-15', name: 'Refeitório', blockCode: 'VIVÊNCIA', locationCode: 'AV-01',
    locationLabel: 'Área de vivência', status: 'online', model: 'Intelbras VIP 1230', resolution: '1280×720',
    fps: 20, protocol: 'RTSP/H.264', ip: '10.42.7.25', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-28T12:48:02', alertsToday: 0, uptimeDays: 128,
    plan: { x: 43, y: 85, rotation: 340 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-16', code: 'CAM-16', name: 'Poço de elevador', blockCode: 'BLOCO A', locationCode: 'PE-01',
    locationLabel: 'Bloco A · Poço de elevador', status: 'online', model: 'Axis P3265-LV', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.26', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T16:33:47', alertsToday: 1, uptimeDays: 63,
    plan: { x: 24, y: 46, rotation: 200 }, sceneVariant: 'shaft',
  },
  {
    id: 'cam-17', code: 'CAM-17', name: 'Fachada Sul', blockCode: 'BLOCO B', locationCode: 'FCH-S',
    locationLabel: 'Bloco B · Fachada Sul', status: 'online', model: 'Axis Q1656', resolution: '2688×1520',
    fps: 30, protocol: 'RTSP/H.265', ip: '10.42.7.27', aiModelCode: 'IA-MODEL-01',
    lastDetectionAt: '2026-08-28T15:59:14', alertsToday: 1, uptimeDays: 74,
    plan: { x: 58, y: 46, rotation: 60 }, sceneVariant: 'facade',
  },
  {
    id: 'cam-18', code: 'CAM-18', name: 'Bloco C · Cobertura', blockCode: 'BLOCO C', locationCode: 'COB-C',
    locationLabel: 'Bloco C · Cobertura', status: 'online', model: 'Intelbras VIP 5232', resolution: '2304×1296',
    fps: 25, protocol: 'RTSP/H.265', ip: '10.42.7.28', aiModelCode: 'IA-MODEL-03',
    lastDetectionAt: '2026-08-28T14:07:51', alertsToday: 0, uptimeDays: 41,
    plan: { x: 87, y: 22, rotation: 230 }, sceneVariant: 'facade',
  },
  {
    id: 'cam-19', code: 'CAM-19', name: 'Central de fôrmas', blockCode: 'PÁTIO', locationCode: 'ST-FOR',
    locationLabel: 'Pátio · Central de fôrmas', status: 'maintenance', model: 'Intelbras VIP 3230', resolution: '1920×1080',
    fps: 25, protocol: 'RTSP/H.264', ip: '10.42.7.29', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-27T18:22:10', alertsToday: 0, uptimeDays: 0,
    plan: { x: 31, y: 68, rotation: 0 }, sceneVariant: 'yard',
  },
  {
    id: 'cam-20', code: 'CAM-20', name: 'Divisa Leste', blockCode: 'PERÍMETRO', locationCode: 'DIV-L',
    locationLabel: 'Perímetro · Divisa leste', status: 'offline', model: 'Intelbras VIP 1230', resolution: '1280×720',
    fps: 15, protocol: 'RTSP/H.264', ip: '10.42.7.30', aiModelCode: 'IA-MODEL-02',
    lastDetectionAt: '2026-08-27T09:41:38', alertsToday: 0, uptimeDays: 0,
    plan: { x: 90, y: 54, rotation: 270 }, sceneVariant: 'yard',
  },
]

export const getCameraById = (id: string) => cameras.find((c) => c.id === id || c.code === id)
export const onlineCameras = () => cameras.filter((c) => c.status === 'online')
