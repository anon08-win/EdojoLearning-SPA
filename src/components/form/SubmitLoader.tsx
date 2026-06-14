// src/components/form/SubmitLoader.tsx
'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { icon: '📊', text: 'Calculating your scores…' },
  { icon: '🧠', text: 'Analysing your learning profile…' },
  { icon: '🔍', text: 'Identifying growth barriers…' },
  { icon: '📋', text: 'Building your roadmap…' },
  { icon: '🖨️', text: 'Generating PDF report…' },
  { icon: '📧', text: 'Finalizing your assessment report…' },
];

export default function SubmitLoader() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3a6e] to-[#1B2A4A] flex items-center justify-center px-6">
      <div className="max-w-sm mx-auto text-center">
        {/* Logo */}
        <div className="font-display font-extrabold text-2xl text-white mb-10">
          edo<span className="text-yellow-400">j</span>o
          <span className="block text-xs font-normal text-blue-300 tracking-widest">Learning</span>
        </div>

        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#ffffff15" strokeWidth="6"/>
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke="#F59E0B" strokeWidth="6"
              strokeDasharray="226" strokeDashoffset="170"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            {STEPS[activeStep].icon}
          </div>
        </div>

        <h2 className="font-display font-bold text-xl text-white mb-2">
          Creating Your Report
        </h2>
        <p className="text-blue-300 text-sm mb-8">
          {STEPS[activeStep].text}
        </p>

        {/* Progress steps */}
        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                i < activeStep
                  ? 'bg-green-500/20 border border-green-500/30'
                  : i === activeStep
                  ? 'bg-white/10 border border-white/20'
                  : 'opacity-30'
              }`}
            >
              <span className="text-sm">{s.icon}</span>
              <span className={`text-sm flex-1 text-left ${i <= activeStep ? 'text-white' : 'text-white/40'}`}>
                {s.text}
              </span>
              {i < activeStep && (
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {i === activeStep && (
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
