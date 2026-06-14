// src/lib/scoring.ts
import type { FormAnswers, SectionScores, ScoreLevel, SPAResult, StudentInfo } from '@/types/spa';

// Standard score mapping
const STANDARD_MAP: Record<string, number> = {
  // 5-point excellent/good/avg/weak/poor
  Excellent: 100, Immediately: 100, Always: 100,
  Good: 75, Mostly: 75, Often: 75,
  Average: 50, Sometimes: 50,
  'Below Average': 25, Rarely: 25,
  Poor: 0, 'Almost Never': 0, Never: 0,
};

function mapScore(value: string, customMap?: Record<string, number>): number {
  const map = customMap ?? STANDARD_MAP;
  return map[value] ?? 0;
}

// ──────────────────────────────────────────────
// Section A: Concept Clarity  (Q10 Q11 Q12)
// ──────────────────────────────────────────────
function scoreConceptClarity(a: FormAnswers): number {
  const q10Map: Record<string, number> = {
    Immediately: 100,
    Mostly: 75,
    Sometimes: 50,
    Rarely: 25,
    'Almost Never': 0,
  };
  const q11Map: Record<string, number> = {
    Always: 100,
    Often: 75,
    Sometimes: 50,
    Rarely: 25,
    Never: 0,
  };
  const q12Map: Record<string, number> = {
    'Very Confident': 100,
    Confident: 75,
    Neutral: 50,
    'Not Very Confident': 25,
    'Not Confident At All': 0,
  };
  const q10 = mapScore(a.q10, q10Map);
  const q11 = mapScore(a.q11, q11Map);
  const q12 = mapScore(a.q12, q12Map);
  return (q10 + q11 + q12) / 3;
}

// ──────────────────────────────────────────────
// Section B: Retention  (Q13 Q14 Q15)
// ──────────────────────────────────────────────
function scoreRetention(a: FormAnswers): number {
  const q13Map: Record<string, number> = {
    'Almost Everything': 100,
    'Most Things': 75,
    'About Half': 50,
    'Very Little': 25,
    'Almost Nothing': 0,
  };
  const q14Map: Record<string, number> = {
    Never: 100,
    Rarely: 75,
    Sometimes: 50,
    Often: 25,
    'Very Often': 0,
  };
  const q15Map: Record<string, number> = {
    Weekly: 100,
    'Every Two Weeks': 75,
    Monthly: 50,
    'Only Before Exams': 25,
    'Almost Never': 0,
  };
  const q13 = mapScore(a.q13, q13Map);
  const q14 = mapScore(a.q14, q14Map);
  const q15 = mapScore(a.q15, q15Map);
  return (q13 + q14 + q15) / 3;
}

// ──────────────────────────────────────────────
// Section C: Focus  (Q16 Q17 Q18)
// ──────────────────────────────────────────────
function scoreFocus(a: FormAnswers): number {
  const q16Map: Record<string, number> = {
    'More than 60 minutes': 100,
    '45–60 minutes': 75,
    '30–45 minutes': 50,
    '15–30 minutes': 25,
    'Less than 15 minutes': 0,
  };
  const q17Map: Record<string, number> = {
    'Nothing Major': 100,
    'Noise Around Me': 75,
    Friends: 60,
    Daydreaming: 50,
    Gaming: 25,
    'YouTube/Reels': 15,
    'Mobile Phone': 0,
  };
  const q18Map: Record<string, number> = {
    Never: 100,
    Rarely: 75,
    Sometimes: 50,
    Often: 25,
    'Very Often': 0,
  };
  const q16 = mapScore(a.q16, q16Map);
  const q17 = mapScore(a.q17, q17Map);
  const q18 = mapScore(a.q18, q18Map);
  return (q16 + q17 + q18) / 3;
}

// ──────────────────────────────────────────────
// Section D: Consistency  (Q19 Q20 Q21)
// ──────────────────────────────────────────────
function scoreConsistency(a: FormAnswers): number {
  const schedMap: Record<string, number> = {
    Always: 100, Usually: 75, Sometimes: 50, Rarely: 25, Never: 0,
  };
  const q19 = mapScore(a.q19, schedMap);
  const q20 = mapScore(a.q20, { Never: 100, Rarely: 75, Sometimes: 50, Often: 25, 'Very Often': 0 });
  const q21 = mapScore(a.q21, schedMap);
  return (q19 + q20 + q21) / 3;
}

