import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, Monitor, Search, X, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { notificationsApi } from '@/api/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import type { Theme, Notification } from '@/types';

const themeIcons: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

const TYPE_COLORS: Record<Notification['type'], string> = {
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-12 z-30 w-80 sm:w-96 bg-surface border border-default rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-default">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Bildirishnomalar</p>
          {unreadCount > 0 && (
            <span className="bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
            >
              <CheckCheck size={13} />
              Barchasini o'qi
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Bildirishnomalar yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-default">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer',
                  notif.read
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    : 'bg-brand-50/40 dark:bg-brand-950/10 hover:bg-brand-50/70 dark:hover:bg-brand-950/20',
                )}
                onClick={() => !notif.read && markRead.mutate(notif.id)}
              >
                <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', TYPE_COLORS[notif.type])} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', notif.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white')}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead.mutate(notif.id); }}
                    className="p-1 hover:bg-brand-100 dark:hover:bg-brand-950/30 rounded-lg transition-colors shrink-0"
                  >
                    <Check size={13} className="text-brand-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Header() {
  const { setSidebarOpen, theme, setTheme } = useUIStore();
  const { user } = useAuthStore();
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    enabled: !!user,
    refetchInterval: 60000,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Yorug\'' },
    { value: 'dark', label: 'Qorong\'u' },
    { value: 'system', label: 'Tizim' },
  ];

  const ThemeIcon = themeIcons[theme];

  return (
    <header className="h-14 flex items-center justify-between px-3 lg:px-5 border-b shrink-0" style={{ backgroundColor: 'var(--bg-chrome)', borderColor: 'var(--border)' }}>
      {/* Left */}
      <div className="flex items-center gap-2">
        {/* Sidebar open — mobile only */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          title="Menyu"
        >
          <Menu size={18} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            placeholder="Qidirish..."
            className="bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <div className="relative">
          <button
            onClick={() => { setThemeOpen((v) => !v); setNotifOpen(false); }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ThemeIcon size={18} className="text-gray-600 dark:text-gray-400" />
          </button>

          <AnimatePresence>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 z-30 bg-surface border border-default rounded-xl shadow-lg p-1 min-w-[140px]"
                >
                  {themes.map(({ value, label }) => {
                    const Icon = themeIcons[value];
                    return (
                      <button
                        key={value}
                        onClick={() => { setTheme(value); setThemeOpen(false); }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                          theme === value
                            ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
                        )}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setThemeOpen(false); }}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </AnimatePresence>
        </div>

        {/* Avatar + name */}
        <Link to="/settings" className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <Avatar name={user?.name ?? 'User'} src={user?.avatar} size="sm" />
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
            {user?.name?.split(' ')[0]}
          </span>
        </Link>
      </div>
    </header>
  );
}
