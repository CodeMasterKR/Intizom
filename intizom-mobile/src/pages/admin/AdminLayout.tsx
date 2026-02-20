import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/admin/notifications', icon: Bell, label: 'Bildirishnomalar' },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen pb-16 lg:pb-0" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Admin topbar */}
      <header className="h-14 bg-red-600 dark:bg-red-700 flex items-center px-4 gap-4 sticky top-0 z-30">
        <NavLink to="/dashboard" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm">
          <ArrowLeft size={16} />
          <span>Chiqish</span>
        </NavLink>
        <span className="text-white font-semibold text-sm">Admin Panel</span>
      </header>

      <div className="flex">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-56 min-h-[calc(100vh-56px)] bg-surface border-r border-default p-3 space-y-1 shrink-0">
          {ADMIN_NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  isActive
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t"
        style={{ backgroundColor: 'var(--bg-chrome)', borderColor: 'var(--border)' }}>
        {ADMIN_NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
                isActive
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400',
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
