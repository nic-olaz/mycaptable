import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Company, Shareholder } from '@/types'
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
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react'
import { formatEur, formatPercent } from '@/lib/calculator'
import AppHeader from '@/components/AppHeader'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CHART_COLORS = ['#1e3a5f', '#2e6da4', '#4a9fd4', '#7ec8e3', '#b8dff0', '#e8f4fc']

export default function CapTable() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [shareholders, setShareholders] = useState<Shareholder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newShareholder, setNewShareholder] = useState({
    name: '',
    share_percent: '',
    shares: '',
    shareholder_type: 'founder',
  })

  useEffect(() => {
    if (!id) return
    void fetchData()
  }, [id])

  async function fetchData() {
    try {
      const [companyRes, shareholdersRes] = await Promise.all([
        supabase.from('companies').select('*').eq('id', id!).single(),
        supabase.from('shareholders').select('*').eq('company_id', id!).order('share_percent', { ascending: false }),
      ])

      if (companyRes.error) throw companyRes.error
      if (shareholdersRes.error) throw shareholdersRes.error

      setCompany(companyRes.data)
      setShareholders(shareholdersRes.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddShareholder(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setAddLoading(true)
    try {
      const pct = parseFloat(newShareholder.share_percent) / 100
      const { error } = await supabase.from('shareholders').insert({
        company_id: id,
        name: newShareholder.name.trim(),
        share_percent: pct,
        shares: newShareholder.shares ? parseInt(newShareholder.shares) : null,
        shareholder_type: newShareholder.shareholder_type,
      })
      if (error) throw error
      setShowAddForm(false)
      setNewShareholder({ name: '', share_percent: '', shares: '', shareholder_type: 'founder' })
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen')
    } finally {
      setAddLoading(false)
    }
  }

  const totalPercent = shareholders.reduce((sum, s) => sum + s.share_percent, 0)

  const shareholderTypeLabel: Record<string, string> = {
    founder: 'Gründer',
    investor: 'Investor',
    employee: 'Mitarbeiter',
    advisor: 'Advisor',
    other: 'Sonstige',
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Lade Cap Table...
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="container py-10">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error ?? 'Unternehmen nicht gefunden'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle Unternehmen
        </Link>

        {/* Company Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{company.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {company.legal_form}
              {company.founded_at && ` · Gegründet ${new Date(company.founded_at).getFullYear()}`}
              {' · '}
              Stammkapital {formatEur(company.share_capital)}
            </p>
          </div>
          <Button asChild>
            <Link to={`/company/${company.id}/round`}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Runde simulieren
            </Link>
          </Button>
        </div>

        {/* Cap Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Cap Table</CardTitle>
              <CardDescription>
                {shareholders.length} Gesellschafter · Gesamt {formatPercent(totalPercent)}
                {Math.abs(totalPercent - 1) > 0.001 && (
                  <span className="ml-2 text-amber-600">(Differenz zu 100 %)</span>
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
              <form
                onSubmit={(e) => { void handleAddShareholder(e) }}
                className="grid gap-4 sm:grid-cols-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="sh-name">Name</Label>
                  <Input
                    id="sh-name"
                    value={newShareholder.name}
                    onChange={(e) => setNewShareholder((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Max Mustermann"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sh-pct">Anteil (%)</Label>
                  <Input
                    id="sh-pct"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={newShareholder.share_percent}
                    onChange={(e) => setNewShareholder((p) => ({ ...p, share_percent: e.target.value }))}
                    placeholder="50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sh-shares">Geschäftsanteile</Label>
                  <Input
                    id="sh-shares"
                    type="number"
                    min="1"
                    value={newShareholder.shares}
                    onChange={(e) => setNewShareholder((p) => ({ ...p, shares: e.target.value }))}
                    placeholder="12500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sh-type">Typ</Label>
                  <select
                    id="sh-type"
                    value={newShareholder.shareholder_type}
                    onChange={(e) => setNewShareholder((p) => ({ ...p, shareholder_type: e.target.value }))}
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
                  <Button type="submit" size="sm" disabled={addLoading}>
                    {addLoading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          )}

          <CardContent className="p-0">
            {shareholders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                <p className="text-sm">Noch keine Gesellschafter eingetragen</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">Anteil</TableHead>
                    <TableHead className="text-right">Geschäftsanteile</TableHead>
                    <TableHead className="text-right">Wert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareholders.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {shareholderTypeLabel[s.shareholder_type] ?? s.shareholder_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(s.share_percent)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.shares != null ? s.shares.toLocaleString('de-DE') : '–'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.share_value != null ? formatEur(s.share_value) : '–'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart – Anteilsverteilung */}
        {shareholders.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Anteilsverteilung</CardTitle>
              <CardDescription>Visualisierung der aktuellen Cap Table</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={shareholders.map((s) => ({
                      name: s.name,
                      value: parseFloat((s.share_percent * 100).toFixed(2)),
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {shareholders.map((_s, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const num = typeof value === 'number' ? value : parseFloat(String(value))
                      return [`${num.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`, 'Anteil'] as [string, string]
                    }}
                    contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) => (
                      <span className="text-sm text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
