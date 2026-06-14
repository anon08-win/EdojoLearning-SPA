// src/components/ui/ScoreBars.tsx
'use client';

import type { SectionScores } from '@/types/spa';

interface Props {
  scores: SectionScores;
}

const LABELS: Record<keyof SectionScores, string> = {
  conceptClarity: 'Concept Clarity',
  retention: 'Retention',
  focus: 'Focus',
  consistency: 'Consistency',
  examReadiness: 'Exam Readiness',
  selfTesting: 'Self Testing',
};

function barColor(score: number): string {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#16A34A';
  if (score >= 55) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export default function ScoreBars({ scores }: Props) {
  return (
    <div className="space-y-3">
      {(Object.keys(scores) as Array<keyof SectionScores>).map(k => {
        const score = scores[k];
        const color = barColor(score);
        return (
          <div key={k}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-700">{LABELS[k]}</span>
              <span className="text-sm font-bold" style={{ color }}>{score.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${score}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
