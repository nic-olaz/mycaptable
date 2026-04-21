import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'

export default function Account() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email)
      }
    })
  }, [])

  async function handleDeleteAccount() {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        throw new Error('Keine aktive Sitzung gefunden.')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }))
        throw new Error((body as { error?: string }).error ?? 'Löschen fehlgeschlagen.')
      }

      await signOut()
      void navigate('/login')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 container max-w-xl py-12">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">Konto</h1>

        {/* E-Mail-Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Angemeldete E-Mail-Adresse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{email || '—'}</p>
          </CardContent>
        </Card>

        {/* Konto löschen */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Konto löschen</CardTitle>
            <CardDescription>
              Löscht dein Konto sowie alle gespeicherten Unternehmen, Gesellschafter und Runden
              unwiderruflich. Diese Aktion kann nicht rückgängig gemacht werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Konto löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konto endgültig löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion löscht dein Konto und alle deine Daten unwiderruflich.
                    Alle Unternehmen, Gesellschafterlisten und Finanzierungsrunden werden
                    permanent entfernt. Eine Wiederherstellung ist nicht möglich.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { void handleDeleteAccount() }}
                  >
                    Konto endgültig löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
