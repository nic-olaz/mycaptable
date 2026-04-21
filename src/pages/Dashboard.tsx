import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, TrendingUp } from 'lucide-react'
import { formatEur } from '@/lib/calculator'

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCompanies(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    }

    void fetchCompanies()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">MyCapTable</span>
          </div>
          <Button asChild size="sm">
            <Link to="/company/new">
              <Plus className="mr-2 h-4 w-4" />
              Unternehmen anlegen
            </Link>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Deine Unternehmen</h1>
          <p className="mt-1 text-muted-foreground">
            Verwalte Cap Tables und simuliere Finanzierungsrunden
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Lade Unternehmen...
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && companies.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="font-medium">Noch keine Unternehmen</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Lege dein erstes Unternehmen an um zu starten
              </p>
            </div>
            <Button asChild>
              <Link to="/company/new">
                <Plus className="mr-2 h-4 w-4" />
                Erstes Unternehmen anlegen
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link key={company.id} to={`/company/${company.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary">{company.legal_form}</Badge>
                    </div>
                    <CardDescription>
                      {company.founded_at
                        ? `Gegründet ${new Date(company.founded_at).getFullYear()}`
                        : 'Gründungsjahr unbekannt'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">Stammkapital</div>
                    <div className="text-2xl font-semibold tabular-nums">
                      {formatEur(company.share_capital)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
