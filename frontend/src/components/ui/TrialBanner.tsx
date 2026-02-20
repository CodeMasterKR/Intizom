import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const daysLeft = useAuthStore((s) => s.daysLeftTrial());

  if (dismissed) return null;
  if (!user) return null;
  if (user.subscriptionStatus !== 'TRIAL' && user.subscriptionStatus !== 'EXPIRED') return null;

  const isExpired = user.subscriptionStatus === 'EXPIRED' || daysLeft === 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm ${isExpired ? 'bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900' : 'bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900'}`}>
      {isExpired ? (
        <AlertTriangle size={16} className="text-red-500 shrink-0" />
      ) : (
        <Clock size={16} className="text-amber-500 shrink-0" />
      )}

      <span className={`flex-1 ${isExpired ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
        {isExpired
          ? 'Sinov muddatingiz tugadi. Premium ga o\'ting va barcha imkoniyatlardan foydalaning.'
          : `Sinov muddatingiz: ${daysLeft} kun qoldi.`}
      </span>

      <Link
        to="/subscription"
        className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${isExpired ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
      >
        Premium
      </Link>

      <button
        onClick={() => setDismissed(true)}
        className={`p-1 rounded-lg transition-colors ${isExpired ? 'text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30' : 'text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/30'}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
