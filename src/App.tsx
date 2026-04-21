import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import CapTable from '@/pages/CapTable'
import RoundCalculator from '@/pages/RoundCalculator'
import NewCompany from '@/pages/NewCompany'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/company/new" element={<NewCompany />} />
        <Route path="/company/:id" element={<CapTable />} />
        <Route path="/company/:id/round" element={<RoundCalculator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
