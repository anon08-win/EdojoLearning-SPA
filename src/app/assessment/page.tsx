// src/app/assessment/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { FORM_STEPS, TOTAL_STEPS } from '@/lib/questions';
import type { FormAnswers, StudentInfo, SPAResult } from '@/types/spa';
import StepForm from '@/components/form/StepForm';
import ReviewStep from '@/components/form/ReviewStep';
import SubmitLoader from '@/components/form/SubmitLoader';

type FormData = StudentInfo & { answers: Partial<FormAnswers> };

const initialData: FormData = {
  studentName: '',
  class: '',
  schoolName: '',
  parentName: '',
  parentContact: '',
  studentEmail: '',
  assessmentDate: new Date().toISOString().split('T')[0],
  answers: {},
};

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SPAResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalFormSteps = TOTAL_STEPS;
  const progress = ((currentStep) / totalFormSteps) * 100;

  const updateField = useCallback((field: string, value: unknown) => {
    if (field.startsWith('q') || field === 'studentName' || field === 'class' ||
        field === 'schoolName' || field === 'parentName' || field === 'parentContact' ||
        field === 'studentEmail') {
      if (field.startsWith('q')) {
        setFormData(prev => ({
          ...prev,
          answers: { ...prev.answers, [field]: value },
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    }
  }, []);

  const handleNext = () => {
    setCurrentStep(s => Math.min(s + 1, totalFormSteps));
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const studentInfo: StudentInfo = {
        studentName: formData.studentName,
        class: formData.class,
        schoolName: formData.schoolName,
        parentName: formData.parentName,
        parentContact: formData.parentContact,
        studentEmail: formData.studentEmail,
        assessmentDate: formData.assessmentDate,
      };

      // 1. Submit answers & get scores
      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentInfo, answers: formData.answers }),
      });

      if (!submitRes.ok) throw new Error('Submission failed');
      const { result: spaResult } = await submitRes.json();
      setResult(spaResult);

      // 2. Generate PDF
      const pdfRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: spaResult }),
      });

      if (pdfRes.ok) {
        const pdfBlob = await pdfRes.blob();
        // Auto-download

      }

      setCurrentStep(totalFormSteps + 1); // Show result
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <SubmitLoader />;
  }

  if (currentStep === totalFormSteps + 1 && result) {
    return <ResultPage result={result} />;
  }

  // Review step (step = totalFormSteps)
  if (currentStep === totalFormSteps) {
    return (
      <ReviewStep
        formData={formData}
        onBack={handleBack}
        onSubmit={handleSubmit}
        error={error}
      />
    );
  }

  const step = FORM_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="font-display font-extrabold text-xl text-[#1B2A4A]">
            edo<span className="text-yellow-400">j</span>o
          </div>
          <span className="text-sm text-slate-500 font-medium">
            Step {currentStep + 1} of {totalFormSteps}
          </span>
        </div>
        {/* Progress */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <StepForm
          key={currentStep}
          step={step}
          stepIndex={currentStep}
          formData={formData}
          updateField={updateField}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentStep === 0}
          isLast={false}
        />
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────
// Result Page (shown after successful submission)
// ──────────────────────────────────────────────
function ResultPage({ result }: { result: SPAResult }) {
  const { academicHealthScore, scoreLevel, scores, studentInfo, primaryBarrier, strengthArea } = result;

  const scoreColor = academicHealthScore >= 85 ? '#22C55E'
    : academicHealthScore >= 70 ? '#16A34A'
    : academicHealthScore >= 55 ? '#EAB308'
    : academicHealthScore >= 40 ? '#F97316'
    : '#EF4444';

  const sectionLabels: Record<string, string> = {
      conceptClarity: 'Concept Understanding',
      retention: 'Knowledge Retention',
      focus: 'Study Focus',
      consistency: 'Study Consistency',
      examReadiness: 'Exam Preparation',
      selfTesting: 'Self-Assessment Skills',
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] via-[#1e3a6e] to-[#1B2A4A] px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-display font-extrabold text-2xl text-white">
            edo<span className="text-yellow-400">j</span>o
            <span className="block text-xs font-normal text-blue-300 tracking-widest">Learning</span>
          </div>
        </div>

        {/* Success */}
        <div className="bg-white rounded-3xl p-8 text-center mb-4 shadow-xl">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="font-display font-extrabold text-2xl text-[#1B2A4A] mb-1">
            Assessment Complete!
          </h1>
          <p className="text-slate-500 text-sm">
            Hi {studentInfo.studentName}, your SPA report is ready.
          </p>

          {/* AHS */}
          <div className="my-6 flex items-center justify-center">
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - academicHealthScore / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="score-circle"
                />
                <text x="60" y="56" textAnchor="middle" fontSize="26" fontWeight="900" fill="#1B2A4A" fontFamily="Arial">{academicHealthScore}</text>
                <text x="60" y="72" textAnchor="middle" fontSize="11" fill="#6B7280" fontFamily="Arial">/100</text>
              </svg>
            </div>
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm mb-4" style={{ background: scoreColor }}>
            {scoreLevel}
          </div>

          {/* Mini score grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {(Object.keys(scores) as Array<keyof typeof scores>).map(k => (
              <div key={k} className="bg-slate-50 rounded-xl p-2 text-center">
                <div className="text-lg font-extrabold font-display" style={{ color: scores[k] >= 70 ? '#22C55E' : scores[k] >= 50 ? '#F59E0B' : '#EF4444' }}>
                  {(scores[k] / 10).toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">{sectionLabels[k]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center mb-4">
        <div className="text-white/90 text-center space-y-2">
  <p>✅ Your assessment has been analyzed successfully.</p>

  <p>
    <strong>Academic Health Score:</strong> {academicHealthScore}/100
  </p>

  <p>
    <strong>Primary Growth Barrier:</strong> {sectionLabels[primaryBarrier] || primaryBarrier}
  </p>

  <p>
    <strong>Strongest Area:</strong> {sectionLabels[strengthArea] || strengthArea}
  </p>

  <p className="mt-4">
    Your detailed 5-page Student Profile Analysis is ready and will be reviewed
    with you during a free academic consultation.
  </p>
</div>
        </div>

        <a
          href="/"
          className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-[#1B2A4A] font-bold py-4 rounded-2xl transition-all duration-200"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
