import { useState } from 'react';
import { Send, Users, User } from 'lucide-react';
import { useBroadcastNotification, useSendNotification } from '@/hooks/useAdmin';

type NotifType = 'info' | 'success' | 'warning' | 'error';

export function AdminNotifications() {
  const [mode, setMode] = useState<'broadcast' | 'targeted'>('broadcast');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotifType>('info');
  const [userIds, setUserIds] = useState('');

  const broadcast = useBroadcastNotification();
  const sendTo = useSendNotification();

  const isPending = broadcast.isPending || sendTo.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (mode === 'broadcast') {
      broadcast.mutate({ title, message, type }, {
        onSuccess: () => { setTitle(''); setMessage(''); },
      });
    } else {
      const ids = userIds.split(',').map((s) => s.trim()).filter(Boolean);
      if (!ids.length) return;
      sendTo.mutate({ title, message, type, userIds: ids }, {
        onSuccess: () => { setTitle(''); setMessage(''); setUserIds(''); },
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bildirishnomalar yuborish</h1>

      <div className="max-w-lg">
        {/* Mode selector */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setMode('broadcast')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'broadcast'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Users size={16} />
            Barcha foydalanuvchilarga
          </button>
          <button
            onClick={() => setMode('targeted')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'targeted'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <User size={16} />
            Muayyan foydalanuvchilarga
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 border border-default space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Sarlavha
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bildirishnoma sarlavhasi..."
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Xabar
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Bildirishnoma matni..."
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tur
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotifType)}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
            >
              <option value="info">Ma'lumot</option>
              <option value="success">Muvaffaqiyat</option>
              <option value="warning">Ogohlantirish</option>
              <option value="error">Xato</option>
            </select>
          </div>

          {mode === 'targeted' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Foydalanuvchi IDlari (vergul bilan)
              </label>
              <input
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                placeholder="id1, id2, id3..."
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {isPending ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </form>
      </div>
    </div>
  );
}
