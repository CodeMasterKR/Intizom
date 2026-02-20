import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { mockUser } from '@/api/mock';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const schema = z.object({
  name: z.string().min(2, 'Kamida 2 ta harf').max(60),
  email: z.string().email('Noto\'g\'ri email'),
  password: z.string().min(6, 'Kamida 6 ta belgi'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Parollar mos kelmadi',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const features = [
  'Kunlik odatlarni kuzatib boring',
  'Maqsadlaringizni belgilab oling',
  'Statistika va tahlillar',
  'Shaxsiy rivojlanish grafigi',
];

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleRegister = useGoogleLogin({
    flow: 'implicit',
    ux_mode: 'popup',
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const res = await authApi.googleLogin(tokenResponse.access_token);
        login(res.user, res.accessToken, res.refreshToken);
        toast.success('Xush kelibsiz!');
        navigate('/dashboard');
      } catch {
        toast.error('Google orqali kirishda xatolik');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google orqali kirishda xatolik'),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (USE_MOCK) {
        login({ ...mockUser, name: data.name, email: data.email }, 'mock-access-token', 'mock-refresh-token');
        toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
        navigate('/dashboard');
        return;
      }
      const res = await authApi.register({ name: data.name, email: data.email, password: data.password });
      login(res.user, res.accessToken, res.refreshToken);
      toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    }
  };

  return (
    <div className="h-screen flex">

      {/* ── Left: Brand panel ──────────────────────── */}
      <div
        className="hidden lg:flex w-[480px] flex-shrink-0 flex-col items-center justify-center p-14 relative overflow-hidden"
        style={{ backgroundColor: '#0a9090' }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="relative z-10 text-white max-w-xs"
        >
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">Intizom</span>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl font-bold leading-snug mb-4" style={{ color: 'rgba(255,255,255,0.97)' }}>
            Bugundan<br />boshlang
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Minglab foydalanuvchilar Intizom bilan maqsadlariga erishmoqda.
          </p>

          {/* Features */}
          <ul className="space-y-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <CheckCircle2 size={16} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Right: Form ────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-8 lg:p-14"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[360px]"
        >
          {/* Heading */}
          <h1 className="text-2xl font-semibold mb-7" style={{ color: 'var(--text-1)' }}>
            Ro'yxatdan o'ting
          </h1>

          {/* Google button */}
          <button
            type="button"
            onClick={() => !USE_MOCK && handleGoogleRegister()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 disabled:opacity-60 cursor-pointer hover:brightness-95 dark:hover:brightness-125 mb-5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-1)',
            }}
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Google bilan ro'yxatdan o'tish
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-2)' }}>yoki</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Ism"
              placeholder="Abdullayev Abdulla"
              leftIcon={<User size={15} />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="siz@email.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Parol"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="p-1 transition-colors"
                  style={{ color: 'var(--text-2)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Parolni tasdiqlang"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" loading={isSubmitting} className="w-full !mt-6">
              Ro'yxatdan o'tish
            </Button>
          </form>

          {/* Divider + link */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-center text-sm" style={{ color: 'var(--text-2)' }}>
              Akkauntingiz bormi?{' '}
              <Link
                to="/login"
                className="font-medium transition-colors"
                style={{ color: '#0a9090' }}
              >
                Kiring
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