// ──────────────────────────────────────────────
// Section E: Exam Readiness  (Q22 Q23 Q24)
// ──────────────────────────────────────────────
function scoreExamReadiness(a: FormAnswers): number {
  const q22Map: Record<string, number> = {
    'Very Confident': 100,
    Confident: 75,
    Neutral: 50,
    'Slightly Nervous': 25,
    'Very Nervous': 0,
  };
  const q23Map: Record<string, number> = {
    'I stay calm and attempt it': 100,
    'I try but lose confidence': 75,
    'I panic slightly': 50,
    'I often get stuck': 25,
    'I completely freeze': 0,
  };
  const q24Map: Record<string, number> = {
    Weekly: 100,
    'Twice a Month': 75,
    Monthly: 50,
    Rarely: 25,
    Never: 0,
  };
  const q22 = mapScore(a.q22, q22Map);
  const q23 = mapScore(a.q23, q23Map);
  const q24 = mapScore(a.q24, q24Map);
  return (q22 + q23 + q24) / 3;
}

// ──────────────────────────────────────────────
// Section F: Self Testing  (Q25 Q26 Q27)
// ──────────────────────────────────────────────
function scoreSelfTesting(a: FormAnswers): number {
  const q25Map: Record<string, number> = {
    Always: 100, Often: 75, Sometimes: 50, Rarely: 25, Never: 0,
  };
  const q26Map: Record<string, number> = {
    'Yes, consistently': 100,
    Sometimes: 50,
    No: 0,
  };
  const q27Map: Record<string, number> = {
    Weekly: 100,
    'Twice a Month': 75,
    Monthly: 50,
    Rarely: 25,
    Never: 0,
  };
  const q25 = mapScore(a.q25, q25Map);
  const q26 = mapScore(a.q26, q26Map);
  const q27 = mapScore(a.q27, q27Map);
  return (q25 + q26 + q27) / 3;
}

// ──────────────────────────────────────────────
// Academic Health Score (weighted)
// ──────────────────────────────────────────────
function calcAcademicHealthScore(s: SectionScores): number {
  return Math.round(
    s.conceptClarity * 0.25 +
    s.retention * 0.20 +
    s.focus * 0.15 +
    s.consistency * 0.15 +
    s.examReadiness * 0.15 +
    s.selfTesting * 0.10
  );
}

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Developing';
  if (score >= 40) return 'Needs Improvement';
  return 'Critical Attention';
}

function getScoreLevelColor(level: ScoreLevel): string {
  const map: Record<ScoreLevel, string> = {
    Excellent: '#22C55E',
    Strong: '#86EFAC',
    Developing: '#EAB308',
    'Needs Improvement': '#F97316',
    'Critical Attention': '#EF4444',
  };
  return map[level];
}

function getSectionLabel(key: keyof SectionScores): string {
  const labels: Record<keyof SectionScores, string> = {
    conceptClarity: 'Concept Clarity',
    retention: 'Knowledge Retention',
    focus: 'Focus',
    consistency: 'Consistency',
    examReadiness: 'Exam Readiness',
    selfTesting: 'Self Testing',
  };
  return labels[key];
}

export function calculateScores(answers: FormAnswers): SectionScores {
  return {
    conceptClarity: Math.round(scoreConceptClarity(answers) * 10) / 10,
    retention: Math.round(scoreRetention(answers) * 10) / 10,
    focus: Math.round(scoreFocus(answers) * 10) / 10,
    consistency: Math.round(scoreConsistency(answers) * 10) / 10,
    examReadiness: Math.round(scoreExamReadiness(answers) * 10) / 10,
    selfTesting: Math.round(scoreSelfTesting(answers) * 10) / 10,
  };
}

export function buildSPAResult(
  studentInfo: StudentInfo,
  answers: FormAnswers,
  submissionId: string
): SPAResult {
  const scores = calculateScores(answers);
  const academicHealthScore = calcAcademicHealthScore(scores);
  const scoreLevel = getScoreLevel(academicHealthScore);

  // Sort sections by score
  const sorted = (Object.keys(scores) as Array<keyof SectionScores>).sort(
    (a, b) => scores[a] - scores[b]
  );

  return {
    studentInfo,
    answers,
    scores,
    academicHealthScore,
    scoreLevel,
    primaryBarrier: sorted[0],
    secondaryBarrier: sorted[1],
    strengthArea: sorted[sorted.length - 1],
    submissionId,
  };
}

export { getScoreLevel, getScoreLevelColor, getSectionLabel };
