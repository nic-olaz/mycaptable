import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, AlertTriangle } from 'lucide-react'
import { useCapTable } from '@/context/CapTableContext'
import { formatPercent } from '@/lib/calculator'
import AppHeader from '@/components/AppHeader'
import LoginModal from '@/components/LoginModal'
import type { GuestShareholder } from '@/lib/guestState'

const TYPE_LABELS: Record<GuestShareholder['shareholder_type'], string> = {
  founder: 'Gründer',
  investor: 'Investor',
  employee: 'Mitarbeiter',
  advisor: 'Advisor',
  other: 'Sonstige',
}

interface DraftState {
  name: string
  share_percent: string
  shareholder_type: GuestShareholder['shareholder_type']
}

const EMPTY_DRAFT: DraftState = {
  name: '',
  share_percent: '',
  shareholder_type: 'founder',
}

export default function GuestCapTable() {
  const navigate = useNavigate()
  const {
    company,
    shareholders,
    setCompanyName,
    addShareholder,
    deleteShareholder,
    openLoginModal,
  } = useCapTable()

  const [nameInput, setNameInput] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const percentRef = useRef<HTMLInputElement>(null)

  const companyName = company?.name ?? 'Mein Startup'
  const totalPercent = shareholders.reduce((sum, s) => sum + s.share_percent, 0)
  const totalValid = Math.abs(totalPercent - 1) < 0.001
  const missing = Math.round((1 - totalPercent) * 10000) / 100

  // Autofokus wenn Liste leer
  useEffect(() => {
    if (shareholders.length === 0) {
      nameRef.current?.focus()
    }
  }, [])

  function handleCompanyNameBlur() {
    if (nameInput.trim()) {
      setCompanyName(nameInput.trim())
    }
    setNameFocused(false)
  }

  function handleCompanyNameFocus() {
    setNameInput(companyName)
    setNameFocused(true)
  }

  function getRemainingPercent(): number {
    return Math.max(0, 100 - shareholders.reduce((s, sh) => s + sh.share_percent * 100, 0))
  }

  function submitDraft() {
    if (!draft.name.trim()) return
    const pct = parseFloat(draft.share_percent) / 100
    if (isNaN(pct) || pct <= 0) return
    addShareholder({
      name: draft.name.trim(),
      share_percent: pct,
      shareholder_type: draft.shareholder_type,
    })
    setDraft(EMPTY_DRAFT)
    setTimeout(() => nameRef.current?.focus(), 0)
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (!draft.share_percent) {
        const remaining = getRemainingPercent()
        if (remaining > 0) {
          setDraft((p) => ({ ...p, share_percent: remaining.toFixed(2) }))
        }
      }
      percentRef.current?.focus()
    }
    if (e.key === 'Escape') {
      setDraft(EMPTY_DRAFT)
    }
  }

  function handlePercentKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      submitDraft()
    }
    if (e.key === 'Escape') {
      setDraft(EMPTY_DRAFT)
      nameRef.current?.focus()
    }
  }

  function handleSimulateRound() {
    void navigate('/round')
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <AppHeader />
      <LoginModal />

      <main className="max-w-xl mx-auto px-4 pt-8 pb-16">
        <div className="space-y-6">
          {/* Unternehmensname als Tool-Header */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameFocused ? nameInput : companyName}
              onFocus={handleCompanyNameFocus}
              onBlur={handleCompanyNameBlur}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setNameFocused(false)
              }}
              className="text-xl font-semibold text-[#1a1917] bg-transparent border-b-2 border-transparent hover:border-[#e4e2db] focus:border-[#1a3a2a] outline-none transition-all duration-150 pb-0.5 w-full max-w-xs"
              placeholder="Startup-Name"
            />
          </div>

          {/* Cap Table */}
          <div>
            <div className="bg-white border border-[#e4e2db] rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_100px_32px] items-center border-b border-[#e4e2db] px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99]">
                  Name
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right">
                  Anteil
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] pl-3">
                  Typ
                </span>
                <span className="w-8" />
              </div>

              {/* Bestehende Zeilen */}
              {shareholders.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_120px_100px_32px] items-center px-4 py-2.5 border-b border-[#f1f0ed] hover:bg-[#f8f7f4] transition-colors duration-150 group"
                  onMouseEnter={() => setHoveredRow(s.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <span className="text-sm font-medium text-[#1a1917]">{s.name}</span>
                  <span className="text-sm font-tabular font-medium text-right text-[#1a1917]">
                    {formatPercent(s.share_percent)}
                  </span>
                  <span className="pl-3">
                    <span className="rounded-md px-2 py-0.5 text-xs bg-[#f1f0ed] text-[#6b6860]">
                      {TYPE_LABELS[s.shareholder_type]}
                    </span>
                  </span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteShareholder(s.id)}
                      title="Entfernen"
                      className={`text-base leading-none transition-colors duration-150 px-1 ${
                        hoveredRow === s.id
                          ? 'text-[#ccc9c0] hover:text-[#c0392b]'
                          : 'text-transparent'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* Draft-Zeile – immer sichtbar */}
              <div className="grid grid-cols-[1fr_120px_100px_32px] items-center px-4 py-2 bg-[#fafaf9] border-t border-[#e4e2db]">
                <input
                  ref={nameRef}
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Name eingeben..."
                  className="text-sm text-[#1a1917] bg-transparent outline-none placeholder:text-[#ccc9c0] w-full"
                />
                <div className="flex items-center gap-1 justify-end">
                  <input
                    ref={percentRef}
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={draft.share_percent}
                    onChange={(e) => setDraft((p) => ({ ...p, share_percent: e.target.value }))}
                    onKeyDown={handlePercentKeyDown}
                    placeholder="0"
                    className="w-14 text-sm font-tabular text-right bg-transparent outline-none placeholder:text-[#ccc9c0] text-[#1a1917]"
                  />
                  <span className="text-sm text-[#a09e99]">%</span>
                </div>
                <div className="pl-3">
                  <select
                    value={draft.shareholder_type}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        shareholder_type: e.target.value as GuestShareholder['shareholder_type'],
                      }))
                    }
                    className="text-xs text-[#6b6860] bg-transparent outline-none border-none cursor-pointer w-full"
                  >
                    <option value="founder">Gründer</option>
                    <option value="investor">Investor</option>
                    <option value="employee">Mitarbeiter</option>
                    <option value="advisor">Advisor</option>
                    <option value="other">Sonstige</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={submitDraft}
                    title="Hinzufügen (Enter)"
                    className="text-[#ccc9c0] hover:text-[#1a3a2a] transition-colors duration-150 text-sm font-medium"
                  >
                    ↵
                  </button>
                </div>
              </div>
            </div>

            {/* Summen-Zeile */}
            {shareholders.length > 0 && (
              <div className="mt-2.5 flex items-center justify-end gap-2">
                {totalValid ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d8f3dc] text-[#1a3a2a] text-xs font-semibold font-tabular">
                    <Check className="h-3.5 w-3.5" />
                    100 %
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fef3cd] text-[#b7791f] text-xs font-semibold font-tabular">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {formatPercent(totalPercent)} ·{' '}
                    {missing > 0
                      ? `${missing.toFixed(2).replace('.', ',')} % fehlen`
                      : `${Math.abs(missing).toFixed(2).replace('.', ',')} % zu viel`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSimulateRound}
            disabled={shareholders.length === 0 || !totalValid}
            className="w-full mt-6 py-2.5 px-6 bg-[#1a3a2a] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Finanzierungsrunde simulieren
            <span className="text-[#86c49d]">→</span>
          </button>

          {/* Hinweis */}
          <p className="text-center text-xs text-[#a09e99]">
            Wird im Browser gespeichert ·{' '}
            <button
              onClick={openLoginModal}
              className="underline underline-offset-2 hover:text-[#1a1917] transition-colors duration-150"
            >
              Konto erstellen
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e2db] py-6">
        <div className="max-w-xl mx-auto px-4 flex justify-center gap-6 text-xs text-[#a09e99]">
          <Link to="/impressum" className="hover:text-[#1a1917] transition-colors duration-150">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-[#1a1917] transition-colors duration-150">
            Datenschutz
          </Link>
        </div>
      </footer>
    </div>
  )
}
