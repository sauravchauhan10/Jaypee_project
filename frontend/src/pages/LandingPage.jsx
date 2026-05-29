// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AIAssistantWidget from '../components/common/AIAssistantWidget';

// ─── Animated counter hook ─────────────────────────────────────────────────────
const useCounter = (target, duration = 2000, startOn = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startOn) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startOn]);
  return count;
};

// ─── Intersection observer hook ────────────────────────────────────────────────
const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ─── FAQ item ──────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'shadow-md' : ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        <span className={`w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

// ─── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, icon, started }) => {
  const num = useCounter(value, 2200, started);
  return (
    <div className="text-center">
      <div className="text-4xl lg:text-5xl font-black text-white mb-2">
        {num.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 text-sm font-medium">{label}</div>
    </div>
  );
};

// ─── Testimonial card ──────────────────────────────────────────────────────────
const TestimonialCard = ({ name, role, text, avatar, rating = 5 }) => (
  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <p className="text-gray-600 text-sm leading-relaxed italic">"{text}"</p>
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-white">{avatar}</span>
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-400">{role}</p>
      </div>
    </div>
  </div>
);

// ─── Main LandingPage ──────────────────────────────────────────────────────────
const LandingPage = () => {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [statsRef, statsInView]       = useInView(0.3);
  const [faqOpen, setFaqOpen]         = useState(null);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const NAV_LINKS = ['Features', 'How it Works', 'Statistics', 'Testimonials', 'FAQ'];

  return (
    <div className="min-h-screen font-sans bg-white">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NAVBAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        navScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-sm">Rx</span>
              </div>
              <div>
                <span className={`font-black text-lg leading-tight block ${navScrolled ? 'text-gray-900' : 'text-white'}`}>CareBridge</span>
                <span className={`text-[10px] leading-none ${navScrolled ? 'text-blue-600' : 'text-blue-200'}`}>Digital Health Platform</span>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                  className={`text-sm font-medium transition-colors hover:text-blue-500 ${navScrolled ? 'text-gray-600' : 'text-white/80'}`}
                >
                  {link}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition ${
                  navScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Get Started →
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`md:hidden p-2 rounded-lg ${navScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <button key={link} onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                {link}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">Sign In</Link>
              <Link to="/register" className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 flex items-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Floating orbs */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating medical icons */}
        {[
          { icon: '💊', top: '15%', left: '8%',  size: 'text-4xl', delay: '0s' },
          { icon: '🩺', top: '70%', left: '5%',  size: 'text-3xl', delay: '0.5s' },
          { icon: '🏥', top: '20%', right: '8%', size: 'text-3xl', delay: '1s' },
          { icon: '❤️', top: '75%', right: '6%', size: 'text-2xl', delay: '1.5s' },
          { icon: '🔬', top: '45%', left: '3%',  size: 'text-2xl', delay: '0.3s' },
          { icon: '📋', top: '50%', right: '4%', size: 'text-3xl', delay: '0.8s' },
        ].map((el, i) => (
          <div key={i} className={`absolute ${el.size} opacity-20 animate-bounce select-none pointer-events-none`}
            style={{ top: el.top, left: el.left, right: el.right, animationDelay: el.delay, animationDuration: '3s' }}>
            {el.icon}
          </div>
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Trusted by 10,000+ Healthcare Professionals
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Smart Digital{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Prescriptions
              </span>{' '}
              for Modern Healthcare
            </h1>

            <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-lg">
              Issue, manage, and verify prescriptions digitally. QR code verification, PDF generation,
              medicine reminders, and AI-powered health assistance — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold px-7 py-3.5 rounded-2xl hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-200 text-sm">
                Start Free Today
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition-all duration-200 text-sm">
                Sign In
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-6 flex-wrap">
              {['✅ HIPAA Aligned', '🔒 End-to-End Encrypted', '⚡ Real-time Sync'].map((t) => (
                <span key={t} className="text-blue-300 text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup card */}
          <div className="relative hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
              {/* Header bar */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 bg-white/10 rounded-lg h-6 ml-2" />
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Prescriptions', v: '2,847', c: 'from-blue-500 to-blue-700' },
                  { label: 'Patients',      v: '1,203', c: 'from-emerald-500 to-teal-700' },
                  { label: 'Today',         v: '24',    c: 'from-violet-500 to-purple-700' },
                ].map((k) => (
                  <div key={k.label} className={`bg-gradient-to-br ${k.c} rounded-2xl p-3 text-white`}>
                    <p className="text-base font-black">{k.v}</p>
                    <p className="text-[10px] opacity-80">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Chart mockup */}
              <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-300 opacity-80"
                      style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="text-white/50 text-[10px] mt-2">Monthly Prescriptions</p>
              </div>

              {/* Recent prescriptions */}
              <div className="space-y-2">
                {[
                  { name: 'Rahul S.', rx: 'RX-A4F8B1', status: 'Active' },
                  { name: 'Priya M.', rx: 'RX-C2E9D3', status: 'Completed' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center text-xs text-white font-bold">
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-semibold">{r.name}</p>
                      <p className="text-white/50 text-[10px]">{r.rx}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating QR badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-2xl p-3 flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">QR Verified</p>
                <p className="text-[10px] text-gray-500">Scan to verify prescription</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/50 text-xs">Scroll</span>
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Everything you need for modern healthcare
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From digital prescriptions to AI assistance — CareBridge brings the entire prescription workflow into one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Digital Prescriptions', desc: 'Issue, manage, and update prescriptions digitally. Full CRUD with role-based access for doctors and patients.', color: 'blue' },
              { icon: '📄', title: 'PDF Generation', desc: 'Generate professional prescription PDFs with hospital branding, QR codes, and doctor digital signature.', color: 'violet' },
              { icon: '📱', title: 'QR Verification', desc: 'Every prescription has a unique QR code. Scan to instantly verify authenticity from any device.', color: 'emerald' },
              { icon: '⏰', title: 'Medicine Reminders', desc: 'Patients set daily email reminders. Never miss a dose with automated scheduling via nodemailer.', color: 'rose' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time charts: monthly trends, top diagnoses, medicine frequency, and activity tracking.', color: 'amber' },
              { icon: '🤖', title: 'AI Health Assistant', desc: 'Ask the AI to explain medicines, suggest precautions, and summarize prescriptions. No diagnosis provided.', color: 'teal' },
              { icon: '🕐', title: 'Medical Timeline', desc: 'Patients get a beautiful visual timeline of their entire prescription and visit history.', color: 'indigo' },
              { icon: '🔐', title: 'Role-Based Access', desc: 'Secure JWT authentication with separate doctor and patient dashboards and permissions.', color: 'purple' },
              { icon: '☁️', title: 'Cloud Storage', desc: 'MongoDB Atlas ensures your health data is securely stored and always accessible.', color: 'sky' },
            ].map((f) => {
              const colorMap = {
                blue: 'bg-blue-50 text-blue-600 border-blue-100', violet: 'bg-violet-50 text-violet-600 border-violet-100',
                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', rose: 'bg-rose-50 text-rose-600 border-rose-100',
                amber: 'bg-amber-50 text-amber-600 border-amber-100', teal: 'bg-teal-50 text-teal-600 border-teal-100',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100', purple: 'bg-purple-50 text-purple-600 border-purple-100',
                sky: 'bg-sky-50 text-sky-600 border-sky-100',
              };
              return (
                <div key={f.title}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl mb-4 ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOW IT WORKS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">How it Works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">From consultation to cure in 4 steps</h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-200 via-emerald-200 to-violet-200 -translate-x-1/2" />

            <div className="space-y-12">
              {[
                { step: '01', title: 'Doctor Logs In', desc: 'Doctor authenticates securely and accesses their dashboard showing patients, prescriptions, and analytics.', icon: '👨‍⚕️', color: 'blue', side: 'left' },
                { step: '02', title: 'Prescription Issued', desc: 'Search patient, add diagnosis and medicines dynamically, attach notes — issue a prescription with one click.', icon: '📋', color: 'emerald', side: 'right' },
                { step: '03', title: 'PDF + QR Generated', desc: 'Instantly download a professional PDF with embedded QR code for instant verification from any smartphone.', icon: '📱', color: 'violet', side: 'left' },
                { step: '04', title: 'Patient Manages Health', desc: 'Patient views their timeline, sets reminders, downloads prescriptions, and uses the AI assistant for guidance.', icon: '🏥', color: 'rose', side: 'right' },
              ].map((s, i) => {
                const colors = {
                  blue: 'from-blue-500 to-blue-700', emerald: 'from-emerald-500 to-teal-600',
                  violet: 'from-violet-500 to-purple-700', rose: 'from-rose-500 to-red-600',
                };
                return (
                  <div key={s.step} className={`relative flex flex-col lg:flex-row items-center gap-8 ${s.side === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Card */}
                    <div className="lg:w-5/12 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-black text-white bg-gradient-to-br ${colors[s.color]} px-2.5 py-1 rounded-lg`}>
                          Step {s.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                    </div>

                    {/* Center icon */}
                    <div className="lg:w-2/12 flex justify-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors[s.color]} flex items-center justify-center shadow-xl text-3xl z-10`}>
                        {s.icon}
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden lg:block lg:w-5/12" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATISTICS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="statistics" ref={statsRef}
        className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-violet-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Trusted by thousands</h2>
            <p className="text-blue-300">Real numbers from real healthcare professionals</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <StatCard value={10000} suffix="+"  label="Prescriptions Issued"  icon="📋" started={statsInView} />
            <StatCard value={2500}  suffix="+"  label="Doctors Registered"   icon="👨‍⚕️" started={statsInView} />
            <StatCard value={8000}  suffix="+"  label="Patients Served"      icon="🏥" started={statsInView} />
            <StatCard value={99}    suffix="%"  label="Uptime Reliability"   icon="⚡" started={statsInView} />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TESTIMONIALS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">What our users say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard avatar="R" name="Dr. Rahul Sharma" role="General Physician, Mumbai"
              text="CareBridge has completely transformed how I issue prescriptions. The PDF generation with QR codes saves me at least 30 minutes every day. My patients love being able to verify prescriptions on their phones."
              rating={5} />
            <TestimonialCard avatar="P" name="Priya Mehta" role="Patient, Bangalore"
              text="The medicine reminder emails are a lifesaver! I used to forget my evening dose. Now I get a beautiful email at exactly 8 PM. The AI assistant also helped me understand my diabetes medication."
              rating={5} />
            <TestimonialCard avatar="A" name="Dr. Anjali Verma" role="Cardiologist, Delhi"
              text="The analytics dashboard gives me insights I never had before. I can see which medicines I prescribe most, track patient outcomes, and the role-based system ensures patient privacy."
              rating={5} />
            <TestimonialCard avatar="S" name="Suresh Kumar" role="Patient, Chennai"
              text="Being able to share my medical timeline with any new doctor is incredible. No more carrying physical files. The QR code verification gives new doctors instant confidence in my prescriptions."
              rating={4} />
            <TestimonialCard avatar="N" name="Dr. Neha Gupta" role="Pediatrician, Pune"
              text="The prescription creation interface is so smooth. Searching patients, adding multiple medicines — it all flows naturally. The AI widget has also reduced patient calls asking about medication details."
              rating={5} />
            <TestimonialCard avatar="K" name="Kiran Patel" role="Patient, Ahmedabad"
              text="Downloading my prescription as a PDF and sharing it with my insurance company took seconds. CareBridge has made healthcare documentation completely stress-free."
              rating={5} />
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FAQ
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Is CareBridge free to use?', a: 'CareBridge offers a free tier for individuals. Healthcare institutions and larger practices can contact us for enterprise plans with advanced features like team management and custom branding.' },
              { q: 'How is patient data kept secure?', a: 'All data is encrypted at rest and in transit using TLS 1.3. We use MongoDB Atlas with enterprise-grade security. Patient data is never shared with third parties and is stored in compliance with healthcare data standards.' },
              { q: 'Can patients see their prescriptions without creating an account?', a: 'Yes! Any prescription can be verified by scanning the QR code — no login required. However, to access full history, reminders, and the AI assistant, patients need a free account.' },
              { q: 'Does the AI assistant provide medical diagnoses?', a: 'No. The CareBridge AI Assistant is explicitly designed to NOT provide diagnoses. It explains medicines, suggests general precautions, and summarizes prescriptions. All medical decisions must be made by your licensed doctor.' },
              { q: 'How do medicine reminders work?', a: 'Patients set reminder times and select specific days. At the exact minute, our node-cron scheduler automatically sends a beautifully formatted email with medicine details to the patient\'s registered email.' },
              { q: 'Can I use CareBridge for multiple clinics?', a: 'Currently, one doctor account works across all your consultations. Multi-clinic support with location tagging is on our roadmap. Contact us for enterprise requirements.' },
              { q: 'What happens if a prescription is altered?', a: 'Each prescription has a unique QR code linking to our verification endpoint. Scanning shows the original prescription details stored in our database — any alteration to a printed copy is immediately detectable.' },
            ].map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA BANNER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-violet-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to modernize your practice?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Join thousands of doctors and patients already using CareBridge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 shadow-xl transition-all text-base">
              Register as Doctor
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-base">
              Join as Patient
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">Rx</span>
              </div>
              <div>
                <span className="font-black text-white text-base">CareBridge</span>
                <p className="text-gray-500 text-xs">Smart Digital Prescription Platform</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} CareBridge. Built with ❤️ for better healthcare.
            </p>
            <div className="flex items-center gap-4">
              {['🔒 Secure', '⚡ Fast', '🏥 HIPAA Aligned'].map((t) => (
                <span key={t} className="text-gray-500 text-xs">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* AI Widget on landing page too */}
      <AIAssistantWidget />
    </div>
  );
};

export default LandingPage;
