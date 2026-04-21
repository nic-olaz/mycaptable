import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // Initiale Session prüfen
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) {
        void navigate('/login')
      }
    })

    // Auf Auth-Änderungen reagieren
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        void navigate('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  // Kurz warten bis Session-Status bekannt
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">
        Lade...
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
