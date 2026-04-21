import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NewCompany() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    legal_form: 'GmbH',
    founded_at: '',
    share_capital: '',
    currency: 'EUR',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Unternehmensname ist erforderlich')
      return
    }
    const capital = parseFloat(form.share_capital)
    if (isNaN(capital) || capital <= 0) {
      setError('Stammkapital muss eine positive Zahl sein')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: form.name.trim(),
          legal_form: form.legal_form,
          founded_at: form.founded_at || null,
          share_capital: capital,
          currency: form.currency,
        })
        .select()
        .single()

      if (error) throw error
      navigate(`/company/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Anlegen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Neues Unternehmen</CardTitle>
            <CardDescription>
              Lege ein Unternehmen an um den Cap Table zu verwalten
            </CardDescription>
          </CardHeader>

          <form onSubmit={(e) => { void handleSubmit(e) }}>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Unternehmensname *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="z.B. Acme Technologies"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="legal_form">Rechtsform</Label>
                  <Input
                    id="legal_form"
                    name="legal_form"
                    value={form.legal_form}
                    onChange={handleChange}
                    placeholder="GmbH"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="founded_at">Gründungsdatum</Label>
                  <Input
                    id="founded_at"
                    name="founded_at"
                    type="date"
                    value={form.founded_at}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="share_capital">Stammkapital (€) *</Label>
                  <Input
                    id="share_capital"
                    name="share_capital"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.share_capital}
                    onChange={handleChange}
                    placeholder="25000"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Währung</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    placeholder="EUR"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Wird angelegt...' : 'Unternehmen anlegen'}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Abbrechen</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
