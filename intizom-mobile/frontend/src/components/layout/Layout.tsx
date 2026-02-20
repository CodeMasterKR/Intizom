import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TrialBanner } from '@/components/ui/TrialBanner';
import { useUIStore } from '@/store/uiStore';

export function Layout() {
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar />

      {/* Main area — on mobile takes full width, on lg respects sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:transition-[margin] lg:duration-200 lg:ease-in-out"
        style={{ marginLeft: 0 }}
      >
        {/* Desktop sidebar offset */}
        <style>{`
          @media (min-width: 1024px) {
            .main-content-area { margin-left: ${sidebarCollapsed ? '72px' : '240px'}; transition: margin 0.2s ease; }
          }
        `}</style>

        <div className="main-content-area flex flex-col flex-1 overflow-hidden h-full">
          <TrialBanner />
          <Header />

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
