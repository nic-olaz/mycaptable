import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import CapTable from '@/pages/CapTable'
import RoundCalculator from '@/pages/RoundCalculator'
import NewCompany from '@/pages/NewCompany'
import Login from '@/pages/Login'
import AuthGuard from '@/components/AuthGuard'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
