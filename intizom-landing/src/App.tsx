import { useEffect, useRef, useState } from 'react';
import {
  Zap, Flame, CheckSquare, Target, BarChart3, Wallet,
  ArrowRight, Star, Shield, Smartphone, Users, TrendingUp,
  ChevronDown, Menu, X, Check, Monitor,
} from 'lucide-react';

// ─── Intersection Observer hook ──────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Navbar ────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { href: '#features', label: 'Imkoniyatlar' },
    { href: '#how', label: 'Qanday ishlaydi' },
    { href: '#pricing', label: 'Narxlar' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
      style={scrolled ? { background: 'rgba(8,12,16,0.92)' } : {}}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">Intizom</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Kirish</a>
          <a
            href="#"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-brand-500/30 hover:scale-105"
          >
            Bepul boshlash
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-3" style={{ background: 'rgba(8,12,16,0.97)' }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-300 hover:text-brand-400 py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-1 border-t border-white/5">
            <a href="#" className="block text-sm font-medium text-gray-500 hover:text-brand-400 py-1 transition-colors">Kirish</a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Phone ───────────────────────────────────────────────────────────────

function HeroPhone() {
  return (
    <div className="relative w-[258px] sm:w-[278px]">
      {/* Glow behind phone */}
      <div className="absolute inset-6 bg-brand-500/30 rounded-[44px] blur-3xl" />
      {/* Shell */}
      <div className="relative bg-[#1c1c1e] rounded-[44px] p-[10px] shadow-2xl border border-white/10">
        <div className="rounded-[36px] overflow-hidden flex flex-col" style={{ height: 558, background: '#0d1117' }}>
          {/* Status bar */}
          <div className="flex-shrink-0 flex justify-between items-center px-5 pt-3 pb-0">
            <span className="text-[11px] font-bold text-white">9:41</span>
            <div className="flex gap-1.5 items-center">
              <div className="flex gap-0.5 items-end h-3">
                {[3, 4, 5, 6].map(h => <div key={h} className="w-[3px] bg-white rounded-sm" style={{ height: h }} />)}
              </div>
              <div className="w-5 h-2.5 border-[1.5px] border-white/70 rounded-sm relative ml-0.5">
                <div className="absolute inset-[2px] bg-white rounded-[1px]" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
          {/* Dynamic island */}
          <div className="flex-shrink-0 flex justify-center py-2">
            <div className="w-24 h-[22px] bg-black rounded-full" />
          </div>
          {/* Content */}
          <div className="flex-1 overflow-hidden px-4 pb-2">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-gray-500 text-[11px]">Xush kelibsiz 👋</p>
                <p className="text-white text-sm font-bold mt-0.5">Sardor</p>
              </div>
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
            </div>
            {/* Streak card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-500 rounded-2xl p-3.5 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-brand-100 text-[10px] mb-0.5">Joriy streak</p>
                  <p className="text-white text-[22px] font-black leading-none">21 🔥</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-100 text-[10px] mb-0.5">Bugun</p>
                  <p className="text-white text-base font-bold leading-none">6/8</p>
                  <p className="text-brand-200 text-[10px]">bajarildi</p>
                </div>
              </div>
              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            {/* Habits */}
            <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-wider mb-2">Bugungi odatlar</p>
            <div className="space-y-1.5 mb-3">
              {[
                { label: 'Ertalabki mashq', done: true },
                { label: "Kitob o'qi: 30 bet", done: true },
                { label: 'Meditation', done: false },
                { label: '10 000 qadam', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: '#1f2937' }}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-brand-500' : 'border-2 border-gray-600'}`}>
                    {done && <Check size={8} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-[11px] ${done ? 'text-gray-600 line-through' : 'text-gray-200'}`}>{label}</span>
                </div>
              ))}
            </div>
            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { v: '4', l: 'Vazifa', bg: '#1e3a5f', tc: '#60a5fa' },
                { v: '2', l: 'Maqsad', bg: '#2d1b69', tc: '#a78bfa' },
                { v: '87%', l: 'Progress', bg: '#064e3b', tc: '#34d399' },
              ].map(({ v, l, bg, tc }) => (
                <div key={l} className="rounded-xl p-2 text-center" style={{ background: bg }}>
                  <p className="text-sm font-black" style={{ color: tc }}>{v}</p>
                  <p className="text-gray-500 text-[10px]">{l}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom nav */}
          <div className="flex-shrink-0 border-t border-white/5 px-5 py-2.5 flex justify-around" style={{ background: '#0d1117' }}>
            {[CheckSquare, Flame, Target, Wallet].map((Icon, i) => (
              <Icon key={i} size={18} className={i === 0 ? 'text-brand-400' : 'text-gray-700'} />
            ))}
          </div>
          <div className="flex-shrink-0 flex justify-center py-2" style={{ background: '#0d1117' }}>
            <div className="w-20 h-1 bg-white/15 rounded-full" />
          </div>
        </div>
      </div>
      {/* Side buttons */}
      <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-[#444] rounded-r-lg" />
      <div className="absolute -left-[3px] top-24 w-[3px] h-9 bg-[#444] rounded-l-lg" />
      <div className="absolute -left-[3px] top-36 w-[3px] h-9 bg-[#444] rounded-l-lg" />
      <div className="absolute -left-[3px] top-48 w-[3px] h-9 bg-[#444] rounded-l-lg" />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16" style={{ background: '#080c10' }}>
      {/* Animated bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-40 w-[520px] h-[520px] bg-brand-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-purple-700/15 rounded-full blur-3xl animate-float animate-delay-300" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[250px] bg-brand-500/10 rounded-full blur-3xl animate-float animate-delay-600" />
        <div className="absolute inset-0 hero-grid" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6 xl:gap-16">

          {/* ── LEFT: text content ── */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 order-1">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7 animate-fade-up"
              style={{ background: 'rgba(10,144,144,0.12)', border: '1px solid rgba(10,144,144,0.25)', color: '#5dc8c8' }}>
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-slow" />
              500+ odam bugun o'smoqda
            </div>

            {/* Headline */}
            <h1 className="text-[44px] sm:text-[58px] lg:text-[64px] xl:text-[72px] font-extrabold leading-[1.06] tracking-tight mb-6 text-white animate-fade-up animate-delay-100">
              Maqsadlaring<br />
              <span className="hero-shimmer-text">haqiqatga</span><br />
              <span className="text-white">aylansin</span>
            </h1>

            {/* Sub */}
            <p className="text-base sm:text-lg leading-relaxed mb-8 animate-fade-up animate-delay-200 mx-auto lg:mx-0 max-w-lg"
              style={{ color: '#8b9db0' }}>
              Odatlar, vazifalar, maqsadlar va moliyani bir joyda boshqaring.{' '}
              <span className="text-gray-300 font-medium">Har kuni kichik qadamlar — katta o'zgarish.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10 animate-fade-up animate-delay-300">
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold rounded-2xl text-sm text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0a9090, #087878)', boxShadow: '0 8px 32px rgba(10,144,144,0.35)' }}
              >
                Bepul boshlash — 14 kun
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-2xl text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}
              >
                Imkoniyatlarni ko'rish
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 mb-8 animate-fade-up animate-delay-400">
              <div className="flex -space-x-2.5">
                {['bg-brand-400', 'bg-purple-400', 'bg-emerald-400', 'bg-amber-400', 'bg-pink-400'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} flex items-center justify-center text-white text-xs font-bold`}
                    style={{ border: '2px solid #080c10' }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5 justify-center lg:justify-start">
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                  <span className="text-white text-sm font-bold ml-1.5">4.9</span>
                </div>
                <p className="text-xs" style={{ color: '#64748b' }}>500+ foydalanuvchi ishonadi</p>
              </div>
            </div>

            {/* Key numbers */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xs sm:max-w-sm mx-auto lg:mx-0 animate-fade-up animate-delay-500">
              {[
                { num: '21+', label: 'kun streak rekord' },
                { num: '98%', label: 'foydalanuvchi mamnun' },
                { num: '12K+', label: 'vazifa bajarildi' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-white mb-0.5">{num}</div>
                  <div className="text-[11px] leading-tight" style={{ color: '#64748b' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: phone + floating badges ── */}
          <div className="relative flex-1 flex justify-center lg:justify-end items-center order-2 animate-fade-up animate-delay-300">
            <div className="relative">
              <HeroPhone />

              {/* Badge 1 — streak */}
              <div className="absolute -top-5 -left-3 sm:-left-10 xl:-left-16 bg-white rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 animate-float"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🔥</div>
                <div>
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap">21 kun streak!</p>
                  <p className="text-[10px] text-gray-400">Ertalabki mashq</p>
                </div>
              </div>

              {/* Badge 2 — goal */}
              <div className="absolute -bottom-4 -right-3 sm:-right-10 xl:-right-16 bg-white rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 animate-float animate-delay-200"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🎯</div>
                <div>
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap">Maqsad 87%</p>
                  <p className="text-[10px] text-gray-400">Kitob o'qish</p>
                </div>
              </div>

              {/* Badge 3 — savings (lg+) */}
              <div className="hidden xl:flex absolute top-2/5 -right-20 bg-white rounded-2xl shadow-2xl px-3 py-2.5 items-center gap-2.5 animate-float animate-delay-400"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#f0fafa' }}>💰</div>
                <div>
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap">+320 000 so'm</p>
                  <p className="text-[10px] text-gray-400">Bu oy tejaldi</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <ChevronDown size={20} style={{ color: '#334155' }} />
      </div>
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────

function Stats() {
  const { ref, inView } = useInView();
  const items = [
    { value: '500+', label: 'Faol foydalanuvchi' },
    { value: '12K+', label: 'Bajarilgan vazifalar' },
    { value: '98%', label: 'Mamnunlik darajasi' },
    { value: '4.9★', label: 'O\'rtacha reyting' },
  ];
  return (
    <section className="py-20" style={{ background: 'linear-gradient(to bottom, #080c10 0%, #083a3a 30%, #0a7070 60%, #087878 100%)' }}>
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {items.map(({ value, label }, i) => (
            <div
              key={label}
              className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl sm:text-4xl font-extrabold mb-1">{value}</div>
              <div className="text-brand-100 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-500/10',
    title: 'Odat kuzatuvi',
    desc: 'Kuniga bitta yangi odat — yilga 365 o\'zgarish. Streak tizimi sizi to\'xtatmasdan oldinga undaydi.',
    tag: 'Streak tizimi',
  },
  {
    icon: CheckSquare,
    color: 'from-blue-400 to-brand-500',
    bg: 'bg-blue-500/10',
    title: 'Vazifa menejeri',
    desc: 'Miyangizdan yukni oling — hamma narsani tizimga kiriting. Hech qanday muhim ish unutilmaydi.',
    tag: 'Kanban board',
  },
  {
    icon: Target,
    color: 'from-purple-400 to-pink-500',
    bg: 'bg-purple-500/10',
    title: 'Maqsad tizimi',
    desc: 'Orzu qilish yetmaydi — aniq reja kerak. Katta maqsadni kichik qadamlarga bo\'ling va har birini bajaring.',
    tag: 'Progress tracking',
  },
  {
    icon: Wallet,
    color: 'from-brand-400 to-brand-600',
    bg: 'bg-brand-500/10',
    title: 'Moliyaviy nazorat',
    desc: 'Pul qayerga ketayotganini bilmaysizmi? Har bir tiyin nazorat ostida — daromad, xarajat, balans.',
    tag: 'Yangi!',
  },
  {
    icon: BarChart3,
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/10',
    title: 'Keng statistika',
    desc: 'O\'zingizni ko\'ring. Haftalik va oylik grafiklar sizning eng yaxshi murabbiyingiz — haqiqiy raqamlar bilan.',
    tag: 'Vizual tahlil',
  },
  {
    icon: Smartphone,
    color: 'from-brand-400 to-brand-600',
    bg: 'bg-brand-500/10',
    title: 'Istalgan joydan',
    desc: 'Uydan, yo\'ldan, ishdan — intizomingiz siz bilan birga. Telefon, planshet, kompyuter — bir xil qulay.',
    tag: 'Responsive',
  },
];

function FeatureCard({ icon: Icon, color, bg, title, desc, tag, delay }: typeof FEATURES[0] & { delay: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl p-6 border hover:-translate-y-1 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: '#111827', borderColor: '#1f2937', transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <div className={`bg-gradient-to-br ${color} rounded-lg p-2`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#1f2937', color: '#94a3b8' }}>{tag}</span>
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Features() {
  const { ref, inView } = useInView();
  return (
    <section id="features" className="py-24" style={{ background: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-400 text-xs font-semibold mb-4" style={{ background: 'rgba(10,144,144,0.1)', border: '1px solid rgba(10,144,144,0.2)' }}>
            <Zap size={12} />
            Barcha kerakli vositalar bir joyda
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Nima uchun{' '}
            <span className="gradient-text">Intizom?</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            Ko'pchilik maqsadlariga erisha olmaydi — chunki tizim yo'q. Intizom sizga o'sha tizimni beradi.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App Preview ──────────────────────────────────────────────────────────────

// Desktop page contents
function DashboardContent() {
  return (
    <div className="h-full overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Xush kelibsiz, Sardor! 👋</h2>
          <p className="text-xs text-gray-400 mt-0.5">Dushanba, 18 fevral 2026</p>
        </div>
        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { val: '12 🔥', label: 'Streak', cls: 'bg-orange-50 text-orange-600' },
          { val: '8/11', label: 'Vazifalar', cls: 'bg-emerald-50 text-emerald-600' },
          { val: '3/5', label: 'Odatlar', cls: 'bg-purple-50 text-purple-600' },
        ].map(({ val, label, cls }) => (
          <div key={label} className={`${cls} rounded-xl p-3 text-center`}>
            <div className="text-xl font-black">{val}</div>
            <div className="text-xs opacity-70 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Bugungi odatlar</h3>
      <div className="space-y-1.5 mb-4">
        {[
          { label: 'Ertalabki mashq', done: true, streak: 12 },
          { label: "Kitob o'qi: 30 bet", done: true, streak: 7 },
          { label: 'Meditation', done: false, streak: 5 },
        ].map(({ label, done, streak }) => (
          <div key={label} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'border-2 border-gray-300'}`}>
              {done && <Check size={8} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`flex-1 text-xs ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{label}</span>
            <span className="text-xs text-orange-500 font-semibold">🔥{streak}</span>
          </div>
        ))}
      </div>
      <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Bugungi vazifalar</h3>
      <div className="space-y-1">
        {[
          { label: 'Loyiha taqdimotini tayyorla', done: true, hi: true },
          { label: 'Email javob ber', done: true, hi: false },
          { label: 'Hisobot yoz', done: false, hi: true },
        ].map(({ label, done, hi }) => (
          <div key={label} className="flex items-center gap-2 px-2 py-1.5">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
              {done && <Check size={7} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`flex-1 text-xs ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{label}</span>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hi ? 'bg-red-400' : 'bg-amber-400'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitsContent() {
  const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
  const habits = [
    { label: 'Ertalabki mashq', streak: 12, days: [true,true,true,true,true,true,false] },
    { label: "Kitob o'qi", streak: 7, days: [true,false,true,true,true,false,false] },
    { label: 'Meditation', streak: 5, days: [true,true,true,false,true,false,false] },
    { label: 'Suv iching (2L)', streak: 21, days: [true,true,true,true,true,true,false] },
    { label: 'Erta tur (6:00)', streak: 3, days: [false,true,true,true,false,false,false] },
  ];
  return (
    <div className="h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-900">Odatlar</h2>
        <button className="px-3 py-1.5 bg-brand-500 text-white text-xs font-semibold rounded-lg">+ Yangi odat</button>
      </div>
      <div className="flex items-center gap-2 mb-2 px-3">
        <div className="w-36 shrink-0 text-xs text-gray-400 font-medium">Odat nomi</div>
        {days.map(d => <div key={d} className="flex-1 text-center text-xs text-gray-400 font-medium">{d}</div>)}
        <div className="w-10 text-center text-xs text-gray-400">🔥</div>
      </div>
      <div className="space-y-2">
        {habits.map(({ label, streak, days: d }) => (
          <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
            <div className="w-36 shrink-0 text-xs font-medium text-gray-700 truncate">{label}</div>
            {d.map((done, i) => (
              <div key={i} className="flex-1 flex justify-center">
                <div className={`w-5 h-5 rounded-full ${done ? 'bg-brand-500' : 'bg-gray-200'}`} />
              </div>
            ))}
            <div className="w-10 text-center text-xs font-bold text-orange-500">{streak}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceContent() {
  return (
    <div className="h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-900">Moliya</h2>
        <span className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500">Fevral 2026</span>
      </div>
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-4 mb-4 text-white">
        <p className="text-brand-200 text-xs mb-1">Joriy balans</p>
        <p className="text-2xl font-black">4 250 000 <span className="text-sm font-normal">so'm</span></p>
        <div className="flex gap-8 mt-3">
          <div>
            <p className="text-brand-200 text-xs">Daromad</p>
            <p className="text-sm font-bold text-emerald-300">+8 500 000</p>
          </div>
          <div>
            <p className="text-brand-200 text-xs">Xarajat</p>
            <p className="text-sm font-bold text-red-300">-4 250 000</p>
          </div>
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">So'nggi tranzaksiyalar</h3>
      <div className="space-y-2">
        {[
          { label: 'Oziq-ovqat', amount: '-320 000', icon: '🛒', cls: 'bg-red-50 text-red-500' },
          { label: 'Maosh', amount: '+8 500 000', icon: '💼', cls: 'bg-emerald-50 text-emerald-600' },
          { label: 'Transport', amount: '-45 000', icon: '🚗', cls: 'bg-orange-50 text-orange-500' },
          { label: 'Netflix', amount: '-75 000', icon: '📺', cls: 'bg-purple-50 text-purple-500' },
        ].map(({ label, amount, icon, cls }) => (
          <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
            <div className={`w-8 h-8 rounded-lg ${cls} flex items-center justify-center text-sm flex-shrink-0`}>{icon}</div>
            <span className="flex-1 text-xs font-medium text-gray-700">{label}</span>
            <span className={`text-xs font-bold ${amount.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile page contents
function MobileDashboardContent() {
  return (
    <div className="px-4 py-2 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-gray-400">Xush kelibsiz,</p>
          <p className="text-sm font-bold text-gray-900">Sardor 👋</p>
        </div>
        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      </div>
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-3.5 mb-3 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-brand-100 text-xs">Joriy streak</p>
            <p className="text-2xl font-black">12 🔥</p>
          </div>
          <div className="text-right">
            <p className="text-brand-100 text-xs">Bajarildi</p>
            <p className="text-xl font-bold">8/11</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-purple-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">Odatlar</p>
          <p className="text-lg font-black text-purple-600">3/5</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">Maqsad</p>
          <p className="text-lg font-black text-amber-600">2/3</p>
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-600 mb-2">Bugun</h3>
      <div className="space-y-1.5">
        {[
          { text: 'Hisobot tayyorla', done: true },
          { text: 'Email javob ber', done: true },
          { text: "Kitob o'qi", done: false },
        ].map(({ text, done }) => (
          <div key={text} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'border-2 border-gray-300'}`}>
              {done && <Check size={8} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`text-xs ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileHabitsContent() {
  const habits = [
    { label: 'Ertalabki mashq', streak: 12, pct: 85, cls: 'bg-brand-500' },
    { label: "Kitob o'qi", streak: 7, pct: 65, cls: 'bg-purple-500' },
    { label: 'Meditation', streak: 5, pct: 50, cls: 'bg-emerald-500' },
    { label: 'Suv iching', streak: 21, pct: 95, cls: 'bg-blue-500' },
  ];
  return (
    <div className="px-4 py-2 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-gray-900">Odatlar</h2>
        <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold leading-none">+</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-3 mb-3">
        <p className="text-xs text-gray-400 mb-2">Bu hafta</p>
        <div className="flex justify-between">
          {['D','S','C','P','J','Sh','Y'].map((d, i) => (
            <div key={d} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 5 ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{d}</div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {habits.map(({ label, streak, pct, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-gray-800">{label}</span>
              <span className="text-xs text-orange-500 font-bold">🔥{streak}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${cls} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileTasksContent() {
  const tasks = [
    { text: 'Loyiha taqdimotini tayyorla', done: true, tag: 'ish', tc: 'bg-blue-100 text-blue-600' },
    { text: 'Email javob ber', done: true, tag: 'ish', tc: 'bg-blue-100 text-blue-600' },
    { text: "Kitob o'qi: 30 bet", done: false, tag: "ta'lim", tc: 'bg-purple-100 text-purple-600' },
    { text: 'Hisobot yoz', done: false, tag: 'ish', tc: 'bg-blue-100 text-blue-600' },
    { text: "Do'stlarga qo'ng'iroq", done: false, tag: 'shaxsiy', tc: 'bg-emerald-100 text-emerald-600' },
  ];
  return (
    <div className="px-4 py-2 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold text-gray-900">Vazifalar</h2>
        <span className="text-xs text-gray-400">2/5 bajarildi</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-brand-500 rounded-full" style={{ width: '40%' }} />
      </div>
      <div className="space-y-2">
        {tasks.map(({ text, done, tag, tc }) => (
          <div key={text} className={`flex items-start gap-2.5 bg-white rounded-xl border border-gray-100 p-2.5 shadow-sm ${done ? 'opacity-55' : ''}`}>
            <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-brand-500' : 'border-2 border-gray-300'}`}>
              {done && <Check size={7} className="text-white" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium leading-tight ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{text}</p>
              <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${tc}`}>{tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Desktop browser + sidebar frame
function DesktopAppScreen({ page }: { page: 'dashboard' | 'habits' | 'finance' }) {
  const nav = [
    { icon: CheckSquare, label: 'Bugun', key: 'dashboard' },
    { icon: Flame, label: 'Odatlar', key: 'habits' },
    { icon: Target, label: 'Maqsadlar', key: 'goals' },
    { icon: BarChart3, label: 'Statistika', key: 'stats' },
    { icon: Wallet, label: 'Moliya', key: 'finance' },
  ];
  return (
    <div className="w-full rounded-2xl shadow-2xl shadow-brand-500/10 border border-gray-200 overflow-hidden bg-white">
      {/* Browser bar */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="h-6 bg-gray-100 rounded-full max-w-xs mx-auto flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-400">app.intizom.uz</span>
          </div>
        </div>
        <div className="w-16" />
      </div>
      {/* App */}
      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="w-44 bg-gray-50 border-r border-gray-100 flex flex-col p-3 gap-0.5 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-gray-800">Intizom</span>
          </div>
          {nav.map(({ icon: Icon, label, key }) => (
            <div key={key} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${key === page ? 'bg-brand-500 text-white' : 'text-gray-500'}`}>
              <Icon size={13} />
              {label}
            </div>
          ))}
          <div className="mt-auto flex items-center gap-2 px-2 py-2 border-t border-gray-200">
            <div className="w-6 h-6 bg-brand-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">Sardor T.</p>
              <p className="text-xs text-brand-500">Pro</p>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 p-5 overflow-hidden bg-white">
          {page === 'dashboard' && <DashboardContent />}
          {page === 'habits' && <HabitsContent />}
          {page === 'finance' && <FinanceContent />}
        </div>
      </div>
    </div>
  );
}

// Mobile phone frame
function MobileAppScreen({ page }: { page: 'dashboard' | 'habits' | 'tasks' }) {
  const bottomNav = [
    { icon: CheckSquare, label: 'Bugun', key: 'dashboard' },
    { icon: Flame, label: 'Odatlar', key: 'habits' },
    { icon: Target, label: 'Maqsad', key: 'goals' },
    { icon: Wallet, label: 'Moliya', key: 'finance' },
  ];
  const activeKey = page === 'habits' ? 'habits' : 'dashboard';
  return (
    <div className="relative mx-auto w-[272px]">
      {/* Phone shell */}
      <div className="bg-gray-900 rounded-[44px] p-[10px] shadow-2xl shadow-gray-900/40">
        {/* Screen */}
        <div className="bg-white rounded-[36px] overflow-hidden flex flex-col" style={{ height: 564 }}>
          {/* Status bar */}
          <div className="flex-shrink-0 flex justify-between items-center px-5 pt-2.5 pb-0">
            <span className="text-xs font-bold text-gray-900">12:00</span>
            <div className="flex gap-1.5 items-center">
              <div className="flex gap-0.5 items-end h-3.5">
                {[3,4,5,6].map(h => <div key={h} className="w-1 bg-gray-800 rounded-sm" style={{ height: h }} />)}
              </div>
              <div className="w-5 h-2.5 border-2 border-gray-800 rounded-sm relative ml-0.5">
                <div className="absolute inset-0.5 bg-gray-800 rounded-sm" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
          {/* Dynamic island */}
          <div className="flex-shrink-0 flex justify-center py-1.5">
            <div className="w-24 h-6 bg-gray-900 rounded-full" />
          </div>
          {/* Page content */}
          <div className="flex-1 overflow-hidden">
            {page === 'dashboard' && <MobileDashboardContent />}
            {page === 'habits' && <MobileHabitsContent />}
            {page === 'tasks' && <MobileTasksContent />}
          </div>
          {/* Bottom nav */}
          <div className="flex-shrink-0 border-t border-gray-100 px-5 pt-2 pb-1 flex justify-between bg-white">
            {bottomNav.map(({ icon: Icon, label, key }) => (
              <div key={key} className={`flex flex-col items-center gap-0.5 ${key === activeKey ? 'text-brand-500' : 'text-gray-300'}`}>
                <Icon size={17} />
                <span className="text-[9px] font-medium">{label}</span>
              </div>
            ))}
          </div>
          {/* Home indicator */}
          <div className="flex-shrink-0 flex justify-center pb-2 pt-0.5">
            <div className="w-24 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
      {/* Side buttons */}
      <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-gray-700 rounded-r-lg" />
      <div className="absolute -left-[3px] top-24 w-[3px] h-9 bg-gray-700 rounded-l-lg" />
      <div className="absolute -left-[3px] top-36 w-[3px] h-9 bg-gray-700 rounded-l-lg" />
      <div className="absolute -left-[3px] top-48 w-[3px] h-9 bg-gray-700 rounded-l-lg" />
    </div>
  );
}

function AppPreview() {
  const [tab, setTab] = useState<'desktop' | 'mobile'>('desktop');
  const [slide, setSlide] = useState(0);
  const { ref, inView } = useInView();

  const DESKTOP_SLIDES = [
    { label: 'Bugun', page: 'dashboard' as const },
    { label: 'Odatlar', page: 'habits' as const },
    { label: 'Moliya', page: 'finance' as const },
  ];
  const MOBILE_SLIDES = [
    { label: 'Bugun', page: 'dashboard' as const },
    { label: 'Odatlar', page: 'habits' as const },
    { label: 'Vazifalar', page: 'tasks' as const },
  ];
  const slides = tab === 'desktop' ? DESKTOP_SLIDES : MOBILE_SLIDES;

  const handleTab = (t: 'desktop' | 'mobile') => { setTab(t); setSlide(0); };

  return (
    <section id="preview" className="py-24 overflow-hidden" style={{ background: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div ref={ref} className={`text-center mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-400 text-xs font-semibold mb-4"
            style={{ background: 'rgba(10,144,144,0.1)', border: '1px solid rgba(10,144,144,0.2)' }}>
            <Monitor size={12} />
            Haqiqiy interfeys
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Intizom ichida{' '}
            <span className="gradient-text">qanday ko'rinadi?</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8 text-base">
            Desktop va mobil versiyalar — har qanday qurilmadan qulay ishlaydi.
          </p>
          {/* Tab toggle */}
          <div className="inline-flex items-center rounded-2xl p-1.5 gap-1" style={{ background: '#111827', border: '1px solid #1f2937' }}>
            <button
              onClick={() => handleTab('desktop')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                tab === 'desktop' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Monitor size={15} />
              Desktop
            </button>
            <button
              onClick={() => handleTab('mobile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                tab === 'mobile' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone size={15} />
              Mobil
            </button>
          </div>
        </div>

        {/* Slide tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSlide(i)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                i === slide
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-gray-400 hover:text-brand-400'
              }`}
              style={i !== slide ? { background: '#111827', border: '1px solid #1f2937' } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Mockup */}
        <div className="flex justify-center">
          {tab === 'desktop' ? (
            <div key={`d-${slide}`} className="w-full max-w-4xl animate-fade-up">
              <DesktopAppScreen page={slides[slide].page as 'dashboard' | 'habits' | 'finance'} />
            </div>
          ) : (
            <div key={`m-${slide}`} className="animate-fade-up">
              <MobileAppScreen page={slides[slide].page as 'dashboard' | 'habits' | 'tasks'} />
            </div>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 hover:bg-gray-500'
              }`}
              style={i !== slide ? { background: '#374151' } : {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Ro\'yxatdan o\'ting',
    desc: 'Google bilan bir bosishda yoki email orqali 30 soniyada hisob oching. Hech qanday murakkablik yo\'q.',
    color: 'text-brand-400',
    bg: 'border-brand-500/25',
    dark: '#0a9090',
    bgSolid: '#0d2828',
  },
  {
    num: '02',
    title: 'Hayotingizni tizimlashtiring',
    desc: 'Odatlar, vazifalar, maqsadlar va byudjetingizni kiriting. Tizim sizga reja tuzishda yordam beradi.',
    color: 'text-purple-400',
    bg: 'border-purple-500/25',
    dark: '#7c3aed',
    bgSolid: '#1a0a3a',
  },
  {
    num: '03',
    title: 'To\'liq nazoratga erishing',
    desc: 'Har kuni statistikangizni ko\'ring, o\'sishingizni his qiling va hayotingizni o\'z qo\'lingiz bilan boshqaring.',
    color: 'text-emerald-400',
    bg: 'border-emerald-500/25',
    dark: '#059669',
    bgSolid: '#0a2820',
  },
];

function HowItWorks() {
  const { ref, inView } = useInView();
  return (
    <section id="how" className="py-24" style={{ background: '#080c10' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Qanday ishlaydi?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">Boshlash uchun uchta oddiy qadam yetarli.</p>
        </div>

        {/* ── Mobile: badge + card rows, single vertical comet ── */}
        <div className="md:hidden flex flex-col gap-5 relative">
          <div className="absolute left-7 top-7 bottom-7 w-0.5 rounded-full bg-gradient-to-b from-brand-400 via-purple-400 to-emerald-400 how-line overflow-visible">
            <div className="how-comet-v">
              <div className="how-comet-tail-v" />
              <div className="how-comet-orb" />
              <div className="how-comet-tip-v" />
            </div>
          </div>
          {STEPS.map(({ num, title, desc, color, dark, bgSolid }: typeof STEPS[0], i) => {
            const { ref: r, inView: v } = useInView(0.1);
            return (
              <div
                key={num}
                ref={r}
                className={`relative flex items-start gap-4 transition-all duration-700 ${v ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div
                  className="relative z-20 flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                  style={{ background: bgSolid, borderColor: dark }}
                >
                  <span className={`text-xl font-black ${color}`}>{num}</span>
                </div>
                <div
                  className="flex-1 rounded-2xl p-4 border"
                  style={{ background: 'linear-gradient(135deg, #0d1117 0%, #111827 100%)', borderColor: '#1f2937' }}
                >
                  <div className="w-6 h-0.5 rounded-full mb-2" style={{ background: dark }} />
                  <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop: 3-column grid, centered badges above cards, horizontal comet ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 relative">
          <div className="absolute top-[27px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] z-0 overflow-visible">
            <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 how-line" />
            <div className="how-comet">
              <div className="how-comet-tail" />
              <div className="how-comet-orb" />
              <div className="how-comet-tip" />
            </div>
          </div>
          {STEPS.map(({ num, title, desc, color, dark, bgSolid }: typeof STEPS[0], i) => {
            const { ref: r, inView: v } = useInView(0.1);
            return (
              <div
                key={num}
                ref={r}
                className={`relative flex flex-col transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex justify-center mb-5">
                  <div
                    className="relative z-20 w-14 h-14 rounded-2xl border-2 flex items-center justify-center shadow-lg"
                    style={{ background: bgSolid, borderColor: dark }}
                  >
                    <span className={`text-xl font-black ${color}`}>{num}</span>
                  </div>
                </div>
                <div
                  className="flex-1 rounded-2xl p-5 border text-center"
                  style={{ background: 'linear-gradient(135deg, #0d1117 0%, #111827 100%)', borderColor: '#1f2937' }}
                >
                  <div className="w-8 h-1 rounded-full mb-3 mx-auto" style={{ background: dark }} />
                  <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Bepul',
    price: '0',
    period: 'doimo',
    desc: 'Boshlash uchun ideal',
    features: ['5 ta aktiv odat', '20 ta vazifa', '2 ta maqsad', 'Asosiy statistika', 'Moliya kuzatuvi'],
    cta: 'Bepul boshlash',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '9 700',
    period: 'oyiga',
    desc: 'O\'z hayotini to\'liq nazorat qiluvchilar uchun',
    features: [
      'Cheksiz odatlar',
      'Cheksiz vazifalar',
      'Cheksiz maqsadlar',
      'Kengaytirilgan statistika',
      'Moliyaviy hisobotlar',
      'Prioritet qo\'llab-quvvatlash',
    ],
    cta: 'Pro\'ni sinab ko\'rish',
    highlight: true,
  },
];

function Pricing() {
  const { ref, inView } = useInView();
  return (
    <section id="pricing" className="py-24" style={{ background: '#0d1117' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Bir kunda sarflaganingizdan{' '}
            <span className="gradient-text">kamroq</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Oyiga atigi <strong className="text-gray-200">9 700 so'm</strong> — bir chashka qahva narxiga hayotingizni to'liq boshqaring.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map(({ name, price, period, desc, features, cta, highlight }, i) => {
            const { ref: r, inView: v } = useInView(0.1);
            return (
              <div
                key={name}
                ref={r}
                className={`relative rounded-2xl p-7 transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${
                  highlight
                    ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-2xl shadow-brand-500/30 scale-105'
                    : 'border'
                }`}
                style={{ transitionDelay: `${i * 150}ms`, ...(!highlight ? { background: '#111827', borderColor: '#1f2937' } : {}) }}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow">
                    Ko'p tanlanadi
                  </div>
                )}
                <p className={`text-sm font-semibold mb-1 ${highlight ? 'text-brand-100' : 'text-gray-400'}`}>{name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-black ${highlight ? 'text-white' : 'text-white'}`}>{price}</span>
                  {price !== '0' && <span className={`text-sm ${highlight ? 'text-brand-200' : 'text-gray-500'}`}>so'm</span>}
                </div>
                <p className={`text-xs mb-1 ${highlight ? 'text-brand-200' : 'text-gray-500'}`}>{period}</p>
                <p className={`text-sm mb-6 ${highlight ? 'text-brand-100' : 'text-gray-400'}`}>{desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${highlight ? 'bg-white/20' : 'bg-brand-500/20'}`}>
                        <Check size={10} className={highlight ? 'text-white' : 'text-brand-400'} strokeWidth={3} />
                      </div>
                      <span className={highlight ? 'text-brand-50' : 'text-gray-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                    highlight
                      ? 'bg-white text-brand-600 hover:bg-brand-50 shadow-md'
                      : 'bg-brand-500 text-white hover:bg-brand-400 shadow-md shadow-brand-500/20'
                  }`}
                >
                  {cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Sardor T.',
    role: 'Dasturchi',
    text: 'Intizom mening hayotimni ikkiga bo\'ldi — Intizomdan oldin va keyin. Endi har kuni o\'zim rejalashtirgan hayot yashayman, tasodifiy emas.',
    avatar: 'S',
    color: 'bg-brand-400',
  },
  {
    name: 'Malika R.',
    role: 'Talaba',
    text: 'Moliya bo\'limi ko\'zlarimni ochdi. Oylik 300 000 so\'m keraksiz xarajatni topdim. Endi pul qayerga ketishini o\'zim hal qilaman.',
    avatar: 'M',
    color: 'bg-purple-400',
  },
  {
    name: 'Jasur K.',
    role: 'Tadbirkor',
    text: 'Ilgari rejalar boshimda — hech narsa bajarilib bo\'lmasdi. Intizom bilan birinchi marta yillik maqsadimga muddatida yetdim.',
    avatar: 'J',
    color: 'bg-emerald-400',
  },
];

function Testimonials() {
  const { ref, inView } = useInView();
  return (
    <section className="py-24" style={{ background: '#080c10' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-center mb-3">
            {[1,2,3,4,5].map((i) => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Hayotini o'zgartirganlar
          </h2>
          <p className="text-gray-400">Haqiqiy odamlar — haqiqiy nazorat, haqiqiy natijalar.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, text, avatar, color }, i) => {
            const { ref: r, inView: v } = useInView(0.1);
            return (
              <div
                key={name}
                ref={r}
                className={`rounded-2xl p-6 border transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms`, background: '#111827', borderColor: '#1f2937' }}
              >
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Trust badges ──────────────────────────────────────────────────────────────

function TrustBadges() {
  const { ref, inView } = useInView();
  const items = [
    { icon: Shield, label: 'Ma\'lumotlar xavfsiz', sub: 'JWT + bcrypt' },
    { icon: TrendingUp, label: 'Tezkor ishlaydi', sub: 'Optimistic UI' },
    { icon: Users, label: 'Jamoaviy ishlash', sub: 'Tez orada' },
    { icon: Smartphone, label: 'Mobil qulay', sub: 'iOS & Android' },
  ];
  return (
    <section className="py-16 border-y border-gray-100">
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center text-center gap-2 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-brand-500" />
              </div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  const { ref, inView } = useInView();
  return (
    <section className="py-24" style={{ background: '#0d1117' }}>
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-4 sm:px-6 text-center transition-all duration-700 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 rounded-3xl p-12 overflow-hidden shadow-2xl shadow-brand-500/30">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -left-8 w-52 h-52 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <p className="text-brand-200 text-sm font-semibold mb-3 tracking-wide uppercase">Hozir qaror qiling</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Hayotingizni o'z qo'lingizga{' '}
              <span className="text-brand-200">oling</span>
            </h2>
            <p className="text-brand-100 text-base mb-8 max-w-md mx-auto leading-relaxed">
              14 kunlik bepul sinov — hech qanday karta ma'lumoti shart emas.
              Keyin oyiga atigi <strong className="text-white">9 700 so'm</strong>.
              Istalgan vaqt bekor qiling.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
              >
                Nazoratni qo'lga oling
                <ArrowRight size={16} />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all text-sm border border-white/20"
              >
                Narxlarni ko'rish
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t py-8" style={{ background: '#080c10', borderColor: '#1f2937' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">Intizom</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <a href="#features" className="hover:text-brand-400 transition-colors">Imkoniyatlar</a>
            <a href="#how" className="hover:text-brand-400 transition-colors">Qanday ishlaydi</a>
            <a href="#pricing" className="hover:text-brand-400 transition-colors">Narxlar</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Maxfiylik</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Shartlar</a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-600">© 2026 Intizom 🇺🇿</p>
        </div>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      {/* <AppPreview /> */}
      <HowItWorks />
      {/* <TrustBadges /> */}
      <Pricing />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
