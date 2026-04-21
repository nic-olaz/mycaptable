import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, TrendingUp, Save, PencilLine, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<NewShareholderForm>(EMPTY_FORM)

  const companyName = company?.name ?? 'Mein Startup'
  const totalPercent = shareholders.reduce((sum, s) => sum + s.share_percent, 0)
  const totalValid = Math.abs(totalPercent - 1) < 0.001

  function startEditName() {
    setNameInput(companyName)
    setEditingName(true)
  }

  function confirmEditName() {
    if (nameInput.trim()) {
      setCompanyName(nameInput.trim())
    }
    setEditingName(false)
  }

  function cancelEditName() {
    setEditingName(false)
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
    <div className="min-h-screen bg-background">
      <AppHeader />
      <LoginModal />

      <main className="container py-10">
        {/* Unternehmensname – inline editierbar */}
        <div className="mb-8">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEditName()
                  if (e.key === 'Escape') cancelEditName()
                }}
                className="text-3xl font-semibold h-auto py-1 w-auto max-w-md tracking-tight border-0 border-b border-primary rounded-none focus-visible:ring-0 px-0"
              />
              <Button size="icon" variant="ghost" onClick={confirmEditName} className="h-8 w-8">
                <Check className="h-4 w-4 text-primary" />
              </Button>
              <Button size="icon" variant="ghost" onClick={cancelEditName} className="h-8 w-8">
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-3xl font-semibold tracking-tight">{companyName}</h1>
              <Button
                size="icon"
                variant="ghost"
                onClick={startEditName}
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Name bearbeiten"
              >
                <PencilLine className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Cap Table – keine Anmeldung nötig. Speichere wenn du fertig bist.
          </p>
        </div>

        {/* Cap Table Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Gesellschafter</CardTitle>
              <CardDescription>
                {shareholders.length === 0
                  ? 'Noch keine Gesellschafter – füge den ersten hinzu'
                  : `${shareholders.length} Gesellschafter · Gesamt ${formatPercent(totalPercent)}`}
                {shareholders.length > 0 && !totalValid && (
                  <span className="ml-2 text-amber-600 font-medium">
                    (Summe muss 100 % ergeben)
                  </span>
                )}
                {shareholders.length > 0 && totalValid && (
                  <span className="ml-2 text-green-600">100 % vergeben</span>
                )}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Gesellschafter
            </Button>
          </CardHeader>

          {showAddForm && (
            <CardContent className="border-t bg-muted/30">
              <form onSubmit={handleAddShareholder} className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="g-name">Name</Label>
                  <Input
                    id="g-name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Max Mustermann"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-pct">Anteil (%)</Label>
                  <Input
                    id="g-pct"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={form.share_percent}
                    onChange={(e) => setForm((p) => ({ ...p, share_percent: e.target.value }))}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-shares">Geschäftsanteile</Label>
                  <Input
                    id="g-shares"
                    type="number"
                    min="1"
                    value={form.shares}
                    onChange={(e) => setForm((p) => ({ ...p, shares: e.target.value }))}
                    placeholder="12500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="g-type">Typ</Label>
                  <select
                    id="g-type"
                    value={form.shareholder_type}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        shareholder_type: e.target.value as GuestShareholder['shareholder_type'],
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="founder">Gründer</option>
                    <option value="investor">Investor</option>
                    <option value="employee">Mitarbeiter</option>
                    <option value="advisor">Advisor</option>
                    <option value="other">Sonstige</option>
                  </select>
                </div>
                <div className="sm:col-span-4 flex gap-2">
                  <Button type="submit" size="sm">
                    Hinzufügen
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setForm(EMPTY_FORM)
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          )}

          <CardContent className="p-0">
            {shareholders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
                <TrendingUp className="h-10 w-10 opacity-20" />
                <p className="text-sm">
                  Füge Gesellschafter hinzu um deinen Cap Table aufzubauen
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">Anteil</TableHead>
                    <TableHead className="text-right">Geschäftsanteile</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareholders.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{TYPE_LABELS[s.shareholder_type]}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(s.share_percent)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.shares != null ? s.shares.toLocaleString('de-DE') : '–'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteShareholder(s.id)}
                          title="Entfernen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleSimulateRound}
            disabled={shareholders.length === 0}
            className="sm:flex-1"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Runde simulieren
          </Button>
          <Button
            onClick={openLoginModal}
            className="sm:flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Speichern
          </Button>
        </div>

        {/* Hinweis für nicht-eingeloggte User */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dein Cap Table wird im Browser gespeichert.{' '}
          <button
            onClick={openLoginModal}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Konto erstellen
          </button>{' '}
          um ihn dauerhaft zu sichern.
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-10">
        <div className="container flex justify-center gap-6 text-xs text-muted-foreground">
          <Link to="/impressum" className="hover:text-foreground">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-foreground">
            Datenschutz
          </Link>
        </div>
      </footer>
    </div>
  )
}
