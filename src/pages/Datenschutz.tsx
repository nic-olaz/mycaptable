import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

export default function Datenschutz() {
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
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-muted-foreground mb-8">Stand: April 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO:
            </p>
            <p className="mt-2">
              Nicolas Meibohm<br />
              Alte Str. 9<br />
              38173 Veltheim (Ohe)<br />
              E-Mail:{' '}
              <a
                href="mailto:nicolas.meibohm@gmail.com"
                className="text-primary hover:underline"
              >
                nicolas.meibohm@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              2. Zweck und Grundlage der Verarbeitung
            </h2>
            <p>
              MyCapTable ist eine private, nicht-kommerzielle Webanwendung zur Verwaltung
              von Gesellschafterlisten (Cap Tables) für Startups. Die Verarbeitung
              personenbezogener Daten erfolgt ausschließlich zum Zweck der
              Bereitstellung dieser Anwendung (Art. 6 Abs. 1 lit. b DSGVO –
              Vertragserfüllung / vorvertragliche Maßnahmen).
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              3. Erhobene Daten
            </h2>
            <h3 className="font-medium text-foreground mt-4 mb-1">Authentifizierung</h3>
            <p>
              Zur Anmeldung wird ausschließlich deine E-Mail-Adresse verwendet. Wir
              setzen Supabase Magic Links ein – es wird kein Passwort gespeichert. Die
              E-Mail-Adresse wird in der Supabase-Datenbank gespeichert und dient als
              eindeutiger Nutzeridentifikator.
            </p>
            <h3 className="font-medium text-foreground mt-4 mb-1">Anwendungsdaten</h3>
            <p>
              Alle von dir eingepflegten Unternehmensdaten (Gesellschafter, Runden,
              Anteile) werden in deinem Account gespeichert und sind ausschließlich
              für dich sichtbar (Row Level Security via Supabase).
            </p>
            <h3 className="font-medium text-foreground mt-4 mb-1">Server-Logdaten</h3>
            <p>
              Beim Aufrufen der Website werden automatisch technische Daten übermittelt
              (IP-Adresse, Browser, Betriebssystem, Datum/Uhrzeit). Diese Daten werden
              durch den Hosting-Anbieter Vercel verarbeitet und sind für uns nicht
              dauerhaft einsehbar.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">4. Cookies</h2>
            <p>
              Diese Anwendung verwendet ausschließlich technisch notwendige Cookies.
              Konkret wird nach erfolgreicher Anmeldung ein Session-Cookie durch
              Supabase Auth gesetzt, das dich eingeloggt hält. Es werden keine
              Tracking-Cookies, Marketing-Cookies oder Analytics-Cookies gesetzt.
            </p>
            <p className="mt-2">
              Da keine nicht-notwendigen Cookies verwendet werden, ist kein
              Cookie-Banner erforderlich (§ 25 Abs. 2 Nr. 2 TTDSG).
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              5. Eingesetzte Dienste und Auftragsverarbeiter
            </h2>

            <h3 className="font-medium text-foreground mt-4 mb-1">Vercel (Hosting)</h3>
            <p>
              Diese Anwendung wird über Vercel Inc., 340 S Lemon Ave #4133, Walnut,
              CA 91789, USA gehostet. Vercel verwendet Serverstandorte in der EU
              (Region Frankfurt, fra1). Eine Datenübermittlung in die USA kann bei
              Nutzung von Vercel-Diensten nicht vollständig ausgeschlossen werden.
              Grundlage: EU-Standardvertragsklauseln (SCCs). Weitere Informationen:{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                vercel.com/legal/privacy-policy
              </a>
            </p>

            <h3 className="font-medium text-foreground mt-4 mb-1">
              Supabase (Datenbank & Authentifizierung)
            </h3>
            <p>
              Alle Anwendungsdaten und Authentifizierungsdaten werden in einer
              Supabase-Datenbank gespeichert. Betreiber: Supabase Inc., 970 Toa Payoh
              North #07-04, Singapore 318992. Die Datenhaltung erfolgt ausschließlich
              in der EU-Region eu-central-1 (Frankfurt, Deutschland). Eine
              Datenübertragung in die USA ist technisch möglich (US-Unternehmensstruktur),
              erfolgt aber auf Basis von EU-Standardvertragsklauseln. Weitere
              Informationen:{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                supabase.com/privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">6. Analytics</h2>
            <p>
              Es werden keinerlei Analytics-Tools, Tracking-Pixel oder vergleichbare
              Dienste eingesetzt. Es findet kein Nutzungsmonitoring statt.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              7. Deine Rechte (DSGVO Art. 15–21)
            </h2>
            <p>Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung ("Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Du kannst dein Konto und alle damit verbundenen Daten jederzeit direkt
              in der Anwendung unter{' '}
              <Link to="/account" className="text-primary hover:underline">
                Konto
              </Link>
              {' '}selbst löschen (Art. 17 DSGVO – Recht auf Löschung).
            </p>
            <p className="mt-2">
              Zur Ausübung weiterer Rechte wende dich per E-Mail an:{' '}
              <a
                href="mailto:nicolas.meibohm@gmail.com"
                className="text-primary hover:underline"
              >
                nicolas.meibohm@gmail.com
              </a>
            </p>
            <p className="mt-2">
              Du hast außerdem das Recht, dich bei einer Datenschutzaufsichtsbehörde
              zu beschweren. Zuständig ist der Landesbeauftragte für den Datenschutz
              Niedersachsen.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              8. Datenlöschung
            </h2>
            <p>
              Daten werden gelöscht, sobald sie für den Zweck ihrer Erhebung nicht mehr
              erforderlich sind oder du die Löschung beantragst. Session-Daten werden
              nach Ablauf der Session automatisch ungültig. Kontodaten bleiben
              gespeichert, solange du einen aktiven Account hast.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-foreground mb-3">
              9. Änderungen dieser Datenschutzerklärung
            </h2>
            <p>
              Diese Datenschutzerklärung kann bei wesentlichen Änderungen der
              Anwendung oder der rechtlichen Rahmenbedingungen angepasst werden.
              Das Datum der letzten Aktualisierung ist oben angegeben.
            </p>
          </section>
        </div>
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
