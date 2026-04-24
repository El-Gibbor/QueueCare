import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const linkClass = ({ isActive }) =>
  `pb-1 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'text-civic-blue border-b-2 border-civic-blue'
      : 'text-civic-muted hover:text-civic-dark'
  }`;

export function NavBar() {
  const { user, dispatch } = useAuth();
  const navigate = useNavigate();

  function logout() {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  }

  return (
    <nav className="border-b border-civic-border bg-civic-surface px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link
          to="/appointments"
          data-cy="nav_home"
          className="flex items-center gap-2 font-bold text-civic-blue transition-colors duration-150 hover:brightness-95"
        >
          <Home size={20} aria-hidden="true" />
          <span>QueueCare</span>
        </Link>
        {user && (
          <div className="flex items-center gap-6 text-sm">
            <NavLink data-cy="nav_appointments" to="/appointments" className={linkClass}>
              Appointments
            </NavLink>
            {(user.role === 'staff' || user.role === 'admin') && (
              <NavLink data-cy="nav_queue" to="/queue" className={linkClass}>
                Queue
              </NavLink>
            )}
            <button
              data-cy="nav_logout"
              onClick={logout}
              className="text-sm font-medium text-civic-muted transition-colors duration-150 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
