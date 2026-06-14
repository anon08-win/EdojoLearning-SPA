// src/components/form/ReviewStep.tsx
'use client';

import { FORM_STEPS } from '@/lib/questions';
import type { FormAnswers, StudentInfo } from '@/types/spa';

type FormData = StudentInfo & { answers: Partial<FormAnswers> };

interface Props {
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
  error: string | null;
}

export default function ReviewStep({ formData, onBack, onSubmit, error }: Props) {
  const getValue = (id: string) => {
    if (['studentName', 'class', 'schoolName', 'parentName', 'parentContact', 'studentEmail'].includes(id)) {
      return (formData as Record<string, unknown>)[id] as string || '—';
    }
    const val = (formData.answers as Record<string, unknown>)[id];
    if (Array.isArray(val)) return val.join(', ') || '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return (val as string) || '—';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="font-display font-extrabold text-xl text-[#1B2A4A]">
            edo<span className="text-yellow-400">j</span>o
          </div>
          <span className="text-sm text-slate-500 font-medium">Review Your Answers</span>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="step-enter">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-green-700 text-xs font-medium">Almost done!</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#1B2A4A] mb-1">Review Your Answers</h2>
            <p className="text-slate-500 text-sm">Please check your responses before submitting. Your report will be generated instantly.</p>
          </div>

          {/* Student Info Summary */}
          <div className="bg-[#1B2A4A] rounded-2xl p-5 mb-4 text-white">
            <h3 className="font-display font-bold text-sm text-blue-300 uppercase tracking-widest mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Name', id: 'studentName' },
                { label: 'Class', id: 'class' },
                { label: 'School', id: 'schoolName' },
                { label: 'Parent', id: 'parentName' },
                { label: 'Contact', id: 'parentContact' },
                { label: 'Email', id: 'studentEmail' },
              ].map(f => (
                <div key={f.id}>
                  <div className="text-blue-300 text-xs">{f.label}</div>
                  <div className="text-white text-sm font-medium truncate">{getValue(f.id)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question answers by section */}
          {FORM_STEPS.slice(1).map(step => (
            <div key={step.id} className="bg-white border border-slate-100 rounded-2xl p-4 mb-3 shadow-sm">
              <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">{step.title}</h3>
              <div className="space-y-2">
                {step.questions
                  .filter(q => q.type !== 'text' || getValue(q.id) !== '—')
                  .map(q => (
                    <div key={q.id} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-slate-500 leading-relaxed flex-1">{q.text}</span>
                      <span className="text-xs font-semibold text-[#1B2A4A] text-right max-w-[160px] flex-shrink-0">
                        {getValue(q.id)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <h4 className="font-bold text-[#1B2A4A] text-sm mb-2">What happens after you submit?</h4>
            <div className="space-y-1.5">
              {[
                '✅ Scores are calculated across 6 academic dimensions',
                '📊 Academic Health Score is computed (weighted formula)',
                '📄 A 5-page professional PDF report is generated',
                '📧 Report is automatically emailed to you',
              ].map(item => (
                <p key={item} className="text-xs text-blue-800">{item}</p>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onBack} className="btn-secondary flex-1">
              ← Edit Answers
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="btn-primary flex-1 bg-[#1B2A4A] hover:bg-[#243a60]"
            >
              Generate Report 🚀
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
