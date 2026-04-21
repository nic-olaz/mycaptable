import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <Link to="/login" className="text-xl font-semibold tracking-tight hover:opacity-80">
            MyCapTable
          </Link>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl py-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Impressum</h1>

        <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-base font-medium text-foreground mb-2">
              Angaben gemäß § 5 TMG
            </h2>
            <p>Nicolas Meibohm</p>
            <p>Alte Str. 9</p>
            <p>38173 Veltheim (Ohe)</p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground mb-2">Kontakt</h2>
            <p>
              E-Mail:{' '}
              <a
                href="mailto:nicolas.meibohm@gmail.com"
                className="text-primary hover:underline"
              >
                nicolas.meibohm@gmail.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground mb-2">Hinweis</h2>
            <p>
              Diese Plattform wird als privates Projekt ohne kommerzielle Absicht betrieben.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground mb-2">
              Haftung für Inhalte
            </h2>
            <p>
              Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die
              Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine
              Gewähr übernommen werden. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG
              für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-foreground mb-2">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte
              wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
              keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
              jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
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
