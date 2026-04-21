import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, AlertTriangle, Pencil } from 'lucide-react'
import { useCapTable } from '@/context/CapTableContext'
import { formatPercent } from '@/lib/calculator'
import AppHeader from '@/components/AppHeader'
import LoginModal from '@/components/LoginModal'
import type { GuestShareholder } from '@/lib/guestState'

const TYPE_LABELS: Record<GuestShareholder['shareholder_type'], string> = {
  founder: 'Founder',
  investor: 'Investor',
  employee: 'Employee',
  advisor: 'Advisor',
  other: 'Other',
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

function formatEur(value: number): string {
  return value.toLocaleString('de-DE')
}

export default function GuestCapTable() {
  const navigate = useNavigate()
  const {
    company,
    shareholders,
    setCompanyName,
    setShareCapital,
    addShareholder,
    deleteShareholder,
    openLoginModal,
  } = useCapTable()

  const [nameInput, setNameInput] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [ctaPulse, setCtaPulse] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const percentRef = useRef<HTMLInputElement>(null)

  const companyName = company?.name ?? 'My Startup'
  const shareCapital = company?.share_capital ?? null
  const hasCapital = shareCapital !== null && shareCapital > 0
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
    // Check if we just hit 100%
    const newTotal = shareholders.reduce((s, sh) => s + sh.share_percent, 0) + pct
    if (Math.abs(newTotal - 1) < 0.001) {
      setCtaPulse(true)
      setTimeout(() => setCtaPulse(false), 600)
    }
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

  // Grid-Klassen je nach Stammkapital
  const gridCols = hasCapital
    ? 'grid-cols-[1fr_100px_100px_80px_80px_28px]'
    : 'grid-cols-[1fr_120px_100px_32px]'

  // Draft: berechneter Wert für Preview
  const draftPct = parseFloat(draft.share_percent) / 100
  const draftValue =
    hasCapital && !isNaN(draftPct) && draftPct > 0
      ? Math.round(draftPct * shareCapital!)
      : null

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <AppHeader />
      <LoginModal />

      <main className="max-w-xl mx-auto px-4 pb-16">
        {/* Value Prop */}
        <div className="pt-10 pb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a1917]">
            Cap table management for founders
          </h1>
          <p className="mt-2 text-sm text-[#6b6860] max-w-sm mx-auto leading-relaxed">
            Build your cap table and simulate funding rounds.
            Enter two values — we calculate the third.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#a09e99]">
            <span>✓ Free forever</span>
            <span>✓ No signup required</span>
            <span>✓ Works for GmbH</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Company name as tool header */}
          <div>
            <div className="flex items-center gap-1.5 group/name">
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
                className="text-xl font-semibold text-[#1a1917] bg-transparent border-b-2 border-transparent group-hover/name:border-[#e4e2db] focus:border-[#1a3a2a] outline-none transition-all duration-150 pb-0.5 w-full max-w-xs placeholder:text-[#ccc9c0]"
                placeholder="Your company name"
              />
              <Pencil className="h-3.5 w-3.5 text-[#ccc9c0] opacity-0 group-hover/name:opacity-100 transition-opacity duration-150 flex-shrink-0" />
            </div>
            {/* Share Capital */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-[#6b6860]">Share Capital</span>
              <input
                type="number"
                min="1"
                step="1"
                value={shareCapital ?? ''}
                onChange={(e) =>
                  setShareCapital(e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="25,000"
                className="w-28 text-sm font-medium font-tabular text-[#1a1917] bg-transparent border-b border-[#e4e2db] hover:border-[#ccc9c0] focus:border-[#1a3a2a] outline-none transition-all pb-0.5 placeholder:text-[#ccc9c0]"
              />
              <span className="text-sm font-medium text-[#6b6860]">€</span>
            </div>
          </div>

          {/* Cap Table */}
          <div>
            <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.04)] ring-1 ring-[#e4e2db]">
              {/* Table Header */}
              <div className={`grid ${gridCols} items-center border-b border-[#e4e2db] px-4 py-2.5`}>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99]">
                  Name
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right">
                  Stake
                </span>
                {hasCapital && (
                  <>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right">
                      Value
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right">
                      Shares
                    </span>
                  </>
                )}
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] pl-3">
                  Type
                </span>
                <span className="w-8" />
              </div>

              {/* Existing rows */}
              {shareholders.map((s) => {
                const rowValue = hasCapital ? Math.round(s.share_percent * shareCapital!) : null
                const rowShares = rowValue // 1 € par value = shares count equals value in €
                return (
                  <div
                    key={s.id}
                    className={`grid ${gridCols} items-center px-4 py-2.5 border-b border-[#f1f0ed] hover:bg-[#f8f7f4] transition-colors duration-150 group animate-fadeIn`}
                    onMouseEnter={() => setHoveredRow(s.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <span className="text-sm font-medium text-[#1a1917]">{s.name}</span>
                    <span className="text-sm font-tabular font-medium text-right text-[#1a1917]">
                      {formatPercent(s.share_percent)}
                    </span>
                    {hasCapital && (
                      <>
                        <span className="text-sm font-tabular text-right text-[#1a1917]">
                          {formatEur(rowValue!)} €
                        </span>
                        <span className="text-sm font-tabular text-right text-[#1a1917]">
                          {formatEur(rowShares!)}
                        </span>
                      </>
                    )}
                    <span className="pl-3">
                      <span className="rounded-md px-2 py-0.5 text-xs bg-[#f1f0ed] text-[#6b6860]">
                        {TYPE_LABELS[s.shareholder_type]}
                      </span>
                    </span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteShareholder(s.id)}
                        title="Remove"
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
                )
              })}

              {/* Draft row – always visible */}
              <div className={`grid ${gridCols} items-center px-4 py-2 bg-[#fafaf9] border-t border-[#e4e2db]`}>
                <input
                  ref={nameRef}
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Add name..."
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
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-14 text-sm font-tabular text-right bg-transparent outline-none placeholder:text-[#ccc9c0] text-[#1a1917]"
                  />
                  <span className="text-sm text-[#a09e99]">%</span>
                </div>
                {hasCapital && (
                  <>
                    <span className="text-sm font-tabular text-right text-[#ccc9c0]">
                      {draftValue !== null ? `${formatEur(draftValue)} €` : '—'}
                    </span>
                    <span className="text-sm font-tabular text-right text-[#ccc9c0]">
                      {draftValue !== null ? formatEur(draftValue) : '—'}
                    </span>
                  </>
                )}
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
                    <option value="founder">Founder</option>
                    <option value="investor">Investor</option>
                    <option value="employee">Employee</option>
                    <option value="advisor">Advisor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={submitDraft}
                    title="Add (Enter)"
                    className="text-[#ccc9c0] hover:text-[#1a3a2a] transition-colors duration-150 text-sm font-medium"
                  >
                    ↵
                  </button>
                </div>
              </div>
            </div>

            {/* Total row */}
            {shareholders.length > 0 && (
              <div className="mt-2.5 flex items-center justify-end gap-2">
                {totalValid ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d8f3dc] text-[#1a3a2a] text-xs font-semibold font-tabular shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                    <Check className="h-3.5 w-3.5" />
                    {hasCapital
                      ? `${formatEur(shareCapital!)} € · 100 % ✓`
                      : '100 %'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fef3cd] text-[#b7791f] text-xs font-semibold font-tabular">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {formatPercent(totalPercent)} ·{' '}
                    {missing > 0
                      ? `${missing.toFixed(2).replace('.', ',')} % missing`
                      : `${Math.abs(missing).toFixed(2).replace('.', ',')} % over 100%`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA Button – sticky on mobile */}
          <div className="sticky bottom-0 bg-[#f8f7f4]/90 backdrop-blur-sm pt-3 pb-4 -mx-4 px-4 md:static md:bg-transparent md:backdrop-blur-none md:pt-0 md:px-0 md:mx-0">
            <button
              onClick={handleSimulateRound}
              disabled={shareholders.length === 0 || !totalValid}
              className={`w-full py-2.5 px-6 bg-gradient-to-b from-[#1f4a35] to-[#1a3a2a] text-white rounded-lg text-sm font-medium shadow-[0_1px_2px_0_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] hover:from-[#1a3a2a] hover:to-[#152e22] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${ctaPulse ? 'animate-pulse-once' : ''}`}
            >
              Simulate funding round →
            </button>
          </div>

          {/* Note */}
          <p className="text-center text-xs text-[#a09e99]">
            Saved in your browser ·{' '}
            <button
              onClick={openLoginModal}
              className="underline underline-offset-2 hover:text-[#1a1917] transition-colors duration-150"
            >
              Create account
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
