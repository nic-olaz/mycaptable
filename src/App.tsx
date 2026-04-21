import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import CapTable from '@/pages/CapTable'
import RoundCalculator from '@/pages/RoundCalculator'
import NewCompany from '@/pages/NewCompany'
import Login from '@/pages/Login'
import Impressum from '@/pages/Impressum'
import Datenschutz from '@/pages/Datenschutz'
import Account from '@/pages/Account'
import AuthGuard from '@/components/AuthGuard'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route
          path="/"
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
    </BrowserRouter>
  )
}

export default App
