import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import {
  Plus, ChevronLeft, ChevronRight, Trash2, Pencil,
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Calendar, X as XIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  useTransactions, useCreateTransaction, useUpdateTransaction,
  useDeleteTransaction, useFinanceStats,
} from '@/hooks/useFinance';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { FINANCE_CATEGORIES, MONTHS_UZ } from '@/utils/constants';
import type { Transaction, CreateTransactionDto, TransactionType } from '@/api/finance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── Date picker ─────────────────────────────────────────────────────────────

const DP_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const DP_DAYS   = ['Ya','Du','Se','Ch','Pa','Ju','Sh'];

function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value + 'T12:00:00') : undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const label = selected
    ? `${selected.getDate()} - ${DP_MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
    : 'Sanani tanlang';

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sana</label>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input-base flex items-center justify-between text-left"
      >
        <span className={selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 text-sm'}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="p-0.5 hover:text-red-400 text-gray-300 transition-colors"
            >
              <XIcon size={13} />
            </span>
          )}
          <Calendar size={15} className="text-gray-400" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 sm:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[280px] p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl sm:absolute sm:top-auto sm:left-auto sm:bottom-full sm:right-0 sm:mb-1 sm:translate-x-0 sm:translate-y-0"
            >
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  onChange(date ? date.toISOString().split('T')[0] : '');
                  if (date) setOpen(false);
                }}
                weekStartsOn={1}
                formatters={{
                  formatMonthCaption: (d) => `${DP_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                  formatWeekdayName: (d) => DP_DAYS[d.getDay()],
                }}
                classNames={{
                  root: 'w-full', months: 'w-full', month: 'w-full',
                  month_caption: 'relative flex items-center justify-center h-9 mb-2',
                  caption_label: 'text-sm font-bold text-gray-900 dark:text-gray-100',
                  nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
                  button_previous: 'h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors',
                  button_next: 'h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors',
                  month_grid: 'w-full border-collapse',
                  weekdays: 'flex w-full',
                  weekday: 'flex-1 text-center text-[11px] font-semibold text-gray-400 pb-2',
                  weeks: 'w-full space-y-1', week: 'flex w-full',
                  day: 'flex-1 flex justify-center p-[2px]',
                  day_button: 'w-full h-9 rounded-xl text-sm font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
                  outside: 'opacity-25', disabled: 'opacity-20 pointer-events-none', hidden: 'invisible',
                }}
                modifiersClassNames={{
                  selected: '!bg-[#0a9090] !text-white hover:!bg-[#0a9090]',
                  today: '!text-[#0a9090] !font-bold dark:!text-teal-400',
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n));
}

function getCategoryInfo(value: string) {
  return FINANCE_CATEGORIES.find((c) => c.value === value) ?? { label: value, emoji: '💳', type: 'expense' };
}

