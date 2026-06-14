// src/types/spa.ts

export interface StudentInfo {
  studentName: string;
  class: string;
  schoolName: string;
  parentName: string;
  parentContact: string;
  studentEmail: string;
  assessmentDate: string;
}

export interface FormAnswers {
  // Academic Background
  q1: string;
  q2: string[];
  q3: string;
  q4: boolean;

  // Concept Clarity
  q10: string;
  q11: string;
  q12: string;

  // Retention
  q13: string;
  q14: string;
  q15: string;

  // Focus
  q16: string;
  q17: string;
  q18: string;

  // Consistency
  q19: string;
  q20: string;
  q21: string;

  // Exam Readiness
  q22: string;
  q23: string;
  q24: string;

  // Self Testing
  q25: string;
  q26: string;
  q27: string;

  // Goals
  q28: string;
  q29: string;
  q30: string;
}

export interface SectionScores {
  conceptClarity: number;
  retention: number;
  focus: number;
  consistency: number;
  examReadiness: number;
  selfTesting: number;
}

export interface SPAResult {
  studentInfo: StudentInfo;
  answers: FormAnswers;
  scores: SectionScores;
  academicHealthScore: number;
  scoreLevel: ScoreLevel;
  primaryBarrier: keyof SectionScores;
  secondaryBarrier: keyof SectionScores;
  strengthArea: keyof SectionScores;
  submissionId: string;
}

export type ScoreLevel =
  | 'Excellent'
  | 'Strong'
  | 'Developing'
  | 'Needs Improvement'
  | 'Critical Attention';

export type ScoreLevelColor =
  | '#22C55E'
  | '#86EFAC'
  | '#EAB308'
  | '#F97316'
  | '#EF4444';

export interface FormStep {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multi' | 'boolean' | 'text';
  options?: Option[];
  required?: boolean;
}

export interface Option {
  value: string;
  label: string;
  score?: number;
}
