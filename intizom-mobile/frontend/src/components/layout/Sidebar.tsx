import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, CheckSquare, Flame,
  Settings, Menu, Zap, Crown, ShieldCheck, Wallet, Gem,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Asosiy' },
  { to: '/habits', icon: Flame, label: 'Odatlar' },
  { to: '/tasks', icon: CheckSquare, label: 'Vazifalar' },
  { to: '/goals', icon: Target, label: 'Maqsadlar' },
  { to: '/finance', icon: Wallet, label: 'Moliya' },
  { to: '/principles', icon: Gem, label: 'Qadriyatlar' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ backgroundColor: 'var(--bg-chrome)', borderColor: 'var(--border)' }}
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'border-r',
          'transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-14 px-3 shrink-0 gap-2',
          sidebarCollapsed && 'justify-center',
        )}
        style={{ borderBottom: '1px solid var(--border)' }}
      >
          {/* Toggle button — hamburger icon */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
              else toggleSidebar();
            }}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
            title="Menyu"
          >
            <Menu size={18} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Logo — shown only when expanded */}
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">Intizom</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn('nav-item min-h-[44px]', isActive && 'nav-item-active')}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}

          <NavLink
            to="/subscription"
            onClick={() => setSidebarOpen(false)}
            className={cn('nav-item min-h-[44px]', location.pathname === '/subscription' && 'nav-item-active')}
            title={sidebarCollapsed ? 'Obuna' : undefined}
          >
            <Crown size={20} className="shrink-0 text-amber-500" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">Obuna</span>}
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={cn('nav-item min-h-[44px]', location.pathname.startsWith('/admin') && 'nav-item-active')}
              title={sidebarCollapsed ? 'Admin' : undefined}
            >
              <ShieldCheck size={20} className="shrink-0 text-red-500" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">Admin</span>}
            </NavLink>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 space-y-1 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={cn('nav-item min-h-[44px]', location.pathname === '/settings' && 'nav-item-active')}
            title={sidebarCollapsed ? 'Sozlamalar' : undefined}
          >
            <Settings size={20} className="shrink-0" />
            {!sidebarCollapsed && <span>Sozlamalar</span>}
          </NavLink>

          <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl', sidebarCollapsed && 'justify-center')}>
            <Avatar name={user?.name ?? 'User'} src={user?.avatar} size="sm" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

      </motion.aside>
    </>
  );
}
