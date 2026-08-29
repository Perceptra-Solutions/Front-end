import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Alerts from '@/pages/Alerts'
import AlertDetail from '@/pages/AlertDetail'
import Monitoring from '@/pages/Monitoring'
import ConstructionMap from '@/pages/ConstructionMap'
import DigitalTwin from '@/pages/DigitalTwin'
import NonConformities from '@/pages/NonConformities'
import ActionPlans from '@/pages/ActionPlans'
import EvidencePage from '@/pages/Evidence'
import Reports from '@/pages/Reports'
import Works from '@/pages/Works'
import Cameras from '@/pages/Cameras'
import UsersPage from '@/pages/Users'
import Standards from '@/pages/Standards'
import AIModels from '@/pages/AIModels'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetail />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/map" element={<ConstructionMap />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/non-conformities" element={<NonConformities />} />
        <Route path="/action-plans" element={<ActionPlans />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/works" element={<Works />} />
        <Route path="/cameras" element={<Cameras />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/standards" element={<Standards />} />
        <Route path="/ai-models" element={<AIModels />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
