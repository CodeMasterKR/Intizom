import { Check, X, Clock, Zap, ArrowRight, Shield, BarChart3, Bell, Download } from 'lucide-react';
import { useSubscription, useUpgradeSubscription, useCancelSubscription } from '@/hooks/useSubscription';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/Spinner';

const FREE_FEATURES = [
  { label: '5 ta odat (cheklangan)', included: true },
  { label: '10 ta vazifa', included: true },
  { label: '2 ta maqsad', included: true },
  { label: 'Asosiy statistika', included: true },
  { label: 'Kengaytirilgan tahlil', included: false },
  { label: 'Cheksiz odatlar va vazifalar', included: false },
  { label: "Ma'lumotlarni eksport", included: false },
  { label: 'Ustuvor qo\'llab-quvvatlash', included: false },
];

const PREMIUM_FEATURES = [
  { icon: Zap, label: 'Cheksiz odatlar, vazifalar va maqsadlar' },
  { icon: BarChart3, label: 'Kengaytirilgan statistika va haftalik hisobotlar' },
  { icon: Bell, label: 'Shaxsiy bildirishnoma sozlamalari' },
  { icon: Download, label: "Ma'lumotlarni CSV/PDF formatda eksport" },
  { icon: Shield, label: 'Ustuvor texnik qo\'llab-quvvatlash' },
];

export function Subscription() {
  const { data: info, isLoading } = useSubscription();
  const user = useAuthStore((s) => s.user);
  const daysLeft = useAuthStore((s) => s.daysLeftTrial());
  const upgrade = useUpgradeSubscription();
  const cancel = useCancelSubscription();

  const isActive = user?.subscriptionStatus === 'ACTIVE';
  const isTrial = user?.subscriptionStatus === 'TRIAL';
  const isExpired = user?.subscriptionStatus === 'EXPIRED';

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Obuna rejasi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Intizom bilan maqsadlaringizga tezroq erishing
        </p>
      </div>

      {/* Status bar */}
      {(isTrial || isExpired) && (
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 border ${
          isExpired
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            : daysLeft <= 3
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
        }`}>
          <Clock size={18} className={isExpired ? 'text-red-500 shrink-0' : 'text-amber-500 shrink-0'} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${isExpired ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {isExpired
                ? 'Sinov muddatingiz tugadi'
                : `Sinov muddatingiz: ${daysLeft} kun qoldi`}
            </p>
            <p className={`text-xs mt-0.5 ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isExpired ? 'Ba\'zi funksiyalar cheklangan' : 'Premium ga o\'ting va barcha imkoniyatlardan foydalaning'}
            </p>
          </div>
        </div>
      )}

      {isActive && (
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3 border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Premium obuna faol</p>
            {info?.subscriptionEndDate && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Keyingi to'lov: {new Date(info.subscriptionEndDate).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pricing grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Free plan */}
        <div className="bg-surface rounded-2xl border border-default overflow-hidden">
          <div className="p-6 pb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bepul</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
              <span className="text-gray-400 mb-1.5 text-sm">/oy</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Boshlash uchun yetarli</p>
          </div>
          <div className="px-6 pb-6">
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5">
                  {f.included
                    ? <Check size={15} className="text-emerald-500 shrink-0" />
                    : <X size={15} className="text-gray-300 dark:text-gray-600 shrink-0" />
                  }
                  <span className={`text-sm ${f.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="w-full py-2.5 text-center text-sm font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
              Joriy reja
            </div>
          </div>
        </div>

        {/* Premium plan */}
        <div className="bg-gray-950 dark:bg-white rounded-2xl overflow-hidden relative">
          {/* Recommended badge */}
          <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Tavsiya etiladi
          </div>

          <div className="p-6 pb-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Premium</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-white dark:text-gray-900">$1</span>
              <span className="text-gray-400 dark:text-gray-500 mb-1.5 text-sm">/oy</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">Barcha funksiyalar cheksiz</p>
          </div>

          <div className="px-6 pb-6">
            <ul className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-brand-400" />
                  </div>
                  <span className="text-sm text-gray-300 dark:text-gray-600">{label}</span>
                </li>
              ))}
            </ul>

            {!isActive ? (
              <button
                onClick={() => upgrade.mutate()}
                disabled={upgrade.isPending}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
              >
                {upgrade.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Yuklanmoqda...</>
                ) : (
                  <>Premium ga o'tish <ArrowRight size={15} /></>
                )}
              </button>
            ) : (
              <button
                onClick={() => confirm('Obunani bekor qilishni tasdiqlaysizmi?') && cancel.mutate()}
                disabled={cancel.isPending}
                className="w-full py-3 border border-gray-700 dark:border-gray-300 text-gray-400 dark:text-gray-600 font-medium rounded-xl hover:bg-white/5 dark:hover:bg-black/5 transition-colors disabled:opacity-50 text-sm"
              >
                {cancel.isPending ? 'Bekor qilinmoqda...' : 'Obunani bekor qilish'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-surface rounded-2xl border border-default divide-y divide-default">
        {[
          { q: 'To\'lov qanday amalga oshiriladi?', a: 'Xavfsiz to\'lov tizimi orqali. Karta ma\'lumotlaringiz saqlanmaydi.' },
          { q: 'Istalgan vaqtda bekor qilish mumkinmi?', a: 'Ha, obunani istalgan vaqtda bekor qilishingiz mumkin. To\'lov davri tugaguncha kirish saqlanadi.' },
          { q: 'Sinov muddatida karta kerakmi?', a: 'Yo\'q. 14 kunlik sinov davri to\'liq bepul, karta ma\'lumoti talab qilinmaydi.' },
        ].map(({ q, a }) => (
          <div key={q} className="p-5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{q}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
