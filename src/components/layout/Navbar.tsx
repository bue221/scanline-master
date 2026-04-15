import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Play, Clock, FlaskConical, Cpu } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/',             label: 'Inicio',       icon: <Home size={16} /> },
  { to: '/fundamentos',  label: 'Fundamentos',  icon: <BookOpen size={16} /> },
  { to: '/simulador',    label: 'Paso a Paso',  icon: <Play size={16} /> },
  { to: '/historia',     label: 'Historia',     icon: <Clock size={16} /> },
  { to: '/laboratorio',  label: 'Laboratorio',  icon: <FlaskConical size={16} /> },
  { to: '/aplicaciones', label: 'Aplicaciones', icon: <Cpu size={16} /> },
];

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-indigo-700 text-base">
          <span className="bg-indigo-600 text-white rounded px-2 py-0.5 text-xs font-mono tracking-wider">
            SCAN
          </span>
          <span>ScanLine Master</span>
        </NavLink>

        {/* Links */}
        <ul className="flex items-center gap-1">
          {navItems.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-50',
                  ].join(' ')
                }
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
