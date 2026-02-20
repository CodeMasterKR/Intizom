import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { FullPageLoader } from '@/components/ui/Spinner';
import { RequireAdmin } from '@/components/auth/RequireAdmin';

// Lazy load pages for better performance
const Login = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Habits = lazy(() => import('@/pages/Habits').then((m) => ({ default: m.Habits })));
const Tasks = lazy(() => import('@/pages/Tasks').then((m) => ({ default: m.Tasks })));
const Goals = lazy(() => import('@/pages/Goals').then((m) => ({ default: m.Goals })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));
const Subscription = lazy(() => import('@/pages/Subscription').then((m) => ({ default: m.Subscription })));
const Finance = lazy(() => import('@/pages/Finance').then((m) => ({ default: m.Finance })));
const Principles = lazy(() => import('@/pages/Principles').then((m) => ({ default: m.Principles })));

// Admin pages
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications').then((m) => ({ default: m.AdminNotifications })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppTheme() {
  const { applyTheme } = useUIStore();
  useEffect(() => {
    applyTheme();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, [applyTheme]);
  return null;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppTheme />
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="habits" element={<Habits />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="goals" element={<Goals />} />
              <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
              <Route path="finance" element={<Finance />} />
              <Route path="principles" element={<Principles />} />
              <Route path="settings" element={<Settings />} />
              <Route path="subscription" element={<Subscription />} />
            </Route>
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{ duration: 3000, style: { borderRadius: 12 } }}
        />
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
