// src/app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { buildSPAResult } from '@/lib/scoring';
import type { FormAnswers, StudentInfo } from '@/types/spa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentInfo, answers }: { studentInfo: StudentInfo; answers: FormAnswers } = body;

    const supabase = createAdminClient();

    // 1. Insert raw submission
    const { data: row, error: insertError } = await supabase
      .from('spa_submissions')
      .insert({
        student_name: studentInfo.studentName,
        class: studentInfo.class,
        school_name: studentInfo.schoolName,
        parent_name: studentInfo.parentName,
        parent_contact: studentInfo.parentContact,
        student_email: studentInfo.studentEmail,
        assessment_date: studentInfo.assessmentDate || new Date().toISOString().split('T')[0],

        q1_academic_performance: answers.q1,
        q2_difficult_subjects: answers.q2,
        q3_academic_challenge: answers.q3,
        q4_attends_tuition: answers.q4,

        q10_concept_speed: answers.q10,
        q11_answer_understanding: answers.q11,
        q12_explain_confidence: answers.q12,

        q13_chapter_memory: answers.q13,
        q14_forget_before_exam: answers.q14,
        q15_revision_frequency: answers.q15,

        q16_focus_duration: answers.q16,
        q17_main_distraction: answers.q17,
        q18_mind_wandering: answers.q18,

        q19_study_schedule: answers.q19,
        q20_missed_sessions: answers.q20,
        q21_homework_completion: answers.q21,

        q22_exam_confidence: answers.q22,
        q23_difficult_question: answers.q23,
        q24_practice_tests: answers.q24,

        q25_mistake_review: answers.q25,
        q26_error_notebook: answers.q26,
        q27_self_testing: answers.q27,

        q28_primary_goal: answers.q28,
        q29_improvement_wish: answers.q29,
        q30_additional_info: answers.q30,
      })
      .select()
      .single();

    if (insertError || !row) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    // 2. Build result with scores
    const result = buildSPAResult(studentInfo, answers, row.id);

    // 3. Update scores in DB
    await supabase
      .from('spa_submissions')
      .update({
        concept_clarity_score: result.scores.conceptClarity,
        retention_score: result.scores.retention,
        focus_score: result.scores.focus,
        consistency_score: result.scores.consistency,
        exam_readiness_score: result.scores.examReadiness,
        self_testing_score: result.scores.selfTesting,
        academic_health_score: result.academicHealthScore,
        score_level: result.scoreLevel,
      })
      .eq('id', row.id);

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
