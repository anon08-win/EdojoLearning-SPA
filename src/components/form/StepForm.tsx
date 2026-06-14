// src/components/form/StepForm.tsx
'use client';

import { useState } from 'react';
import type { FormStep } from '@/types/spa';
import { clsx } from 'clsx';

interface Props {
  step: FormStep;
  stepIndex: number;
  formData: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function StepForm({ step, formData, updateField, onNext, onBack, isFirst }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getValue = (id: string) => {
    if (id === 'studentName' || id === 'class' || id === 'schoolName' ||
        id === 'parentName' || id === 'parentContact' || id === 'studentEmail') {
      return (formData as Record<string, unknown>)[id] ?? '';
    }
    return ((formData as Record<string, unknown>).answers as Record<string, unknown>)?.[id] ?? '';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const q of step.questions) {
      if (q.required) {
        const val = getValue(q.id);
        console.log(
         'QUESTION:',
         q.id,
         'TYPE:',
         q.type,
         'VALUE:',
         val
       );
    
       if (
         val === undefined ||
         val === null ||
         (Array.isArray(val) && val.length === 0) ||
         val === ''
      ) {
        newErrors[q.id] = 'Please answer this question to continue.';
      }
     }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const isValid = validate();
  
    console.log('VALID?', isValid);
    console.log('STEP:', step.title);
    console.log('QUESTIONS:', step.questions);
  
    if (isValid) {
      console.log('MOVING TO NEXT STEP');
      onNext();
    } else {
      console.log('VALIDATION FAILED');
    }
  };

  return (
    <div className="step-enter">
      {/* Step header */}
      <div className="mb-8">
        <h2 className="font-display font-extrabold text-2xl text-[#1B2A4A] mb-1">
          {step.title}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {step.questions.map(q => (
          <div key={q.id}>
            <label className="block font-semibold text-slate-800 mb-3 text-[15px] leading-snug">
              {q.text}
              {q.required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {/* Text input */}
            {q.type === 'text' && (
              <input
                type="text"
                className="input-field"
                placeholder="Type your answer here..."
                value={(getValue(q.id) as string) || ''}
                onChange={e => updateField(q.id, e.target.value)}
              />
            )}

            {/* Single select */}
            {q.type === 'single' && q.options && (
              <div className="grid gap-2">
                {q.options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField(q.id, opt.value)}
                    className={clsx(
                      'option-card text-left flex items-center gap-3',
                      getValue(q.id) === opt.value && 'selected'
                    )}
                  >
                    <div className={clsx(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                      getValue(q.id) === opt.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                    )}>
                      {getValue(q.id) === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Multi select */}
            {q.type === 'multi' && q.options && (
              <div className="grid gap-2">
                {q.options.map(opt => {
                  const current = (getValue(q.id) as string[]) || [];
                  const isSelected = current.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? current.filter(v => v !== opt.value)
                          : [...current, opt.value];
                        updateField(q.id, updated);
                      }}
                      className={clsx('option-card text-left flex items-center gap-3', isSelected && 'selected')}
                    >
                      <div className={clsx(
                        'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all',
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      )}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Boolean */}
            {q.type === 'boolean' && (
              <div className="grid grid-cols-2 gap-3">
                {['Yes', 'No'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateField(q.id, val === 'Yes')}
                    className={clsx(
                      'option-card text-center py-4 font-semibold',
                      getValue(q.id) === (val === 'Yes') && 'selected'
                    )}
                  >
                    <span className="text-2xl block mb-1">{val === 'Yes' ? '✅' : '❌'}</span>
                    {val}
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {errors[q.id] && (
              <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors[q.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-10">
        {!isFirst && (
          <button type="button" onClick={onBack} className="btn-secondary flex-1">
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary flex-1"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
