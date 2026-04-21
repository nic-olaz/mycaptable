import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'

interface AppHeaderProps {
  children?: React.ReactNode
}

export default function AppHeader({ children }: AppHeaderProps) {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    void navigate('/login')
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { void handleLogout() }}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  )
}
