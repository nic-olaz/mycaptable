import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, UserCircle, LayoutDashboard } from 'lucide-react'
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
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150"
        >
          {/* Cap table icon */}
          <div className="w-7 h-7 rounded-md bg-[#1a3a2a] flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1"   y="1.5"  width="5.5" height="3"   rx="0.6" fill="white" fillOpacity="0.95" />
              <rect x="8.5" y="1.5"  width="5.5" height="3"   rx="0.6" fill="white" fillOpacity="0.5"  />
              <rect x="1"   y="6"    width="5.5" height="3"   rx="0.6" fill="white" fillOpacity="0.65" />
              <rect x="8.5" y="6"    width="5.5" height="3"   rx="0.6" fill="white" fillOpacity="0.4"  />
              <rect x="1"   y="10.5" width="5.5" height="3"   rx="0.6" fill="white" fillOpacity="0.4"  />
              <rect x="8.5" y="10.5" width="5.5" height="3"   rx="0.6" fill="white" fillOpacity="0.25" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">
            <span className="text-[#1a1917]">my</span><span className="text-[#1a3a2a]">captable</span>
          </span>
        </Link>

        {/* Navigation */}
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
                Account
              </Link>
              <button
                onClick={() => { void handleLogout() }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6b6860] hover:text-[#1a1917] rounded-md hover:bg-[#f1f0ed] transition-colors duration-150"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          )}

          {isLoggedIn === false && (
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-medium text-[#1a3a2a] border border-[#1a3a2a]/30 rounded-lg hover:bg-[#1a3a2a] hover:text-white hover:border-transparent transition-all duration-150"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
