import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { saveGuestStateToSupabase } from '@/lib/guestState'

export default function AuthCallback() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    // Verhindert Doppel-Ausführung im StrictMode
    if (handled.current) return
    handled.current = true

    // Supabase wertet den URL-Hash/Query automatisch aus.
    // Wir lauschen auf das SIGNED_IN-Event und speichern dann den Guest State.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        saveGuestStateToSupabase(session.user.id)
          .catch((err) => {
            console.error('Guest State konnte nicht gespeichert werden:', err)
          })
          .finally(() => {
            void navigate('/dashboard')
          })
      }
    })

    // Fallback: Falls die Session bereits vorhanden ist (z.B. Magic Link)
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        saveGuestStateToSupabase(data.session.user.id)
          .catch((err) => {
            console.error('Guest State konnte nicht gespeichert werden:', err)
          })
          .finally(() => {
            void navigate('/dashboard')
          })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
      <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
      <p className="text-sm">Wird angemeldet...</p>
    </div>
  )
}