function groupByDate(txs: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = tx.date.split('T')[0];
    const arr = map.get(key) ?? [];
    arr.push(tx);
    map.set(key, arr);
  }
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Sarlavha kiriting').max(100),
  amount: z.coerce.number().positive('Miqdor musbat bo\'lishi kerak'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Kategoriya tanlang'),
  date: z.string().min(1, 'Sana kiriting'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function TransactionForm({
  onSubmit,
  loading,
  defaultValues,
}: {
  onSubmit: (data: CreateTransactionDto) => void;
  loading?: boolean;
  defaultValues?: Partial<Transaction>;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: defaultValues?.title ?? '',
      amount: defaultValues?.amount ?? ('' as unknown as number),
      type: defaultValues?.type ?? 'expense',
      category: defaultValues?.category ?? '',
      date: defaultValues?.date ? defaultValues.date.split('T')[0] : new Date().toISOString().split('T')[0],
      note: defaultValues?.note ?? '',
    },
  });

  const selectedType = watch('type');
  const filteredCategories = FINANCE_CATEGORIES.filter((c) => c.type === selectedType);

  const submit = (data: FormData) => {
    onSubmit({
      title: data.title,
      amount: data.amount,
      type: data.type as TransactionType,
      category: data.category as CreateTransactionDto['category'],
      date: new Date(data.date).toISOString(),
      note: data.note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit as any)} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {(['income', 'expense'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setValue('type', t);
              setValue('category', '');
            }}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              selectedType === t
                ? t === 'income'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            )}
          >
            {t === 'income' ? '💰 Daromad' : '💸 Xarajat'}
          </button>
        ))}
      </div>

      <Input
        label="Miqdor (so'm)"
        type="number"
        placeholder="0"
        error={errors.amount?.message}
        leftIcon={selectedType === 'income' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
        {...register('amount')}
      />

      <Input
        label="Sarlavha"
        placeholder={selectedType === 'income' ? 'Masalan: Oylik maosh' : 'Masalan: Oziq-ovqat'}
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategoriya</label>
        <select className="input-base" {...register('category')}>
          <option value="">Tanlang...</option>
          {filteredCategories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>

      <DateField value={watch('date')} onChange={(v) => setValue('date', v)} />
      {errors.date && <p className="text-xs text-red-500 -mt-3">{errors.date.message}</p>}

      <Textarea label="Izoh" placeholder="Qo'shimcha ma'lumot..." rows={2} {...register('note')} />

      <Button
        type="submit"
        loading={loading}
        className={cn('w-full', selectedType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : '')}
      >
        {defaultValues ? 'Yangilash' : 'Qo\'shish'}
      </Button>
    </form>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label, amount, icon, colorClass, trend,
}: {
  label: string;
  amount: number;
  icon: React.ReactNode;
  colorClass: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex items-center gap-4"
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colorClass)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={cn('text-lg font-bold tabular-nums truncate', amount < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white')}>
          {amount < 0 ? '−' : ''}
          {formatAmount(Math.abs(amount))}
        </p>
      </div>
      {trend && (
        <div className={cn('shrink-0', trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400')}>
          {trend === 'up' ? <ArrowUpRight size={18} /> : trend === 'down' ? <ArrowDownRight size={18} /> : null}
        </div>
      )}
    </motion.div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const cat = getCategoryInfo(tx.category);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 py-2.5 px-1 group"
    >
      <div className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0',
        tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30',
      )}>
        {cat.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.title}</p>
        <p className="text-xs text-gray-400">{cat.label}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          'text-sm font-semibold tabular-nums',
          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
        )}>
          {tx.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(tx)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(tx.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Finance() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useTransactions(year, month);
  const { data: stats = [] } = useFinanceStats(year);
  const createTx = useCreateTransaction(year, month);
  const updateTx = useUpdateTransaction(year, month);
  const deleteTx = useDeleteTransaction(year, month);

  // Summary
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  // Chart data — oxirgi 6 oy
  const chartData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      if (m <= 0) { m += 12; y -= 1; }
      const stat = stats.find((s) => s.month === m) ?? { income: 0, expense: 0 };
      result.push({
        name: MONTHS_UZ[m - 1],
        Daromad: Math.round(stat.income),
        Xarajat: Math.round(stat.expense),
      });
    }
    return result;
  }, [stats, year, month]);

  const grouped = useMemo(() => groupByDate(transactions), [transactions]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const handleSubmit = (dto: CreateTransactionDto) => {
    if (editing) {
      updateTx.mutate({ id: editing.id, dto }, { onSuccess: () => { setModalOpen(false); setEditing(null); } });
    } else {
      createTx.mutate(dto, { onSuccess: () => setModalOpen(false) });
    }
  };

  const openEdit = (tx: Transaction) => { setEditing(tx); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[140px] text-center">
            {MONTHS_UZ[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          label="Daromad"
          amount={totalIncome}
          icon={<TrendingUp size={22} className="text-emerald-600" />}
          colorClass="bg-emerald-100 dark:bg-emerald-900/30"
          trend="up"
        />
        <SummaryCard
          label="Xarajat"
          amount={totalExpense}
          icon={<TrendingDown size={22} className="text-red-500" />}
          colorClass="bg-red-100 dark:bg-red-900/30"
          trend="down"
        />
        <SummaryCard
          label="Balans"
          amount={balance}
          icon={<Wallet size={22} className="text-blue-500" />}
          colorClass="bg-blue-100 dark:bg-blue-900/30"
          trend={balance >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Main content — 2 col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transaction list */}
        <div className="lg:col-span-3 card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Tranzaksiyalar</h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <Wallet size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Bu oyda tranzaksiyalar yo'q</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {grouped.map(([date, txs]) => (
                <div key={date} className="py-2 first:pt-0">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 px-1">
                    {new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                  </p>
                  <AnimatePresence>
                    {txs.map((tx) => (
                      <TransactionRow
                        key={tx.id}
                        tx={tx}
                        onEdit={openEdit}
                        onDelete={(id) => deleteTx.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: chart + stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bar chart */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Oxirgi 6 oy
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number | undefined) => value != null ? formatAmount(value) : ''}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-chrome)',
                    fontSize: 12,
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-2)' }} />
                <Bar dataKey="Daromad" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Xarajat" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          {transactions.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Kategoriyalar
              </h3>
              {(() => {
                const catMap = new Map<string, number>();
                transactions.filter((t) => t.type === 'expense').forEach((t) => {
                  catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
                });
                const sorted = [...catMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 5);
                const total = sorted.reduce((s, [, v]) => s + v, 0);
                if (sorted.length === 0) return <p className="text-xs text-gray-400">Xarajatlar yo'q</p>;
                return sorted.map(([cat, amount]) => {
                  const info = getCategoryInfo(cat);
                  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                  return (
                    <div key={cat} className="mb-2">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300">{info.emoji} {info.label}</span>
                        <span className="text-gray-500 tabular-nums">{formatAmount(amount)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform z-30"
        style={{ backgroundColor: '#0a9090' }}
      >
        <Plus size={26} />
      </button>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Tranzaksiyani tahrirlash' : 'Yangi tranzaksiya'}
        size="sm"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          loading={createTx.isPending || updateTx.isPending}
          defaultValues={editing ?? undefined}
        />
      </Modal>
    </div>
  );
}
