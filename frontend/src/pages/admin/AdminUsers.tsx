import { useState } from 'react';
import { Search, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminUsers, useUpdateAdminUser, useDeleteAdminUser } from '@/hooks/useAdmin';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminUser, UserRole, SubscriptionStatus } from '@/types';
import { format } from 'date-fns';

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  TRIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIAL: 'Sinov',
  ACTIVE: 'Premium',
  EXPIRED: 'Muddati o\'tgan',
  CANCELLED: 'Bekor qilingan',
};

function EditUserModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<SubscriptionStatus>(user.subscriptionStatus);
  const updateUser = useUpdateAdminUser();

  const handleSave = () => {
    updateUser.mutate(
      { id: user.id, dto: { role, subscriptionStatus: status } },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Foydalanuvchini tahrirlash
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
            >
              <option value="USER">Foydalanuvchi</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Obuna holati
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
            >
              <option value="TRIAL">Sinov</option>
              <option value="ACTIVE">Premium</option>
              <option value="EXPIRED">Muddati o'tgan</option>
              <option value="CANCELLED">Bekor qilingan</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Bekor
          </button>
          <button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {updateUser.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const deleteUser = useDeleteAdminUser();

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    subscriptionStatus: statusFilter || undefined,
    page,
    limit: 15,
  });

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  const handleDelete = (user: AdminUser) => {
    if (confirm(`"${user.name}" ni o'chirishni tasdiqlaysizmi?`)) {
      deleteUser.mutate(user.id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Foydalanuvchilar</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 bg-surface border border-default rounded-xl px-3.5 py-2.5">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ism yoki email qidirish..."
            className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 text-sm bg-surface border border-default rounded-xl text-gray-900 dark:text-white outline-none"
        >
          <option value="">Barcha holatlar</option>
          <option value="TRIAL">Sinov</option>
          <option value="ACTIVE">Premium</option>
          <option value="EXPIRED">Muddati o'tgan</option>
          <option value="CANCELLED">Bekor qilingan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-default overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Foydalanuvchi</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rol</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Obuna</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Sinov tugashi</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Faollik</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {user.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[user.subscriptionStatus]}`}>
                          {STATUS_LABELS[user.subscriptionStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                        {format(new Date(user.trialEndDate), 'dd.MM.yyyy')}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-gray-500">
                          {user._count.habits}H · {user._count.tasks}T · {user._count.goals}M
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-default">
                <p className="text-sm text-gray-500">
                  Jami {data?.total ?? 0} ta
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
}
