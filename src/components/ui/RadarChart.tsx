// src/components/ui/RadarChart.tsx
'use client';

import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts';
import type { SectionScores } from '@/types/spa';

interface Props {
  scores: SectionScores;
}

const LABELS: Record<keyof SectionScores, string> = {
  conceptClarity: 'Concept\nClarity',
  retention: 'Retention',
  focus: 'Focus',
  consistency: 'Consistency',
  examReadiness: 'Exam\nReadiness',
  selfTesting: 'Self\nTesting',
};

export default function RadarChart({ scores }: Props) {
  const data = (Object.keys(scores) as Array<keyof SectionScores>).map(k => ({
    subject: LABELS[k],
    value: scores[k],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadar data={data}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: '#374151', fontFamily: 'var(--font-body)' }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
