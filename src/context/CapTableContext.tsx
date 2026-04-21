import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  loadGuestState,
  saveGuestState,
  generateLocalId,
  type GuestState,
  type GuestShareholder,
  type GuestCompany,
} from '@/lib/guestState'

interface CapTableContextValue {
  // State
  company: GuestCompany | null
  shareholders: GuestShareholder[]

  // Mutationen
  setCompanyName: (name: string) => void
  setCompany: (company: GuestCompany) => void
  setShareCapital: (value: number | null) => void
  addShareholder: (s: Omit<GuestShareholder, 'id'>) => void
  updateShareholder: (id: string, updates: Partial<Omit<GuestShareholder, 'id'>>) => void
  deleteShareholder: (id: string) => void

  // Login-Modal
  showLoginModal: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const CapTableContext = createContext<CapTableContextValue | null>(null)

export function CapTableProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuestState>(() => loadGuestState())
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Bei jeder State-Änderung in localStorage persistieren
  useEffect(() => {
    saveGuestState(state)
  }, [state])

  function setCompanyName(name: string) {
    setState((prev) => ({
      ...prev,
      company: prev.company
        ? { ...prev.company, name }
        : { name, legal_form: 'GmbH', share_capital: null },
    }))
  }

  function setCompany(company: GuestCompany) {
    setState((prev) => ({ ...prev, company }))
  }

  function setShareCapital(value: number | null) {
    setState((prev) => ({
      ...prev,
      company: prev.company
        ? { ...prev.company, share_capital: value }
        : { name: 'Mein Startup', legal_form: 'GmbH', share_capital: value },
    }))
  }

  function addShareholder(s: Omit<GuestShareholder, 'id'>) {
    const newShareholder: GuestShareholder = { ...s, id: generateLocalId() }
    setState((prev) => ({
      ...prev,
      shareholders: [...prev.shareholders, newShareholder],
    }))
  }

  function updateShareholder(id: string, updates: Partial<Omit<GuestShareholder, 'id'>>) {
    setState((prev) => ({
      ...prev,
      shareholders: prev.shareholders.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    }))
  }

  function deleteShareholder(id: string) {
    setState((prev) => ({
      ...prev,
      shareholders: prev.shareholders.filter((s) => s.id !== id),
    }))
  }

  function openLoginModal() {
    setShowLoginModal(true)
  }

  function closeLoginModal() {
    setShowLoginModal(false)
  }

  return (
    <CapTableContext.Provider
      value={{
        company: state.company,
        shareholders: state.shareholders,
        setCompanyName,
        setCompany,
        setShareCapital,
        addShareholder,
        updateShareholder,
        deleteShareholder,
        showLoginModal,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </CapTableContext.Provider>
  )
}

export function useCapTable(): CapTableContextValue {
  const ctx = useContext(CapTableContext)
  if (!ctx) {
    throw new Error('useCapTable muss innerhalb von CapTableProvider verwendet werden')
  }
  return ctx
}
