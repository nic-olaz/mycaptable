import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { solveRound, dilute, formatEur, formatPercent, type SolveFor } from '@/lib/calculator'
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
import { ArrowLeft, Calculator, CheckCircle } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import LoginModal from '@/components/LoginModal'
import { toast } from '@/lib/use-toast'
import { useCapTable } from '@/context/CapTableContext'

type FieldName = 'pre_money' | 'investment' | 'investor_percent'

const FIELD_LABELS: Record<FieldName, string> = {
  pre_money: 'Pre-money Bewertung (€)',
  investment: 'Investment (€)',
  investor_percent: 'Investor-Anteil (%)',
}

export default function RoundCalculator() {
  const navigate = useNavigate()
  const { shareholders: guestShareholders, openLoginModal } = useCapTable()

  // Prüfen ob User eingeloggt ist
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Welches Feld wird berechnet (ist deaktiviert)
  const [solveFor, setSolveFor] = useState<SolveFor>('investor_percent')

  // Eingabefelder (als Strings für die UI)
  const [fields, setFields] = useState<Record<FieldName, string>>({
    pre_money: '',
    investment: '',
    investor_percent: '',
  })

  const [result, setResult] = useState<{
    pre_money: number
    investment: number
    investor_percent: number
    post_money: number
  } | null>(null)

  const [calcError, setCalcError] = useState<string | null>(null)
  const [investorName, setInvestorName] = useState('')

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleFieldChange(field: FieldName, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }))
    setResult(null)
    setCalcError(null)
  }

  function handleSolveForChange(field: SolveFor) {
    setSolveFor(field)
    setFields((prev) => ({ ...prev, [field]: '' }))
    setResult(null)
    setCalcError(null)
  }

  function calculate() {
    setCalcError(null)
    try {
      const pre_money = fields.pre_money ? parseFloat(fields.pre_money) : undefined
      const investment = fields.investment ? parseFloat(fields.investment) : undefined
      const investor_percent_raw = fields.investor_percent
        ? parseFloat(fields.investor_percent) / 100
        : undefined

      const res = solveRound({
        solveFor,
        pre_money,
        investment,
        investor_percent: investor_percent_raw,
      })
      setResult(res)
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : 'Berechnungsfehler')
    }
  }

  async function saveRound() {
    if (!result || !userId) {
      // Nicht eingeloggt → Login-Modal öffnen
      openLoginModal()
      return
    }

    setSaving(true)
    try {
      const roundName = `Runde ${new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`

      // Zuerst eine Company aus dem Guest State finden oder eine neue anlegen
      // (Falls der User bereits eingeloggt ist, gibt es möglicherweise schon Unternehmen im Dashboard)
      // Für den einfachen Fall: wir speichern auf das erste Company des Users
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      const companyId = companies?.[0]?.id as string | undefined

      if (!companyId) {
        toast({
          variant: 'destructive',
          title: 'Kein Unternehmen gefunden',
          description: 'Speichere zuerst deinen Cap Table.',
        })
        setSaving(false)
        return
      }

      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .insert({
          company_id: companyId,
          name: roundName,
          round_type: 'equity',
          pre_money: result.pre_money,
          investment: result.investment,
          investor_percent: result.investor_percent,
        })
        .select('id')
        .single()

      if (roundError) throw roundError

      const { error: participantError } = await supabase
        .from('round_participants')
        .insert({
          round_id: roundData.id,
          investor_name: investorName.trim() || 'Neuer Investor',
          investment: result.investment,
          share_percent: result.investor_percent,
        })

      if (participantError) throw participantError

      toast({
        title: 'Runde gespeichert',
        description: `"${roundName}" wurde erfolgreich eingetragen.`,
      })

      void navigate('/dashboard')
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Speichern',
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      })
    } finally {
      setSaving(false)
    }
  }

  // Gesellschafter aus dem Guest Context (kein Supabase-Fetch mehr nötig)
  const shareholders = guestShareholders.map((s) => ({
    name: s.name,
    share_percent: s.share_percent,
  }))

  const dilutedTable = result
    ? dilute(
        shareholders,
        result.investor_percent,
        investorName.trim() || 'Neuer Investor',
      )
    : null

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <LoginModal />

      <main className="container max-w-4xl py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Cap Table
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Runden-Rechner</h1>
          <p className="mt-1 text-muted-foreground">
            Gib zwei Werte ein – der dritte wird berechnet
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Calculator Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                3-Parameter-Solver
              </CardTitle>
              <CardDescription>
                Wähle welcher Wert berechnet werden soll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Radio: was berechnen? */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Berechne...
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {(['pre_money', 'investment', 'investor_percent'] as const).map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => handleSolveForChange(field)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                        solveFor === field
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      {field === 'pre_money'
                        ? 'Pre-money'
                        : field === 'investment'
                          ? 'Investment'
                          : 'Investor-%'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input fields */}
              <div className="space-y-4">
                {(['pre_money', 'investment', 'investor_percent'] as const).map((field) => {
                  const isDisabled = solveFor === field
                  return (
                    <div key={field} className="space-y-1.5">
                      <Label htmlFor={field} className={isDisabled ? 'text-muted-foreground' : ''}>
                        {FIELD_LABELS[field]}
                        {isDisabled && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            wird berechnet
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id={field}
                        type="number"
                        min="0"
                        step={field === 'investor_percent' ? '0.1' : '1000'}
                        value={isDisabled ? '' : fields[field]}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        disabled={isDisabled}
                        placeholder={
                          isDisabled
                            ? 'wird berechnet'
                            : field === 'investor_percent'
                              ? 'z.B. 20'
                              : 'z.B. 5000000'
                        }
                        className={isDisabled ? 'bg-muted' : ''}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Investor Name */}
              <div className="space-y-1.5">
                <Label htmlFor="investor-name">Name des Investors (optional)</Label>
                <Input
                  id="investor-name"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  placeholder="z.B. VC Fund Alpha"
                />
              </div>

              {calcError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {calcError}
                </div>
              )}

              <Button className="w-full" onClick={calculate}>
                Berechnen
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          <div className="space-y-4">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Ergebnis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Pre-money
                      </div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">
                        {formatEur(result.pre_money)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Investment
                      </div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">
                        {formatEur(result.investment)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-primary/70">
                        Post-money
                      </div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">
                        {formatEur(result.post_money)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-primary/70">
                        Investor-Anteil
                      </div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">
                        {formatPercent(result.investor_percent)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Runde übernehmen */}
            {result && (
              <Button
                className="w-full"
                onClick={() => { void saveRound() }}
                disabled={saving}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {saving
                  ? 'Wird gespeichert...'
                  : userId
                    ? 'Runde übernehmen'
                    : 'Anmelden & Runde speichern'}
              </Button>
            )}

            {/* Dilution Table */}
            {result && dilutedTable && dilutedTable.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Verwässerung</CardTitle>
                  <CardDescription>
                    Anteile nach der Runde
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gesellschafter</TableHead>
                        <TableHead className="text-right">Vorher</TableHead>
                        <TableHead className="text-right">Nachher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dilutedTable.map((entry, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {entry.name}
                            {entry.diluted_from === 0 && (
                              <Badge variant="default" className="ml-2 text-xs">
                                neu
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {entry.diluted_from > 0 ? formatPercent(entry.diluted_from) : '–'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatPercent(entry.share_percent)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {!result && (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground">
                <div>
                  <Calculator className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">Gib Werte ein und klicke Berechnen</p>
                  {shareholders.length === 0 && (
                    <p className="mt-1 text-xs">
                      Verwässerung wird angezeigt sobald Gesellschafter eingetragen sind
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
