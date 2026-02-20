import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { usePinStore } from '@/store/pinStore';

const PAD = ['1','2','3','4','5','6','7','8','9','','0','del'];

type Mode = 'enter' | 'confirm' | 'verify-old' | 'enter-new' | 'confirm-new';

function Dots({ filled, error }: { filled: number; error: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-4"
      animate={error ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: i === filled - 1 && !error ? [1, 1.35, 1] : 1 }}
          transition={{ duration: 0.18 }}
          className="w-3.5 h-3.5 rounded-full"
          style={{
            border: `2.5px solid ${i < filled ? '#0a9090' : 'rgba(156,163,175,0.5)'}`,
            backgroundColor: i < filled ? '#0a9090' : 'transparent',
          }}
        />
      ))}
    </motion.div>
  );
}

interface Props {
  /** 'set' = enable new PIN, 'change' = change PIN, 'disable' = disable PIN */
  mode: 'set' | 'change' | 'disable';
  onClose: () => void;
}

const TITLES: Record<Mode, string> = {
  'enter':       'PIN kodni kiriting',
  'confirm':     'PIN kodni tasdiqlang',
  'verify-old':  'Joriy PIN kodni kiriting',
  'enter-new':   'Yangi PIN kodni kiriting',
  'confirm-new': 'Yangi PIN kodni tasdiqlang',
};

const SUBTITLES: Record<Mode, string> = {
  'enter':       '4 raqamli PIN belgilang',
  'confirm':     'Tasdiqlash uchun qayta kiriting',
  'verify-old':  'O\'zgartirish uchun tasdiqlang',
  'enter-new':   '4 raqamli yangi PIN belgilang',
  'confirm-new': 'Tasdiqlash uchun qayta kiriting',
};

export function PinSetup({ mode, onClose }: Props) {
  const { enablePin, disablePin, changePin, verifyPin } = usePinStore();
  const [step, setStep] = useState<Mode>(
    mode === 'set' ? 'enter' : mode === 'disable' ? 'verify-old' : 'verify-old'
  );
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState(false);

  const shake = (cb?: () => void) => {
    setError(true);
    setTimeout(() => {
      setPin('');
      setError(false);
      cb?.();
    }, 700);
  };

  const advance = useCallback((entered: string) => {
    switch (step) {
      case 'enter': {
        // first entry of new PIN — go to confirm
        setFirstPin(entered);
        setPin('');
        setStep('confirm');
        break;
      }
      case 'confirm': {
        if (entered === firstPin) {
          enablePin(entered);
          toast.success('PIN kod muvaffaqiyatli o\'rnatildi');
          onClose();
        } else {
          shake(() => { setFirstPin(''); setStep('enter'); });
        }
        break;
      }
      case 'verify-old': {
        if (verifyPin(entered)) {
          if (mode === 'disable') {
            disablePin();
            toast.success('PIN kod o\'chirildi');
            onClose();
          } else {
            // change mode — go to enter new
            setPin('');
            setStep('enter-new');
          }
        } else {
          shake();
        }
        break;
      }
      case 'enter-new': {
        setFirstPin(entered);
        setPin('');
        setStep('confirm-new');
        break;
      }
      case 'confirm-new': {
        if (entered === firstPin) {
          changePin(entered);
          toast.success('PIN kod muvaffaqiyatli o\'zgartirildi');
          onClose();
        } else {
          shake(() => { setFirstPin(''); setStep('enter-new'); });
        }
        break;
      }
    }
  }, [step, firstPin, mode, enablePin, disablePin, changePin, verifyPin, onClose]);

  const handleDigit = useCallback((d: string) => {
    if (error || pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => advance(next), 80);
    }
  }, [pin, error, advance]);

  const handleDel = useCallback(() => {
    if (!error) setPin(p => p.slice(0, -1));
  }, [error]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full sm:w-auto sm:min-w-[320px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 select-none"
          style={{ backgroundColor: 'var(--bg-page)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} style={{ color: '#0a9090' }} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={step}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-semibold text-sm"
                  style={{ color: 'var(--text-1)' }}
                >
                  {TITLES[step]}
                </motion.span>
              </AnimatePresence>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <X size={16} style={{ color: 'var(--text-2)' }} />
            </button>
          </div>

          {/* Subtitle + dots */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={step + (error ? '-err' : '')}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs"
                style={{ color: error ? '#ef4444' : 'var(--text-2)' }}
              >
                {error ? 'PIN kod noto\'g\'ri ❌' : SUBTITLES[step]}
              </motion.p>
            </AnimatePresence>
            <Dots filled={pin.length} error={error} />
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
            {PAD.map((key, idx) => {
              if (!key) return <div key={idx} />;
              if (key === 'del') {
                return (
                  <motion.button
                    key="del"
                    whileTap={{ scale: 0.88, opacity: 0.7 }}
                    onClick={handleDel}
                    className="h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                  >
                    <Delete size={20} style={{ color: 'var(--text-2)' }} />
                  </motion.button>
                );
              }
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.88, opacity: 0.7 }}
                  onClick={() => handleDigit(key)}
                  className="h-14 rounded-2xl text-xl font-semibold"
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
