import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Check, Flame, Search,
  Star, BookOpen, Dumbbell, Heart, Brain, Zap, Target, Shield,
  Sun, Moon, Leaf, Music, Coffee, Code, Gem, Compass, Anchor,
  Award, Bell, Bolt, Box, Camera, Clock, Crown, Diamond,
  Eye, Flag, Globe, Headphones, Home, Key, Lamp, Layers,
  Lock, Map, Mic, Mountain, Package, Palette, Pen, Phone,
  Printer, Puzzle, Rocket, Settings, Smile, Snowflake, Speaker,
  Sword, Trees, Trophy, Umbrella, Wind, Wifi, Watch, Waves,
} from 'lucide-react';
import {
  usePrinciples,
  useCreatePrinciple,
  useUpdatePrinciple,
  useDeletePrinciple,
  useTogglePrincipleCheck,
} from '@/hooks/usePrinciples';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import type { CreatePrincipleDto, Principle } from '@/types';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Star, BookOpen, Dumbbell, Heart, Brain, Zap, Target, Shield,
  Sun, Moon, Leaf, Music, Coffee, Code, Gem, Compass, Anchor,
  Award, Bell, Bolt, Box, Camera, Clock, Crown, Diamond,
  Eye, Flag, Globe, Headphones, Home, Key, Lamp, Layers,
  Lock, Map, Mic, Mountain, Package, Palette, Pen, Phone,
  Printer, Puzzle, Rocket, Settings, Smile, Snowflake, Speaker,
  Sword, Trees, Trophy, Umbrella, Wind, Wifi, Watch, Waves,
};

const ICON_NAMES = Object.keys(ICON_MAP);

function DynIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name] ?? Star;
  return <Icon size={size} className={className} />;
}

// ─── Icon Picker ──────────────────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = ICON_NAMES.filter((n) => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ikonka</label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 text-sm"
        />
      </div>
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1 rounded-xl border border-gray-200 dark:border-gray-700">
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              value === name
                ? 'bg-brand-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
            )}
          >
            <DynIcon name={name} size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Principle Form ───────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  icon: string;
}

function PrincipleForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<FormState>;
  onSubmit: (data: CreatePrincipleDto) => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    title: defaultValues?.title ?? '',
    description: defaultValues?.description ?? '',
    icon: defaultValues?.icon ?? 'Star',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Nom kiriting'); return; }
    onSubmit({ title: form.title.trim(), description: form.description.trim() || undefined, icon: form.icon });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Prinsip nomi"
        placeholder="Har kuni o'qish..."
        value={form.title}
        onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setError(''); }}
        error={error}
        maxLength={100}
      />
      <Textarea
        label="Izoh  "
        placeholder="Kamida 30 daqiqa kitob o'qish..."
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        maxLength={500}
      />
      <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
      <Button type="submit" loading={loading} className="w-full mt-2">
        Saqlash
      </Button>
    </form>
  );
}

// ─── Principle Card ───────────────────────────────────────────────────────────

function PrincipleCard({
  principle,
  onEdit,
  onDelete,
}: {
  principle: Principle;
  onEdit: (p: Principle) => void;
  onDelete: (id: string) => void;
}) {
  const toggle = useTogglePrincipleCheck();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 flex items-start gap-4"
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
        <DynIcon name={principle.icon} size={22} className="text-brand-600 dark:text-brand-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{principle.title}</span>
          {principle.streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-orange-500">
              <Flame size={13} />
              {principle.streak}
            </span>
          )}
        </div>
        {principle.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {principle.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toggle.mutate(principle.id)}
          disabled={toggle.isPending}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            principle.checkedToday
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-600',
          )}
        >
          <Check size={14} />
          <span className="hidden sm:inline">{principle.checkedToday ? 'Bajarildi' : 'Belgilash'}</span>
        </button>
        <button
          onClick={() => onEdit(principle)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          title="Tahrirlash"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(principle.id)}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
          title="O'chirish"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Principles() {
  const { data: principles = [], isLoading } = usePrinciples();
  const createMut = useCreatePrinciple();
  const updateMut = useUpdatePrinciple();
  const deleteMut = useDeletePrinciple();

  const [showAdd, setShowAdd] = useState(false);
  const [editPrinciple, setEditPrinciple] = useState<Principle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const checkedCount = principles.filter((p) => p.checkedToday).length;
  const total = principles.length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Qadriyatlarim</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Shaxsiy prinsiplar va qadriyatlar</p>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Bugungi jarayon</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{checkedCount}/{total}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* List */}
      {total === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gem size={28} className="text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Hali prinsip yo'q
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Shaxsiy qadriyatlaringizni qo'shing va ularni kunlik kuzating
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {principles.map((p) => (
              <PrincipleCard
                key={p.id}
                principle={p}
                onEdit={setEditPrinciple}
                onDelete={setDeleteId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform z-30"
        style={{ backgroundColor: '#0a9090' }}
      >
        <Plus size={26} />
      </button>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Yangi prinsip">
        <PrincipleForm
          onSubmit={(dto) => createMut.mutate(dto, { onSuccess: () => setShowAdd(false) })}
          loading={createMut.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editPrinciple} onClose={() => setEditPrinciple(null)} title="Prinsipni tahrirlash">
        {editPrinciple && (
          <PrincipleForm
            defaultValues={editPrinciple}
            onSubmit={(dto) =>
              updateMut.mutate(
                { id: editPrinciple.id, dto },
                { onSuccess: () => setEditPrinciple(null) },
              )
            }
            loading={updateMut.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="O'chirishni tasdiqlash" size="sm">
        <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
          Bu prinsipni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>
            Bekor qilish
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={deleteMut.isPending}
            onClick={() => deleteMut.mutate(deleteId!, { onSuccess: () => setDeleteId(null) })}
          >
            O'chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
