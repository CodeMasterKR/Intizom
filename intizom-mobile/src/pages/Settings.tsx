import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Palette, Bell, LogOut, Sun, Moon, Save, Camera, Shield, ShieldOff, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarCropModal } from '@/components/ui/AvatarCropModal';
import { PinSetup } from '@/components/pin/PinSetup';
import { usePinStore } from '@/store/pinStore';
import { cn } from '@/utils/cn';
import type { Theme } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const MAX_FILE_MB = 10;

const sections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Xavfsizlik', icon: Lock },
  { id: 'appearance', label: 'Ko\'rinish', icon: Palette },
  { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
];

const themes: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light', label: 'Yorug\'', icon: Sun, desc: 'Doim yorug\' rejim' },
  { value: 'dark', label: 'Qorong\'u', icon: Moon, desc: 'Doim qorong\'u rejim' },
];

export function Settings() {
  const { user, logout, updateUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const { pinEnabled } = usePinStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pinSetupMode, setPinSetupMode] = useState<'set' | 'change' | 'disable' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm({ defaultValues: { name: user?.name ?? '', email: user?.email ?? '' } });
  const passwordForm = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  const setPasswordForm = useForm({ defaultValues: { newPassword: '', confirmPassword: '' } });

  const saveProfile = profileForm.handleSubmit(async (data) => {
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ name: data.name });
      updateUser({ name: updated.name });
    } catch {
      // fallback to local update
      updateUser({ name: data.name });
    } finally {
      setSaving(false);
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setFileError(null);
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Rasm hajmi ${MAX_FILE_MB}MB dan oshmasligi kerak`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropDone = async (blob: Blob) => {
    setAvatarSaving(true);
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const updated = await authApi.uploadAvatar(file);
      updateUser({ avatar: updated.avatar });
    } finally {
      setAvatarSaving(false);
      setCropSrc(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sozlamalar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Akkaunt va dastur sozlamalari</p>
      </div>

      {/* Mobile tabs */}
      <div className="flex lg:hidden gap-1 overflow-x-auto no-scrollbar bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              activeSection === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400',
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-red-500 ml-auto"
        >
          <LogOut size={14} /> Chiqish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar nav — desktop only */}
        <div className="hidden lg:block card p-2 h-fit">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeSection === id
                  ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
              )}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
          <div className="border-t border-default mt-2 pt-2">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            >
              <LogOut size={18} /> Chiqish
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile */}
          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Profil ma'lumotlari</h2>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar name={user?.name ?? 'User'} src={user?.avatar} size="xl" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarSaving}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-wait"
                  >
                    {avatarSaving
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera size={18} className="text-white" />
                    }
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={avatarSaving}
                  >
                    Rasm o'zgartirish
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP. Max {MAX_FILE_MB}MB</p>
                  {fileError && (
                    <p className="text-xs text-red-500 mt-1">{fileError}</p>
                  )}
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <Input label="Ism familiya" {...profileForm.register('name')} />
                <Input label="Email" type="email" {...profileForm.register('email')} disabled />
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>A'zo bo'lgan: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : '—'}</span>
                </div>
                <Button type="submit" loading={saving} icon={<Save size={16} />}>
                  Saqlash
                </Button>
              </form>
            </motion.div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
              {user?.hasPassword === false ? (
                /* ── Google user: set password ── */
                <>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Parol o'rnatish</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Parol o'rnatsangiz, email va parol bilan ham kira olasiz
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0 text-brand-500">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <p className="text-xs text-brand-700 dark:text-brand-300">
                      Google akkaunt orqali ro'yxatdan o'tilgan
                    </p>
                  </div>

                  <form
                    onSubmit={setPasswordForm.handleSubmit(async (data) => {
                      if (data.newPassword !== data.confirmPassword) {
                        setPasswordForm.setError('confirmPassword', { message: 'Parollar mos kelmadi' });
                        return;
                      }
                      setSaving(true);
                      try {
                        await authApi.setPassword(data.newPassword);
                        updateUser({ hasPassword: true });
                        setPasswordForm.reset();
                        toast.success('Parol muvaffaqiyatli o\'rnatildi');
                      } catch {
                        toast.error('Xatolik yuz berdi');
                      } finally {
                        setSaving(false);
                      }
                    })}
                    className="space-y-4"
                  >
                    <Input
                      label="Yangi parol"
                      type="password"
                      placeholder="Kamida 6 ta belgi"
                      error={setPasswordForm.formState.errors.newPassword?.message}
                      {...setPasswordForm.register('newPassword', { minLength: { value: 6, message: 'Kamida 6 ta belgi' } })}
                    />
                    <Input
                      label="Parolni tasdiqlang"
                      type="password"
                      placeholder="••••••••"
                      error={setPasswordForm.formState.errors.confirmPassword?.message}
                      {...setPasswordForm.register('confirmPassword')}
                    />
                    <Button type="submit" loading={saving} icon={<Lock size={16} />}>
                      Parol o'rnatish
                    </Button>
                  </form>
                </>
              ) : (
                /* ── Regular user: change password ── */
                <>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Parolni o'zgartirish</h2>
                  <form
                    onSubmit={passwordForm.handleSubmit(async (data) => {
                      if (data.newPassword !== data.confirmPassword) {
                        passwordForm.setError('confirmPassword', { message: 'Parollar mos kelmadi' });
                        return;
                      }
                      setSaving(true);
                      try {
                        await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
                        passwordForm.reset();
                        toast.success('Parol muvaffaqiyatli o\'zgartirildi');
                      } catch {
                        toast.error('Joriy parol noto\'g\'ri');
                      } finally {
                        setSaving(false);
                      }
                    })}
                    className="space-y-4"
                  >
                    <Input
                      label="Joriy parol"
                      type="password"
                      placeholder="••••••••"
                      error={passwordForm.formState.errors.currentPassword?.message}
                      {...passwordForm.register('currentPassword', { required: 'Majburiy' })}
                    />
                    <Input
                      label="Yangi parol"
                      type="password"
                      placeholder="Kamida 6 ta belgi"
                      error={passwordForm.formState.errors.newPassword?.message}
                      {...passwordForm.register('newPassword', { minLength: { value: 6, message: 'Kamida 6 ta belgi' } })}
                    />
                    <Input
                      label="Yangi parolni tasdiqlang"
                      type="password"
                      placeholder="••••••••"
                      error={passwordForm.formState.errors.confirmPassword?.message}
                      {...passwordForm.register('confirmPassword')}
                    />
                    <Button type="submit" loading={saving} icon={<Lock size={16} />}>
                      Parolni yangilash
                    </Button>
                  </form>
                </>
              )}

              {/* PIN section */}
              <div className="border-t border-default pt-5 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">PIN kod</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pinEnabled
                      ? 'Dastur ochilganda PIN kod so\'raladi'
                      : 'Ilovani 4 raqamli PIN bilan himoyalang'}
                  </p>
                </div>

                {pinEnabled ? (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<KeyRound size={15} />}
                      onClick={() => setPinSetupMode('change')}
                    >
                      PIN kodni o'zgartirish
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<ShieldOff size={15} />}
                      onClick={() => setPinSetupMode('disable')}
                    >
                      PIN kodni o'chirish
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Shield size={15} />}
                    onClick={() => setPinSetupMode('set')}
                  >
                    PIN kodni yoqish
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Ko'rinish</h2>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mavzu</p>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        'p-4 rounded-2xl border-2 transition-all text-left',
                        theme === value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700',
                      )}
                    >
                      <Icon size={22} className={theme === value ? 'text-brand-500' : 'text-gray-400'} />
                      <p className="text-sm font-semibold mt-2 text-gray-800 dark:text-gray-200">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Bildirishnomalar</h2>
              <div className="space-y-4">
                {[
                  { label: 'Odat eslatmalari', desc: 'Kunlik odat vaqtida eslatma' },
                  { label: 'Vazifa muddati', desc: 'Muddat yaqinlashganda' },
                  { label: 'Streak yo\'qolishi', desc: 'Streak uzilmasdan oldin' },
                  { label: 'Haftalik hisobot', desc: 'Har dushanba hisobot' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-brand-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Avatar crop modal */}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          loading={avatarSaving}
          onCancel={() => setCropSrc(null)}
          onCrop={handleCropDone}
        />
      )}

      {/* PIN setup modal */}
      {pinSetupMode && (
        <PinSetup
          mode={pinSetupMode}
          onClose={() => setPinSetupMode(null)}
        />
      )}
    </div>
  );
}
