import type { Metadata } from "next";
import Link from "next/link";
import { Pill, Shield, Zap, HeartPulse, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create your PrescribeFlow account",
};

const features = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "End-to-end encryption & JWT authentication",
  },
  {
    icon: Zap,
    title: "Instant Prescriptions",
    description: "Create digital Rx in under 60 seconds",
  },
  {
    icon: HeartPulse,
    title: "Drug Safety Checks",
    description: "Automatic interaction & allergy warnings",
  },
  {
    icon: Clock,
    title: "Adherence Tracking",
    description: "Real-time medication compliance monitoring",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Branding Panel ───────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 bg-gradient-to-br from-slate-950 via-violet-950/80 to-indigo-950">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] animate-float" />
          <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[100px] animate-float-slower" />
        </div>

        {/* Noise texture overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a'%3E%3CfeTurbulence baseFrequency='.75' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Prescribe<span className="text-violet-400">Flow</span>
            </span>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Digital Prescriptions,{" "}
              <span className="gradient-text">Reimagined.</span>
            </h1>
            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              The modern prescription management platform trusted by healthcare
              professionals worldwide.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-white/[0.12] transition-colors">
                  <feature.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">
                    {feature.title}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-xs text-white/30">
            © 2026 PrescribeFlow. Healthcare made digital.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <Shield className="w-3 h-3" />
            HIPAA Compliant
          </div>
        </div>
      </div>

      {/* ── Form Panel ───────────────────────────────────── */}
      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-background">
        {/* Mobile subtle gradient */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-violet-950/20 via-background to-background pointer-events-none" />

        <div className="relative w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Prescribe<span className="text-primary">Flow</span>
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
