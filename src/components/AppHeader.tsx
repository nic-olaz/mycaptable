import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, LogOut, UserCircle, LayoutDashboard } from 'lucide-react'
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity duration-150"
        >
          <TrendingUp className="h-4.5 w-4.5 text-[#1a3a2a]" />
          <span className="text-base font-semibold tracking-tight">
            <span className="text-[#1a1917]">my</span><span className="text-[#1a3a2a]">captable</span>
          </span>
        </Link>

        {/* Navigation rechts */}
        <div className="flex items-center gap-1">
          {children}

          {isLoggedIn === true && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6b6860] hover:text-[#1a1917] rounded-md hover:bg-[#f1f0ed] transition-colors duration-150"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6b6860] hover:text-[#1a1917] rounded-md hover:bg-[#f1f0ed] transition-colors duration-150"
              >
                <UserCircle className="h-4 w-4" />
                Konto
              </Link>
              <button
                onClick={() => { void handleLogout() }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6b6860] hover:text-[#1a1917] rounded-md hover:bg-[#f1f0ed] transition-colors duration-150"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </>
          )}

          {isLoggedIn === false && (
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm text-[#6b6860] hover:text-[#1a1917] rounded-md hover:bg-[#f1f0ed] transition-colors duration-150"
            >
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
