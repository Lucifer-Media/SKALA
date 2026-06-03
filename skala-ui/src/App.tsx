import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import ConnectionsPage from './pages/ConnectionsPage'
import ClusterPage from './pages/ClusterPage'
import InfobasesPage from './pages/InfobasesPage'
import SessionsPage from './pages/SessionsPage'
import ProcessesPage from './pages/ProcessesPage'
import LocksPage from './pages/LocksPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="connections/:connId/clusters/:clusterId" element={<ClusterPage />} />
        <Route path="connections/:connId/clusters/:clusterId/infobases" element={<InfobasesPage />} />
        <Route path="connections/:connId/clusters/:clusterId/infobases/:ibId/sessions" element={<SessionsPage />} />
        <Route path="connections/:connId/clusters/:clusterId/processes" element={<ProcessesPage />} />
        <Route path="connections/:connId/clusters/:clusterId/infobases/:ibId/locks" element={<LocksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
