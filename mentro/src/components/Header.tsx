import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, LogOut, History, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export function Header() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goToLogin = () => {
    navigate('/auth', { state: { from: location.pathname } });
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-2 px-4 sm:px-8 py-4"
      style={{
        backgroundColor: 'rgba(15, 10, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-sm font-black uppercase tracking-widest"
        style={{ color: '#f5f3ff' }}
      >
        Men<span style={{ color: '#7c3aed' }}>tro</span>
      </Link>

      {/* Auth controls */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {loading ? null : user ? (
          <>
            <button
              onClick={() => navigate('/history')}
              title="History"
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#a78bfa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.color = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                e.currentTarget.style.color = '#a78bfa';
              }}
            >
              <History className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">History</span>
            </button>
            <Link
              to="/dashboard"
              title="Dashboard"
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#a78bfa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.color = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                e.currentTarget.style.color = '#a78bfa';
              }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">Dashboard</span>
            </Link>
            <button
              onClick={() => void signOut()}
              title="Sign out"
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#a78bfa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.color = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                e.currentTarget.style.color = '#a78bfa';
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {/* Log in — ghost style */}
            <button
              onClick={goToLogin}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#a78bfa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.color = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                e.currentTarget.style.color = '#a78bfa';
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log in
            </button>

            {/* Sign up — filled style */}
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
              style={{ backgroundColor: '#7c3aed', color: '#f5f3ff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6d28d9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
