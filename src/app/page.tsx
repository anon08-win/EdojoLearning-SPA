// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3a6e] to-[#1B2A4A] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="font-display font-extrabold text-2xl text-white tracking-tight">
          edo<span className="text-yellow-400">j</span>o
          <span className="block text-xs font-normal text-blue-300 tracking-widest -mt-1">Learning</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-blue-200 text-sm font-medium">Free Assessment · Takes 5 minutes</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight mb-4">
            Student Profile
            <span className="block text-yellow-400">Analysis™</span>
          </h1>

          <p className="text-blue-200 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
            Discover your academic strengths and growth opportunities with our comprehensive 5-section diagnostic assessment.
          </p>

          {/* Score pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              'Concept Clarity', 'Knowledge Retention', 'Focus',
              'Consistency', 'Exam Readiness', 'Self-Testing'
            ].map(s => (
              <span key={s} className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs">
                {s}
              </span>
            ))}
          </div>

          <Link href="/assessment" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#1B2A4A] font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 active:scale-95 shadow-lg shadow-yellow-400/20">
            Start Assessment
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="text-blue-300 text-sm mt-4">25 questions · Instant AI-powered report · PDF emailed to you</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-12 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📊', title: 'Academic Health Score', desc: 'Weighted score across 6 dimensions of academic performance' },
            { icon: '🎯', title: 'Root Cause Analysis', desc: 'Identify the exact barriers limiting your academic growth' },
            { icon: '📋', title: '5-Page PDF Report', desc: 'Professional report with personalized improvement roadmap' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-bold text-white mb-1">{f.title}</h3>
              <p className="text-blue-300 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
