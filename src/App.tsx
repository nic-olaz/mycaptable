import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import CapTable from '@/pages/CapTable'
import GuestCapTable from '@/pages/GuestCapTable'
import RoundCalculator from '@/pages/RoundCalculator'
import NewCompany from '@/pages/NewCompany'
import Login from '@/pages/Login'
import AuthCallback from '@/pages/AuthCallback'
import Impressum from '@/pages/Impressum'
import Datenschutz from '@/pages/Datenschutz'
import Account from '@/pages/Account'
import AuthGuard from '@/components/AuthGuard'
import { CapTableProvider } from '@/context/CapTableContext'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <CapTableProvider>
        <div className="min-h-screen bg-[#f8f7f4]">
          <Routes>
            {/* Öffentliche Routen – kein Login nötig */}
            <Route path="/" element={<GuestCapTable />} />
            <Route path="/round" element={<RoundCalculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />

            {/* Geschützte Routen – Login erforderlich */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/company/new"
              element={
                <AuthGuard>
                  <NewCompany />
                </AuthGuard>
              }
            />
            <Route
              path="/company/:id"
              element={
                <AuthGuard>
                  <CapTable />
                </AuthGuard>
              }
            />
            <Route
              path="/company/:id/round"
              element={
                <AuthGuard>
                  <RoundCalculator />
                </AuthGuard>
              }
            />
            <Route
              path="/account"
              element={
                <AuthGuard>
                  <Account />
                </AuthGuard>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </CapTableProvider>
    </BrowserRouter>
  )
}

export default App
