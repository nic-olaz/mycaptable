import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AppHeaderProps {
  children?: React.ReactNode
}

export default function AppHeader({ children }: AppHeaderProps) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await signOut()
    void navigate('/')
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">MyCapTable</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {children}

          {isLoggedIn === true && (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/dashboard">Mein Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/account">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Konto
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { void handleLogout() }}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </>
          )}

          {isLoggedIn === false && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <Link to="/login">Anmelden</Link>
            </Button>
          )}

          {/* isLoggedIn === null: Session wird noch geprüft, nichts rendern */}
        </div>
      </div>
    </header>
  )
}
