import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithGoogle, signInWithApple, signInWithMagicLink } from '@/lib/auth'
import { useCapTable } from '@/context/CapTableContext'

// Inline Google-Icon als SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// Inline Apple-Icon als SVG
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

export default function LoginModal() {
  const { showLoginModal, closeLoginModal } = useCapTable()
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState<'google' | 'apple' | 'magic' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setError(null)
    setLoading('google')
    try {
      await signInWithGoogle()
      // Redirect passiert automatisch
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei Google-Anmeldung')
      setLoading(null)
    }
  }

  async function handleApple() {
    setError(null)
    setLoading('apple')
    try {
      await signInWithApple()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei Apple-Anmeldung')
      setLoading(null)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading('magic')
    try {
      await signInWithMagicLink(email)
      setMagicLinkSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden')
    } finally {
      setLoading(null)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeLoginModal()
      setMagicLinkSent(false)
      setEmail('')
      setError(null)
    }
  }

  return (
    <Dialog open={showLoginModal} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Speichere deinen Cap Table</DialogTitle>
          <DialogDescription className="text-center">
            Melde dich an, um deinen Cap Table zu speichern und
            <br />
            später wieder aufzurufen.
          </DialogDescription>
        </DialogHeader>

        {magicLinkSent ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
            <p className="font-medium">Prüf deine E-Mails</p>
            <p className="mt-1 text-green-700">
              Wir haben einen Magic Link an <strong>{email}</strong> geschickt.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Google */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => { void handleGoogle() }}
              disabled={loading !== null}
            >
              <GoogleIcon />
              {loading === 'google' ? 'Weiterleitung...' : 'Mit Google anmelden'}
            </Button>

            {/* Apple */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => { void handleApple() }}
              disabled={loading !== null}
            >
              <AppleIcon />
              {loading === 'apple' ? 'Weiterleitung...' : 'Mit Apple anmelden'}
            </Button>

            {/* Trennlinie */}
            <div className="relative flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">oder</span>
              <div className="flex-1 border-t" />
            </div>

            {/* Magic Link */}
            <form onSubmit={(e) => { void handleMagicLink(e) }} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-email" className="text-sm">
                  E-Mail-Adresse
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@beispiel.de"
                  required
                  disabled={loading !== null}
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                disabled={loading !== null}
              >
                {loading === 'magic' ? 'Wird gesendet...' : 'Magic Link senden'}
              </Button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          <Link to="/impressum" className="hover:text-foreground" onClick={closeLoginModal}>
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-foreground" onClick={closeLoginModal}>
            Datenschutz
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
