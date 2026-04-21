import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, TrendingUp, Check, AlertTriangle } from 'lucide-react'
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

const TYPE_ICONS: Record<GuestShareholder['shareholder_type'], string> = {
  founder: '👤',
  investor: '💼',
  employee: '👥',
  advisor: '🎯',
  other: '•',
}

interface NewShareholderForm {
  name: string
  share_percent: string
  shares: string
  shareholder_type: GuestShareholder['shareholder_type']
}

const EMPTY_FORM: NewShareholderForm = {
  name: '',
  share_percent: '',
  shares: '',
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<NewShareholderForm>(EMPTY_FORM)

  const companyName = company?.name ?? 'Mein Startup'
  const totalPercent = shareholders.reduce((sum, s) => sum + s.share_percent, 0)
  const totalValid = Math.abs(totalPercent - 1) < 0.001
  const missing = Math.round((1 - totalPercent) * 10000) / 100

  function handleNameBlur() {
    if (nameInput.trim()) {
      setCompanyName(nameInput.trim())
    }
    setNameFocused(false)
  }

  function handleNameFocus() {
    setNameInput(companyName)
    setNameFocused(true)
  }

  function handleAddShareholder(e: React.FormEvent) {
    e.preventDefault()
    const pct = parseFloat(form.share_percent) / 100
    addShareholder({
      name: form.name.trim(),
      share_percent: pct,
      shares: form.shares ? parseInt(form.shares) : undefined,
      shareholder_type: form.shareholder_type,
    })
    setForm(EMPTY_FORM)
    setShowAddForm(false)
  }

  function handleSimulateRound() {
    void navigate('/round')
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <AppHeader />
      <LoginModal />

      <main className="max-w-2xl mx-auto px-4 pb-16">
        {/* Mini-Hero */}
        <div className="mt-16 mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1a1917]">
            Simuliere deine Finanzierungsrunde
          </h1>
          <p className="mt-3 text-base text-[#6b6860] leading-relaxed max-w-lg mx-auto">
            Gib deinen Cap Table ein und berechne, wie viel du bei welcher
            Bewertung abgibst – ohne Anmeldung.
          </p>
        </div>

        {/* Editor */}
        <div className="space-y-6">
          {/* Unternehmensname */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] mb-2">
              Unternehmen
            </p>
            <input
              type="text"
              value={nameFocused ? nameInput : companyName}
              onFocus={handleNameFocus}
              onBlur={handleNameBlur}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setNameFocused(false)
                }
              }}
              className="w-full text-xl font-medium text-[#1a1917] bg-transparent border border-transparent rounded-lg px-3 py-2 -mx-3 hover:border-[#e4e2db] focus:border-[#1a3a2a] focus:bg-white outline-none transition-all duration-150 placeholder:text-[#a09e99]"
              placeholder="Mein Startup GmbH"
            />
          </div>

          {/* Gesellschafter-Tabelle */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] mb-2">
              Gesellschafter
            </p>

            <div className="bg-white border border-[#e4e2db] rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 border-b border-[#e4e2db] px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99]">
                  Name
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] text-right w-24">
                  Anteil
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a09e99] w-24 text-center">
                  Typ
                </span>
                <span className="w-8" />
              </div>

              {/* Rows */}
              {shareholders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                  <TrendingUp className="h-8 w-8 text-[#ccc9c0]" />
                  <p className="text-sm text-[#a09e99]">
                    Noch keine Gesellschafter – füge den ersten hinzu
                  </p>
                </div>
              ) : (
                shareholders.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-4 py-3 border-b border-[#f1f0ed] hover:bg-[#f8f7f4] transition-colors duration-150 group"
                  >
                    <span className="text-sm font-medium text-[#1a1917]">{s.name}</span>
                    <span className="text-sm font-tabular text-right text-[#1a1917] w-24">
                      {formatPercent(s.share_percent)}
                    </span>
                    <span className="text-sm text-center w-24 text-[#6b6860]">
                      {TYPE_ICONS[s.shareholder_type]}{' '}
                      <span className="text-xs">{TYPE_LABELS[s.shareholder_type]}</span>
                    </span>
                    <div className="w-8 flex justify-end">
                      <button
                        onClick={() => deleteShareholder(s.id)}
                        title="Entfernen"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#a09e99] hover:text-[#c0392b] hover:bg-[#fce8e6] transition-all duration-150"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Add-Form */}
              {showAddForm && (
                <div className="border-t border-[#e4e2db] bg-[#f8f7f4] p-4">
                  <form onSubmit={handleAddShareholder} className="grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] block mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Max Mustermann"
                        required
                        autoFocus
                        className="w-full px-3 py-2 text-sm border border-[#e4e2db] rounded-lg bg-white text-[#1a1917] placeholder:text-[#a09e99] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:ring-offset-1 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] block mb-1.5">
                        Anteil %
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value={form.share_percent}
                        onChange={(e) => setForm((p) => ({ ...p, share_percent: e.target.value }))}
                        placeholder="50"
                        required
                        className="w-full px-3 py-2 text-sm border border-[#e4e2db] rounded-lg bg-white text-[#1a1917] placeholder:text-[#a09e99] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:ring-offset-1 font-tabular transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-[#6b6860] block mb-1.5">
                        Typ
                      </label>
                      <select
                        value={form.shareholder_type}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            shareholder_type: e.target.value as GuestShareholder['shareholder_type'],
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-[#e4e2db] rounded-lg bg-white text-[#1a1917] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:ring-offset-1 transition-colors"
                      >
                        <option value="founder">Gründer</option>
                        <option value="investor">Investor</option>
                        <option value="employee">Mitarbeiter</option>
                        <option value="advisor">Advisor</option>
                        <option value="other">Sonstige</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4 flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-[#1a3a2a] text-white rounded-lg hover:bg-[#152e22] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#1a3a2a] focus-visible:ring-offset-2"
                      >
                        Hinzufügen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false)
                          setForm(EMPTY_FORM)
                        }}
                        className="px-4 py-2 text-sm font-medium text-[#6b6860] border border-[#e4e2db] rounded-lg hover:bg-[#f1f0ed] transition-colors duration-150"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Add Row Button */}
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#6b6860] hover:bg-[#f8f7f4] hover:text-[#1a3a2a] transition-colors duration-150"
                >
                  <Plus className="h-4 w-4" />
                  Gesellschafter hinzufügen
                </button>
              )}
            </div>

            {/* Summen-Zeile */}
            {shareholders.length > 0 && (
              <div className="mt-2.5 flex items-center justify-end gap-2">
                {totalValid ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d8f3dc] text-[#1a3a2a] text-xs font-semibold font-tabular">
                    <Check className="h-3.5 w-3.5" />
                    100,00 %
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#fef3cd] text-[#b7791f] text-xs font-semibold font-tabular">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {formatPercent(totalPercent)} · {missing > 0 ? `${missing.toFixed(2).replace('.', ',')} % fehlen` : `${Math.abs(missing).toFixed(2).replace('.', ',')} % zu viel`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSimulateRound}
            disabled={shareholders.length === 0 || !totalValid}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#1a3a2a] text-white rounded-lg text-sm font-medium hover:bg-[#152e22] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#1a3a2a] focus-visible:ring-offset-2"
          >
            <TrendingUp className="h-4 w-4" />
            Finanzierungsrunde simulieren
          </button>

          {/* Hinweis */}
          <p className="text-center text-xs text-[#a09e99]">
            Dein Cap Table wird im Browser gespeichert.{' '}
            <button
              onClick={openLoginModal}
              className="underline underline-offset-2 hover:text-[#1a1917] transition-colors duration-150"
            >
              Konto erstellen
            </button>{' '}
            um ihn dauerhaft zu sichern.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e2db] py-6">
        <div className="max-w-2xl mx-auto px-4 flex justify-center gap-6 text-xs text-[#a09e99]">
          <Link
            to="/impressum"
            className="hover:text-[#1a1917] transition-colors duration-150"
          >
            Impressum
          </Link>
          <Link
            to="/datenschutz"
            className="hover:text-[#1a1917] transition-colors duration-150"
          >
            Datenschutz
          </Link>
        </div>
      </footer>
    </div>
  )
}
