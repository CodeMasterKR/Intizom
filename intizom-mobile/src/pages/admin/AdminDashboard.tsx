import { Users, UserCheck, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';
import { Spinner } from '@/components/ui/Spinner';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-default">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Jami foydalanuvchilar" value={stats?.totalUsers ?? 0} icon={Users} color="bg-blue-500" />
        <StatCard label="Sinov muddatida" value={stats?.trialUsers ?? 0} icon={Clock} color="bg-amber-500" />
        <StatCard label="Premium" value={stats?.activeUsers ?? 0} icon={UserCheck} color="bg-green-500" />
        <StatCard label="Muddati o'tgan" value={stats?.expiredUsers ?? 0} icon={XCircle} color="bg-red-500" />
        <StatCard label="Bekor qilingan" value={stats?.cancelledUsers ?? 0} icon={TrendingUp} color="bg-gray-500" />
      </div>

      <div className="mt-8 bg-surface rounded-2xl p-6 border border-default">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tezkor harakatlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/admin/users" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Users size={20} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Foydalanuvchilar</p>
              <p className="text-xs text-gray-500">Ko'rish va boshqarish</p>
            </div>
          </a>
          <a href="/admin/notifications" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Clock size={20} className="text-amber-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Bildirishnomalar</p>
              <p className="text-xs text-gray-500">Xabar yuborish</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
