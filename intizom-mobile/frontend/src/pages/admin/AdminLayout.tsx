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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Admin topbar */}
      <header className="h-14 bg-red-600 dark:bg-red-700 flex items-center px-4 gap-4">
        <NavLink to="/dashboard" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm">
          <ArrowLeft size={16} />
          <span>Chiqish</span>
        </NavLink>
        <span className="text-white font-semibold text-sm">Admin Panel</span>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-[calc(100vh-56px)] bg-surface border-r border-default p-3 space-y-1">
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
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
