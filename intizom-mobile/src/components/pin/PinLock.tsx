import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Zap } from 'lucide-react';
import { usePinStore } from '@/store/pinStore';
import { useAuthStore } from '@/store/authStore';

const PAD = ['1','2','3','4','5','6','7','8','9','','0','del'];

function Dots({ filled, error }: { filled: number; error: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-5"
      animate={error ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: i === filled - 1 && !error ? [1, 1.35, 1] : 1 }}
          transition={{ duration: 0.18 }}
          className="w-4 h-4 rounded-full"
          style={{
            border: `2.5px solid ${i < filled ? '#0a9090' : 'rgba(156,163,175,0.6)'}`,
            backgroundColor: i < filled ? '#0a9090' : 'transparent',
          }}
        />
      ))}
    </motion.div>
  );
}

export function PinLock() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { verifyPin, unlock, disablePin } = usePinStore();
  const { logout } = useAuthStore();

  const shake = () => {
    setError(true);
    setTimeout(() => { setPin(''); setError(false); }, 700);
  };

  const handleDigit = useCallback((d: string) => {
    if (error || pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (verifyPin(next)) unlock();
        else shake();
      }, 80);
    }
  }, [pin, error, verifyPin, unlock]);

  const handleDel = useCallback(() => {
    if (!error) setPin(p => p.slice(0, -1));
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center select-none"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mt-16">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 18 }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#0a9090' }}
        >
          <Zap size={30} className="text-white" />
        </motion.div>
        <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-1)' }}>Intizom</p>
      </div>

      {/* Dots */}
      <div className="flex flex-col items-center gap-5 mt-14">
        <AnimatePresence mode="wait">
          <motion.p
            key={error ? 'err' : 'ok'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium"
            style={{ color: error ? '#ef4444' : 'var(--text-2)' }}
          >
            {error ? 'PIN kod noto\'g\'ri ❌' : 'PIN kodni kiriting'}
          </motion.p>
        </AnimatePresence>
        <Dots filled={pin.length} error={error} />
      </div>

      {/* Numpad */}
      <div className="mt-10 grid grid-cols-3 gap-3 px-8 w-full max-w-[300px]">
        {PAD.map((key, idx) => {
          if (!key) return <div key={idx} />;
          if (key === 'del') {
            return (
              <motion.button
                key="del"
                whileTap={{ scale: 0.88, opacity: 0.7 }}
                onClick={handleDel}
                className="h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <Delete size={22} style={{ color: 'var(--text-2)' }} />
              </motion.button>
            );
          }
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.88, opacity: 0.7 }}
              onClick={() => handleDigit(key)}
              className="h-16 rounded-2xl text-2xl font-semibold"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
            >
              {key}
            </motion.button>
          );
        })}
      </div>

      {/* Forgot */}
      <button
        onClick={() => { disablePin(); logout(); }}
        className="mt-10 text-xs px-5 py-2.5 rounded-xl"
        style={{ color: 'var(--text-2)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        PIN kodni unutdim → Tizimdan chiqish
      </button>
    </motion.div>
  );
}
