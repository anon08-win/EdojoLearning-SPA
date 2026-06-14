// src/lib/report-template.ts
import type { SPAResult } from '@/types/spa';
import { getSectionLabel } from './scoring';

function scoreColor(score: number): string {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#86EFAC';
  if (score >= 55) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function levelBadgeColor(level: string): string {
  const map: Record<string, string> = {
    Excellent: '#22C55E',
    Strong: '#16A34A',
    Developing: '#EAB308',
    'Needs Improvement': '#F97316',
    'Critical Attention': '#EF4444',
  };
  return map[level] ?? '#6B7280';
}

function radarPoints(scores: Record<string, number>): string {
  const cx = 200, cy = 200, r = 150;
  const keys = Object.values(scores);
  const n = keys.length;
  return keys
    .map((v, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const radius = (v / 100) * r;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

function radarGrid(levels: number): string {
  const cx = 200, cy = 200;
  const n = 6;
  let html = '';
  for (let l = 1; l <= levels; l++) {
    const r = (l / levels) * 150;
    const pts = Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
    html += `<polygon points="${pts}" fill="none" stroke="#E2E8F0" stroke-width="1"/>`;
  }
  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    html += `<line x1="${cx}" y1="${cy}" x2="${cx + 150 * Math.cos(angle)}" y2="${cy + 150 * Math.sin(angle)}" stroke="#E2E8F0" stroke-width="1"/>`;
  }
  return html;
}

function radarLabels(scores: Record<string, number>): string {
  const cx = 200, cy = 200, r = 170;
  const labels = Object.keys(scores);
  const n = labels.length;
  return labels
    .map((label, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const shortLabel = label === 'conceptClarity' ? 'Concept Clarity'
        : label === 'retention' ? 'Retention'
        : label === 'focus' ? 'Focus'
        : label === 'consistency' ? 'Consistency'
        : label === 'examReadiness' ? 'Exam Readiness'
        : 'Self Testing';
      const score = scores[label];
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#374151" font-family="Arial">${shortLabel}</text>
              <text x="${x}" y="${y + 13}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1B2A4A" font-family="Arial">${(score / 10).toFixed(1)}/10</text>`;
    })
    .join('');
}

function barChart(drivers: Array<{ label: string; value: number; color: string }>): string {
  return drivers
    .map((d, i) => {
      const y = i * 42 + 10;
      const w = Math.round((d.value / 100) * 280);
      return `
        <g>
          <text x="0" y="${y + 14}" font-size="12" fill="#374151" font-family="Arial">${d.label}</text>
          <rect x="140" y="${y}" width="${w}" height="20" rx="4" fill="${d.color}"/>
          <text x="${140 + w + 6}" y="${y + 14}" font-size="12" fill="#374151" font-family="Arial">${d.value}%</text>
        </g>`;
    })
    .join('');
}

export function generateReportHTML(result: SPAResult): string {
  const { studentInfo, scores, academicHealthScore, scoreLevel, primaryBarrier, secondaryBarrier, strengthArea, answers } = result;

  const ahsColor = scoreColor(academicHealthScore);
  const levelColor = levelBadgeColor(scoreLevel);
  const radarData = { ...scores };
  const radarPts = radarPoints(Object.values(scores) as unknown as Record<string, number>);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (academicHealthScore / 100) * circumference;

  const drivers = [
    { label: 'Concept Understanding', value: Math.round(scores.conceptClarity), color: '#22C55E' },
    { label: 'Revision Discipline', value: Math.round(scores.retention * 0.5 + scores.selfTesting * 0.5), color: '#F97316' },
    { label: 'Learning Consistency', value: Math.round(scores.consistency), color: '#3B82F6' },
    { label: 'Exam Readiness', value: Math.round(scores.examReadiness), color: '#8B5CF6' },
    { label: 'Self-Testing Habit', value: Math.round(scores.selfTesting), color: '#EF4444' },
  ];

  const riskFactors = [
    { label: 'Retention Consistency', risk: scores.retention < 50 ? 'High' : scores.retention < 70 ? 'Moderate' : 'Low', impact: scores.retention < 60 ? 'High' : 'Medium' },
    { label: 'Revision Discipline', risk: scores.selfTesting < 50 ? 'High' : 'Moderate', impact: 'High' },
    { label: 'Self-Testing Habit', risk: scores.selfTesting < 50 ? 'High' : 'Moderate', impact: 'High' },
    { label: 'Study Consistency', risk: scores.consistency < 60 ? 'Moderate' : 'Low', impact: 'Medium' },
    { label: 'Exam Readiness', risk: scores.examReadiness < 60 ? 'Moderate' : 'Low', impact: 'Medium' },
  ];

  function riskColor(r: string) {
    return r === 'High' ? '#EF4444' : r === 'Moderate' ? '#F97316' : '#22C55E';
  }

  const primaryLabel = getSectionLabel(primaryBarrier);
  const secondaryLabel = getSectionLabel(secondaryBarrier);
  const strengthLabel = getSectionLabel(strengthArea);

  const radarSvgPts = (() => {
    const vals = Object.values(scores);
    const cx = 200, cy = 200, r = 150;
    return vals.map((v, i) => {
      const angle = (Math.PI * 2 * i) / vals.length - Math.PI / 2;
      const radius = (v / 100) * r;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }).join(' ');
  })();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>SPA Report – ${studentInfo.studentName}</title>
<style>

@page {
  size: A4;
  margin: 0;
}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",sans-serif; background:#fff; color:#1B2A4A; font-size:13px; }
  .page { width:794px; min-height:1123px; padding:28px 32px; page-break-after:always; position:relative; overflow:hidden; }
  .page:last-child { page-break-after:auto; }
  .page-break-before {
  page-break-before: always;
  break-before: page;
}

.no-break {
  page-break-inside: avoid;
  break-inside: avoid;
}

.section {
  page-break-inside: avoid;
  break-inside: avoid;
}
  
  /* Header */
  .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:16px; border-bottom:2px solid #F59E0B; margin-bottom:24px; }
  .logo { font-size:22px; font-weight:900; color:#1B2A4A; letter-spacing:-0.5px; }
  .logo span { color:#F59E0B; }
  .report-title { text-align:right; }
  .report-title h1 { font-size:18px; font-weight:800; color:#1B2A4A; letter-spacing:1px; }
  .report-title p { font-size:11px; color:#6B7280; margin-top:2px; }

  /* Student Info Cards */
  .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:24px; }
  .info-card { background:#F8FAFF; border:1px solid #E0E7FF; border-radius:10px; padding:12px 16px; display:flex; align-items:center; gap:10px; }
  .info-icon { width:32px; height:32px; border-radius:50%; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .info-label { font-size:10px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; }
  .info-value { font-size:14px; font-weight:700; color:#1B2A4A; margin-top:2px; }

  /* Section titles */
  .section-title { font-size:22px; font-weight:900; color:#1B2A4A; margin-bottom:4px; }
  .section-subtitle { font-size:12px; color:#6B7280; margin-bottom:20px; }

  /* Score ring */
  .score-block { background:#F8FAFF; border:1px solid #E0E7FF; border-radius:14px; padding:24px; display:flex; flex-direction:column; align-items:center; }
  .score-ring-label { font-size:11px; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; }

  /* Barrier Cards */
  .barrier-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-top:20px; }
  .barrier-card { border-radius:12px; padding:16px; }
  .barrier-card.primary { background:#FFF7ED; border:1px solid #FED7AA; }
  .barrier-card.secondary { background:#FFFBEB; border:1px solid #FDE68A; }
  .barrier-card.strength { background:#F0FDF4; border:1px solid #BBF7D0; }
  .barrier-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
  .barrier-label.primary { color:#EA580C; }
  .barrier-label.secondary { color:#D97706; }
  .barrier-label.strength { color:#16A34A; }
  .barrier-title { font-size:15px; font-weight:800; color:#1B2A4A; margin-bottom:6px; }
  .barrier-desc { font-size:11px; color:#6B7280; line-height:1.5; }

  /* Summary */
  .summary-box { background:#F0F4FF; border:1px solid #C7D2FE; border-radius:12px; padding:18px; margin-top:20px; display:flex; gap:14px; }
  .summary-icon { font-size:24px; flex-shrink:0; }
  .summary-label { font-size:11px; font-weight:700; color:#4F46E5; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
  .summary-text { font-size:12px; color:#374151; line-height:1.6; }

  /* Two-col layout */
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .card { background:#F8FAFF; border:1px solid #E0E7FF; border-radius:12px; padding:18px; }
  .card-title { font-size:13px; font-weight:800; color:#1B2A4A; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .card-num { width:22px; height:22px; border-radius:50%; background:#1B2A4A; color:#fff; font-size:11px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* Style bars */
  .style-bar { margin-bottom:14px; }
  .style-bar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .style-bar-label { font-size:12px; color:#374151; }
  .style-bar-value { font-size:13px; font-weight:700; color:#1B2A4A; }
  .style-bar-track { background:#E5E7EB; border-radius:4px; height:8px; }
  .style-bar-fill { height:8px; border-radius:4px; }

  /* Focus metrics */
  .focus-metric { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #E5E7EB; }
  .focus-metric:last-child { border-bottom:none; }
  .focus-metric-label { font-size:12px; color:#374151; display:flex; align-items:center; gap:6px; }
  .focus-metric-value { font-size:14px; font-weight:700; color:#1B2A4A; }
  .badge { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; }
  .badge-orange { background:#FFF7ED; color:#EA580C; }
  .badge-green { background:#F0FDF4; color:#16A34A; }
  .badge-red { background:#FEF2F2; color:#EF4444; }

  /* Behaviour indicators */
  .indicators { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:14px; }
  .indicator { text-align:center; background:#fff; border:1px solid #E0E7FF; border-radius:10px; padding:12px 6px; }
  .indicator-label { font-size:10px; color:#6B7280; margin-bottom:6px; }
  .indicator-value { font-size:20px; font-weight:900; }

  /* Strengths / dev areas */
  .str-dev { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px; }
  .check-item { display:flex; align-items:flex-start; gap:8px; padding:6px 0; }
  .check-icon { width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; margin-top:1px; }
  .check-green { background:#F0FDF4; color:#16A34A; border:1px solid #BBF7D0; }
  .check-orange { background:#FFF7ED; color:#EA580C; border:1px solid #FED7AA; }
  .check-text { font-size:12px; color:#374151; }

  /* Professional observation */
  .obs-box { background:#162447; color:#fff; border-radius:14px; padding:18px 22px; margin-top:16px; }
  .obs-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#93C5FD; margin-bottom:8px; }
  .obs-text { font-size:12px; line-height:1.6; color:#E0E7FF; }

  /* Recommendation */
  .rec-box { background:linear-gradient( 135deg, #4338CA 0%, #4F46E5 100%); color:#fff; border-radius:14px; padding:18px 22px; margin-top:14px; display:flex; gap:12px; }
  .rec-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#C7D2FE; margin-bottom:6px; }
  .rec-text { font-size:12px; line-height:1.6; color:#EEF2FF; }

  /* Risk table */
  table { width:100%; border-collapse:collapse; }
  th { background:#1B2A4A; color:#fff; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:10px 12px; text-align:left; }
  td { padding:10px 12px; font-size:12px; color:#374151; border-bottom:1px solid #E5E7EB; }
  tr:last-child td { border-bottom:none; }
  .risk-badge { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; display:inline-block; }
  .risk-high { background:#FEF2F2; color:#EF4444; }
  .risk-mod { background:#FFF7ED; color:#EA580C; }
  .risk-low { background:#F0FDF4; color:#16A34A; }

  /* Roadmap */
  .action-table { width:100%; border-collapse:collapse; }
  .action-table th { background:#1B2A4A; color:#fff; font-size:11px; padding:10px 12px; text-align:left; }
  .action-table td { padding:10px 12px; font-size:12px; border-bottom:1px solid #E5E7EB; vertical-align:top; }
  .action-table tr:last-child td { border-bottom:none; }
  .freq-badge { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; }
  .freq-daily { background:#EFF6FF; color:#2563EB; }
  .freq-weekly { background:#F0FDF4; color:#16A34A; }

  /* Week plan */
  .week-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:14px; }
  .week-card { border-radius:10px; padding:14px; }
  .week-1 { background:#EFF6FF; border:1px solid #BFDBFE; }
  .week-2 { background:#FFFBEB; border:1px solid #FDE68A; }
  .week-3 { background:#EFF6FF; border:1px solid #BFDBFE; }
  .week-4 { background:#F0FDF4; border:1px solid #BBF7D0; }
  .week-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
  .week-1 .week-label { color:#2563EB; }
  .week-2 .week-label { color:#D97706; }
  .week-3 .week-label { color:#2563EB; }
  .week-4 .week-label { color:#16A34A; }
  .week-title { font-size:13px; font-weight:800; color:#1B2A4A; margin-bottom:8px; }
  .week-item { font-size:11px; color:#374151; padding:2px 0; padding-left:10px; position:relative; line-height:1.4; }
  .week-item::before { content:"•"; position:absolute; left:0; }

  /* Footer */
  .footer { position:absolute; bottom:18px; left:32px; right:32px; display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid #E5E7EB; }
  .footer-brand { font-size:11px; color:#6B7280; }
  .footer-page { font-size:11px; color:#6B7280; }

  /* Risk gauge */
  .gauge-box { text-align:center; padding:20px; }
  .gauge-level { font-size:22px; font-weight:900; margin-top:8px; }
  .gauge-desc { font-size:11px; color:#6B7280; margin-top:4px; line-height:1.5; max-width:220px; margin-left:auto; margin-right:auto; }

  /* Warning indicators */
  .warning-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
  .warning-item { display:flex; justify-content:space-between; align-items:center; background:#F8FAFF; border:1px solid #E0E7FF; border-radius:8px; padding:10px 14px; }
  .warning-label { font-size:12px; color:#374151; display:flex; align-items:center; gap:6px; }
  .warning-risk { font-size:11px; font-weight:700; }

  /* Pie chart legend */
  .pie-legend { display:flex; flex-direction:column; gap:8px; justify-content:center; }
  .pie-legend-item { display:flex; align-items:center; gap:8px; font-size:12px; color:#374151; }
  .pie-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }

  /* Success indicators */
  .success-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
  .success-item { display:flex; align-items:flex-start; gap:10px; background:#F8FAFF; border:1px solid #E0E7FF; border-radius:8px; padding:12px; }
  .success-icon { font-size:18px; flex-shrink:0; }
  .success-text { font-size:11px; color:#374151; line-height:1.5; }

  /* Final message */
  .final-msg { background:linear-gradient(135deg, #1B2A4A 0%, #2563EB 100%); color:#fff; border-radius:14px; padding:24px; margin-top:20px; }
  .final-msg-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#93C5FD; letter-spacing:0.5px; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
  .final-msg-text { font-size:13px; line-height:1.7; color:#EEF2FF; }
  .next-step { background:#F59E0B; color:#1B2A4A; border-radius:12px; padding:16px 20px; margin-top:16px; display:flex; gap:12px; }
  .next-step-label { font-size:10px; font-weight:700; text-transform:uppercase; color:#92400E; margin-bottom:6px; }
  .next-step-text { font-size:12px; line-height:1.6; color:#1B2A4A; font-weight:500; }
  .card,
.obs-box,
.rec-box,
.barrier-card,
.week-card,
.summary-box {
  break-inside: avoid;
  page-break-inside: avoid;
}

  /* AHS gauge svg arc */
  .ahs-display { display:flex; gap:20px; align-items:flex-start; }
  .profile-overview { flex:1; }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════ PAGE 1 ═══════════════════════════════════════════ -->
<div class="page">
  <div class="header">
    <div class="logo">edo<span>j</span>o<br/><span style="font-size:11px;font-weight:400;color:#6B7280;letter-spacing:1px;">Learning</span></div>
    <div class="report-title">
      <h1>STUDENT PROFILE ANALYSIS™</h1>
      <p>Academic Assessment Report</p>
    </div>
  </div>

  <!-- Student Info -->
  <div class="info-grid">
    <div class="info-card">
      <div class="info-icon">👤</div>
      <div>
        <div class="info-label">Student Name</div>
        <div class="info-value">${studentInfo.studentName}</div>
      </div>
    </div>
    <div class="info-card">
      <div class="info-icon">🎓</div>
      <div>
        <div class="info-label">Class</div>
        <div class="info-value">${studentInfo.class}</div>
      </div>
    </div>
    <div class="info-card">
      <div class="info-icon">📅</div>
      <div>
        <div class="info-label">Assessment Date</div>
        <div class="info-value">${studentInfo.assessmentDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  </div>

  <!-- AHS + Radar -->
  <div class="ahs-display">
    <!-- AHS Ring -->
    <div class="score-block" style="width:240px;flex-shrink:0;">
      <div class="score-ring-label">ACADEMIC HEALTH SCORE</div>
      <svg width="160" height="160" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" stroke-width="10"/>
        <circle cx="60" cy="60" r="54" fill="none" stroke="${ahsColor}" stroke-width="10"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
          stroke-linecap="round" transform="rotate(-90 60 60)"/>
        <text x="60" y="57" text-anchor="middle" font-size="28" font-weight="900" fill="#1B2A4A" font-family="Arial">${academicHealthScore}</text>
        <text x="60" y="72" text-anchor="middle" font-size="12" fill="#6B7280" font-family="Arial">/100</text>
      </svg>
      <div style="background:${levelColor};color:#fff;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-top:8px;">${scoreLevel}</div>
      <div style="font-size:11px;color:#6B7280;text-align:center;margin-top:10px;line-height:1.5;">${studentInfo.studentName}'s academic health is ${scoreLevel.toLowerCase()} with clear opportunities for improvement.</div>
    </div>

    <!-- Radar Chart -->
    <div class="profile-overview" style="background:#F8FAFF;border:1px solid #E0E7FF;border-radius:14px;padding:18px;">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">ACADEMIC PROFILE OVERVIEW</div>
      <svg viewBox="0 0 400 400" width="100%" height="260">
        ${radarGrid(5)}
        ${radarLabels(scores as unknown as Record<string, number>)}
        <polygon points="${radarSvgPts}" fill="#3B82F620" stroke="#3B82F6" stroke-width="2"/>
      </svg>
    </div>
  </div>

  <!-- Barrier Cards -->
  <div class="barrier-grid">
    <div class="barrier-card primary">
      <div class="barrier-label primary">PRIMARY GROWTH BARRIER</div>
      <div class="barrier-title">${primaryLabel}</div>
      <div class="barrier-desc">Information is not being retained over time due to inconsistent revision and self-testing.</div>
    </div>
    <div class="barrier-card secondary">
      <div class="barrier-label secondary">SECONDARY GROWTH BARRIER</div>
      <div class="barrier-title">${secondaryLabel}</div>
      <div class="barrier-desc">Irregular study routine and inconsistent revision are impacting long-term learning.</div>
    </div>
    <div class="barrier-card strength">
      <div class="barrier-label strength">STRONGEST AREA</div>
      <div class="barrier-title">${strengthLabel}</div>
      <div class="barrier-desc">${studentInfo.studentName} shows strong ability in this area with good learning engagement.</div>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary-box">
    <div class="summary-icon">📋</div>
    <div>
      <div class="summary-label">SUMMARY</div>
      <div class="summary-text">${studentInfo.studentName} demonstrates ${scores.conceptClarity >= 70 ? 'strong' : 'developing'} conceptual understanding and maintains ${scores.focus >= 70 ? 'good' : 'moderate'} focus during learning sessions. However, ${scores.retention < 60 ? 'inconsistent revision habits are leading to weak retention of information, which affects performance in tests and exams.' : 'there is room to strengthen retention through structured revision.'} A structured study routine with regular revision and self-testing will help improve long-term results.</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">Edojo Learning</div>
    <div class="footer-brand">Student Profile Analysis™</div>
    <div class="footer-page">Page 1 of 5</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 2 ═══════════════════════════════════════════ -->
<div class="page">
  <div class="header">
    <div class="logo">edo<span>j</span>o<br/><span style="font-size:11px;font-weight:400;color:#6B7280;letter-spacing:1px;">Learning</span></div>
    <div class="report-title">
      <h1>STUDENT PROFILE ANALYSIS™</h1>
      <p>Academic Assessment Report &nbsp;&nbsp; Page 2 of 5</p>
    </div>
  </div>

  <div class="section-title">LEARNING PROFILE ANALYSIS</div>
  <div class="section-subtitle">Understanding how the student learns, retains and engages with academic content.</div>

  <div class="two-col">
    <!-- Learning Style -->
    <div class="card">
      <div class="card-title"><span class="card-num">1</span> LEARNING STYLE PROFILE</div>
      ${[
        { label: 'Visual Learning', value: Math.round(scores.conceptClarity * 0.82), color: '#3B82F6' },
        { label: 'Practice-Based Learning', value: Math.round(scores.selfTesting * 0.3 + scores.examReadiness * 0.7), color: '#22C55E' },
        { label: 'Reading/Writing Learning', value: Math.round(scores.retention * 0.75), color: '#8B5CF6' },
        { label: 'Auditory Learning', value: Math.round(scores.focus * 0.6), color: '#F59E0B' },
      ].map(s => `
        <div class="style-bar">
          <div class="style-bar-header">
            <span class="style-bar-label">${s.label}</span>
            <span class="style-bar-value">${s.value}%</span>
          </div>
          <div class="style-bar-track"><div class="style-bar-fill" style="width:${s.value}%;background:${s.color};"></div></div>
        </div>`).join('')}
      <div class="obs-box" style="margin-top:14px;">
        <div class="obs-label" style="color:#93C5FD;">KEY INSIGHT</div>
        <div class="obs-text" style="font-size:11px;">${studentInfo.studentName} demonstrates strongest learning outcomes when concepts are explained visually and immediately reinforced through guided practice.</div>
      </div>
    </div>

    <!-- Attention & Focus -->
    <div class="card">
      <div class="card-title"><span class="card-num">2</span> ATTENTION & FOCUS ANALYSIS</div>
      <div class="focus-metric">
        <div class="focus-metric-label">⏱️ Average Focus Duration</div>
        <div class="focus-metric-value" style="color:#1B2A4A;">${
          answers.q16 === 'More than 60 minutes' ? '65+ Min' :
          answers.q16 === '45–60 minutes' ? '52 Min' :
          answers.q16 === '30–45 minutes' ? '37 Min' :
          answers.q16 === '15–30 minutes' ? '22 Min' : '10 Min'
        }</div>
      </div>
      <div class="focus-metric">
        <div class="focus-metric-label">📅 Recommended Study Block</div>
        <div class="focus-metric-value" style="color:#22C55E;">${
          scores.focus >= 75 ? '60–75 Min' :
          scores.focus >= 55 ? '45–60 Min' :
          scores.focus >= 35 ? '30–45 Min' : '20–30 Min'
        }</div>
      </div>
      <div class="focus-metric">
        <div class="focus-metric-label">⚠️ Distraction Risk</div>
        <div>
          <span class="badge ${scores.focus >= 70 ? 'badge-green' : scores.focus >= 50 ? 'badge-orange' : 'badge-red'}">${
            scores.focus >= 70 ? 'Low' : scores.focus >= 50 ? 'Moderate' : 'High'
          }</span>
        </div>
      </div>
      <div class="obs-box" style="margin-top:14px;">
        <div class="obs-label" style="color:#93C5FD;">OBSERVATION</div>
        <div class="obs-text" style="font-size:11px;">Focus ${scores.focus >= 65 ? 'remains high during active problem-solving but declines during passive reading sessions.' : 'is a key area to develop — structured short study blocks with active recall will help significantly.'}</div>
      </div>
    </div>
  </div>

  <!-- Behaviour Indicators -->
  <div class="card" style="margin-top:16px;">
    <div class="card-title"><span class="card-num">3</span> LEARNING BEHAVIOUR INDICATORS</div>
    <div class="indicators">
      ${[
        { label: 'Homework Completion', value: `${Math.round(scores.consistency * 0.85)}%`, color: '#3B82F6' },
        { label: 'On-Time Submission', value: `${Math.round(scores.consistency * 0.65)}%`, color: '#22C55E' },
        { label: 'Mistake Review Rate', value: `${Math.round(scores.selfTesting * 0.25)}%`, color: '#F59E0B' },
        { label: 'Self-Testing Frequency', value: `${Math.round(scores.selfTesting * 0.28)}%`, color: '#8B5CF6' },
      ].map(ind => `
        <div class="indicator">
          <div class="indicator-label">${ind.label}</div>
          <svg width="70" height="40" viewBox="0 0 70 40">
            <path d="M 5 38 A 32 32 0 0 1 65 38" fill="none" stroke="#E5E7EB" stroke-width="7" stroke-linecap="round"/>
            <path d="M 5 38 A 32 32 0 0 1 65 38" fill="none" stroke="${ind.color}" stroke-width="7" stroke-linecap="round"
              stroke-dasharray="${Math.PI * 32}" stroke-dashoffset="${Math.PI * 32 * (1 - parseInt(ind.value) / 100)}"/>
            <text x="35" y="35" text-anchor="middle" font-size="13" font-weight="900" fill="#1B2A4A" font-family="Arial">${ind.value}</text>
          </svg>
        </div>`).join('')}
    </div>
  </div>

  <div class="str-dev">
    <div class="card">
      <div class="card-title"><span class="card-num">4</span> STRENGTHS</div>
      ${[
        scores.conceptClarity >= 65 ? 'Strong concept grasp' : null,
        scores.focus >= 55 ? 'Good classroom engagement' : null,
        'Positive learning attitude',
        scores.conceptClarity >= 70 ? 'Strong response to guided teaching' : null,
      ].filter(Boolean).map(s => `
        <div class="check-item">
          <div class="check-icon check-green">✓</div>
          <div class="check-text">${s}</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title"><span class="card-num">5</span> DEVELOPMENT AREAS</div>
      ${[
        scores.retention < 70 ? 'Retention consistency' : null,
        scores.selfTesting < 70 ? 'Revision discipline' : null,
        scores.selfTesting < 60 ? 'Independent practice habits' : null,
        scores.examReadiness < 70 ? 'Exam preparation structure' : null,
      ].filter(Boolean).map(s => `
        <div class="check-item">
          <div class="check-icon check-orange">!</div>
          <div class="check-text">${s}</div>
        </div>`).join('')}
    </div>
  </div>

  <div class="obs-box" style="margin-top:16px;">
    <div class="obs-label">PROFESSIONAL OBSERVATION</div>
    <div class="obs-text">${studentInfo.studentName} possesses strong conceptual ability and remains engaged during structured learning sessions. Current performance gaps appear to stem primarily from inconsistent revision patterns and limited self-assessment practices rather than conceptual weakness. Introducing a structured revision and feedback system is likely to generate significant improvement over the next academic cycle.</div>
  </div>

  <div class="rec-box">
    <div style="font-size:20px;flex-shrink:0;">🎯</div>
    <div>
      <div class="rec-label">RECOMMENDATION</div>
      <div class="rec-text">Implement a structured weekly revision framework with scheduled self-testing checkpoints to improve retention, consistency and long-term academic performance.</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">Edojo Learning</div>
    <div class="footer-brand">Student Profile Analysis™</div>
    <div class="footer-page">Page 2 of 5</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 3 ═══════════════════════════════════════════ -->
<div class="page">
  <div class="header">
    <div class="logo">edo<span>j</span>o<br/><span style="font-size:11px;font-weight:400;color:#6B7280;letter-spacing:1px;">Learning</span></div>
    <div class="report-title">
      <h1>STUDENT PROFILE ANALYSIS™</h1>
      <p>Academic Assessment Report &nbsp;&nbsp; Page 3 of 5</p>
    </div>
  </div>

  <div class="section-title">ROOT CAUSE ANALYSIS</div>
  <div class="section-subtitle">Identifying the factors limiting academic performance and overall improvement.</div>

  <div class="two-col">
    <!-- Performance Drivers Bar Chart -->
    <div class="card">
      <div class="card-title"><span class="card-num">1</span> ACADEMIC PERFORMANCE DRIVERS</div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:12px;">Relative strength across key performance drivers.</div>
      <svg viewBox="0 0 420 230" width="100%" height="200">
        ${drivers.map((d, i) => {
          const y = i * 42 + 10;
          const w = Math.round((d.value / 100) * 230);
          return `
            <text x="0" y="${y + 14}" font-size="11" fill="#374151" font-family="Arial">${d.label}</text>
            <rect x="145" y="${y + 2}" width="${w}" height="18" rx="4" fill="${d.color}" opacity="0.85"/>
            <text x="${145 + w + 6}" y="${y + 14}" font-size="11" fill="#374151" font-family="Arial">${d.value}%</text>`;
        }).join('')}
      </svg>
      <div class="obs-box" style="margin-top:10px;">
        <div class="obs-label" style="color:#93C5FD;">INSIGHT</div>
        <div class="obs-text" style="font-size:11px;">Concept understanding is a key strength, but weak revision and self-testing habits are limiting long-term retention and exam performance.</div>
      </div>
    </div>

    <!-- Performance Barriers -->
    <div class="card">
      <div class="card-title"><span class="card-num">2</span> PRIMARY PERFORMANCE BARRIERS</div>
      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:12px;margin-bottom:10px;">
        <div style="font-size:10px;font-weight:700;color:#EA580C;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">PRIMARY BARRIER</div>
        <div style="font-size:14px;font-weight:800;color:#1B2A4A;margin-bottom:6px;">${primaryLabel}</div>
        <div style="font-size:11px;color:#6B7280;line-height:1.5;">Information is not being retained over time due to inconsistent revision and self-testing.</div>
      </div>
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:12px;margin-bottom:10px;">
        <div style="font-size:10px;font-weight:700;color:#D97706;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">SECONDARY BARRIER</div>
        <div style="font-size:14px;font-weight:800;color:#1B2A4A;margin-bottom:6px;">${secondaryLabel}</div>
        <div style="font-size:11px;color:#6B7280;line-height:1.5;">Irregular study routine and lack of structured revision are impacting long-term learning.</div>
      </div>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px;">
        <div style="font-size:10px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">THIRD BARRIER</div>
        <div style="font-size:14px;font-weight:800;color:#1B2A4A;margin-bottom:6px;">Exam Application</div>
        <div style="font-size:11px;color:#6B7280;line-height:1.5;">Difficulty in applying concepts under exam conditions and managing time effectively.</div>
      </div>
    </div>
  </div>

  <!-- Performance Cycle -->
  <div class="two-col" style="margin-top:16px;">
    <div class="card">
      <div class="card-title"><span class="card-num">3</span> PERFORMANCE CYCLE (WHY MARKS ARE AFFECTED)</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;overflow:hidden;">
        ${['Concepts\nLearned','Limited /\nNo Revision','Concepts\nForgotten','Low\nConfidence','Weak Exam\nPerformance'].map((step, i) => `
          <div style="text-align:center;flex:1;">
            <div style="background:${['#EFF6FF','#FFFBEB','#FFF7ED','#FEF2F2','#FDF2F8'][i]};border:1px solid ${['#BFDBFE','#FDE68A','#FED7AA','#FECACA','#F5D0FE'][i]};border-radius:8px;padding:8px 4px;font-size:10px;color:#374151;line-height:1.4;">${step.replace('\n','<br/>')}</div>
            ${i < 4 ? '<div style="font-size:16px;color:#9CA3AF;">→</div>' : ''}
          </div>`).join('')}
      </div>
      <div class="obs-box" style="margin-top:10px;">
        <div class="obs-label" style="color:#93C5FD;">INSIGHT</div>
        <div class="obs-text" style="font-size:11px;">Breaking this cycle through regular revision and self-testing will lead to stronger confidence and better results.</div>
      </div>
    </div>

    <!-- Learning Behaviour Pattern Pie -->
    <div class="card">
      <div class="card-title"><span class="card-num">4</span> LEARNING BEHAVIOUR PATTERN</div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:12px;">How ${studentInfo.studentName} currently approaches learning.</div>
      <div style="display:flex;align-items:center;gap:16px;">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <!-- Active 40% -->
          <path d="M60,60 L60,10 A50,50 0 0,1 107,85 Z" fill="#22C55E"/>
          <!-- Passive 25% -->
          <path d="M60,60 L107,85 A50,50 0 0,1 35,107 Z" fill="#F59E0B"/>
          <!-- Distractions 20% -->
          <path d="M60,60 L35,107 A50,50 0 0,1 13,35 Z" fill="#F97316"/>
          <!-- Unstructured 15% -->
          <path d="M60,60 L13,35 A50,50 0 0,1 60,10 Z" fill="#EF4444"/>
          <circle cx="60" cy="60" r="25" fill="white"/>
        </svg>
        <div class="pie-legend">
          <div class="pie-legend-item"><div class="pie-dot" style="background:#22C55E;"></div>Active Learning (Concept & Practice) — 40%</div>
          <div class="pie-legend-item"><div class="pie-dot" style="background:#F59E0B;"></div>Passive Learning (Reading/Watching) — 25%</div>
          <div class="pie-legend-item"><div class="pie-dot" style="background:#F97316;"></div>Distractions & Breaks — 20%</div>
          <div class="pie-legend-item"><div class="pie-dot" style="background:#EF4444;"></div>Unstructured Time — 15%</div>
        </div>
      </div>
      <div class="obs-box" style="margin-top:12px;">
        <div class="obs-label" style="color:#93C5FD;">INSIGHT</div>
        <div class="obs-text" style="font-size:11px;">A large portion of study time is passive or unstructured. Increasing active learning time will improve outcomes.</div>
      </div>
    </div>
  </div>

  <!-- Key Observations -->
  <div class="card" style="margin-top:16px;">
    <div class="card-title"><span class="card-num">5</span> KEY OBSERVATIONS SUMMARY</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;">
      ${[
        { type:'STRENGTH', color:'#22C55E', bg:'#F0FDF4', border:'#BBF7D0', icon:'🧠', title:'Strong conceptual foundation', text:`${studentInfo.studentName} understands concepts well and can grasp new topics quickly when interest is high.` },
        { type:'GAP', color:'#F97316', bg:'#FFF7ED', border:'#FED7AA', icon:'📚', title:'Weak revision habit', text:'Inconsistent revision leads to forgetting concepts and weak performance in tests.' },
        { type:'GAP', color:'#EF4444', bg:'#FEF2F2', border:'#FECACA', icon:'🎯', title:'Low self-testing frequency', text:'Limited practice and self-testing reduce confidence and problem-solving ability in exams.' },
        { type:'OPPORTUNITY', color:'#4F46E5', bg:'#EFF6FF', border:'#BFDBFE', icon:'📅', title:'Structured routine can transform results', text:'With a consistent plan and feedback loop, significant improvement is highly likely.' },
      ].map(o => `
        <div style="background:${o.bg};border:1px solid ${o.border};border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:${o.color};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${o.type}</div>
          <div style="font-size:18px;margin-bottom:6px;">${o.icon}</div>
          <div style="font-size:12px;font-weight:700;color:#1B2A4A;margin-bottom:6px;">${o.title}</div>
          <div style="font-size:11px;color:#6B7280;line-height:1.5;">${o.text}</div>
        </div>`).join('')}
    </div>
  </div>

  <div class="obs-box" style="margin-top:16px;">
    <div class="obs-label">PROFESSIONAL ANALYSIS</div>
    <div class="obs-text">${studentInfo.studentName} has a solid conceptual ability and shows good engagement during learning sessions. However, the analysis indicates that inconsistent revision, limited self-testing and lack of a structured study routine are the primary reasons for weak retention and exam performance. Addressing these barriers with a focused plan will unlock true academic potential.</div>
  </div>

  <div class="footer">
    <div class="footer-brand">Edojo Learning</div>
    <div class="footer-brand">Student Profile Analysis™</div>
    <div class="footer-page">Page 3 of 5</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 4 ═══════════════════════════════════════════ -->
<div class="page">
  <div class="header">
    <div class="logo">edo<span>j</span>o<br/><span style="font-size:11px;font-weight:400;color:#6B7280;letter-spacing:1px;">Learning</span></div>
    <div class="report-title">
      <h1>STUDENT PROFILE ANALYSIS™</h1>
      <p>Academic Assessment Report &nbsp;&nbsp; Page 4 of 5</p>
    </div>
  </div>

  <div class="section-title">PERFORMANCE RISK ASSESSMENT</div>
  <div class="section-subtitle">Evaluating potential academic risks that may impact future performance if not addressed.</div>

  <div class="two-col">
    <!-- Risk Gauge -->
    <div class="card">
      <div class="card-title"><span class="card-num">1</span> OVERALL RISK SUMMARY</div>
      <div class="gauge-box">
        <svg viewBox="0 0 200 120" width="200" height="120">
          <!-- Track arc -->
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E5E7EB" stroke-width="16" stroke-linecap="round"/>
          <!-- Green zone -->
          <path d="M 20 100 A 80 80 0 0 1 73 35" fill="none" stroke="#22C55E" stroke-width="16" stroke-linecap="round"/>
          <!-- Yellow -->
          <path d="M 73 35 A 80 80 0 0 1 127 35" fill="none" stroke="#EAB308" stroke-width="16" stroke-linecap="round"/>
          <!-- Orange -->
          <path d="M 127 35 A 80 80 0 0 1 167 65" fill="none" stroke="#F97316" stroke-width="16" stroke-linecap="round"/>
          <!-- Red -->
          <path d="M 167 65 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" stroke-width="16" stroke-linecap="round"/>
          <!-- Needle -->
          <line x1="100" y1="100" x2="${100 + 65 * Math.cos(Math.PI * (1 - academicHealthScore/100) - Math.PI)}" y2="${100 - 65 * Math.sin(Math.PI * (1 - academicHealthScore/100) - Math.PI)}" stroke="#1B2A4A" stroke-width="3" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="6" fill="#1B2A4A"/>
        </svg>
        <div class="gauge-level" style="color:${academicHealthScore >= 70 ? '#22C55E' : academicHealthScore >= 55 ? '#EAB308' : '#F97316'};">${academicHealthScore >= 70 ? 'LOW RISK' : academicHealthScore >= 55 ? 'MODERATE RISK' : 'HIGH RISK'}</div>
        <div class="gauge-desc">${studentInfo.studentName} is at ${academicHealthScore >= 70 ? 'low' : 'moderate'} academic risk. Timely intervention can significantly improve outcomes.</div>
      </div>
    </div>

    <!-- Risk Factor Breakdown -->
    <div class="card">
      <div class="card-title"><span class="card-num">2</span> RISK FACTOR BREAKDOWN</div>
      <table>
        <thead>
          <tr><th>Risk Factor</th><th>Risk Level</th><th>Impact</th></tr>
        </thead>
        <tbody>
          ${riskFactors.map(r => `
            <tr>
              <td>${r.label}</td>
              <td><span class="risk-badge ${r.risk === 'High' ? 'risk-high' : r.risk === 'Moderate' ? 'risk-mod' : 'risk-low'}">${r.risk}</span></td>
              <td><span style="font-size:12px;font-weight:700;color:${r.impact === 'High' ? '#EF4444' : '#F97316'};">${r.impact}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Risk Matrix + Early Warning -->
  <div class="two-col" style="margin-top:16px;">
    <div class="card">
      <div class="card-title"><span class="card-num">3</span> RISK IMPACT MATRIX</div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:10px;">Likelihood of Risk Occurring vs Impact on Performance</div>
      <table style="font-size:11px;">
        <thead>
          <tr>
            <th style="background:#F8FAFF;color:#374151;">Impact ↕ / Likelihood →</th>
            <th style="background:#1B2A4A;">Low</th>
            <th style="background:#1B2A4A;">Medium</th>
            <th style="background:#1B2A4A;">High</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:700;background:#F8FAFF;">High</td>
            <td style="background:#FFF7ED;color:#EA580C;font-size:10px;font-weight:600;">Study Consistency</td>
            <td style="background:#FEF2F2;color:#EF4444;font-size:10px;font-weight:600;">Revision Discipline</td>
            <td style="background:#FEF2F2;color:#EF4444;font-size:10px;font-weight:600;">Retention Consistency</td>
          </tr>
          <tr>
            <td style="font-weight:700;background:#F8FAFF;">Medium</td>
            <td style="background:#FFF7ED;color:#EA580C;font-size:10px;font-weight:600;">Exam Readiness</td>
            <td style="background:#FFFBEB;color:#D97706;font-size:10px;font-weight:600;">Concept Clarity</td>
            <td style="background:#FFF7ED;color:#EA580C;font-size:10px;font-weight:600;">Self-Testing Habit</td>
          </tr>
          <tr>
            <td style="font-weight:700;background:#F8FAFF;">Low</td>
            <td style="background:#F0FDF4;color:#16A34A;font-size:10px;">—</td>
            <td style="background:#F0FDF4;color:#16A34A;font-size:10px;">—</td>
            <td style="background:#F0FDF4;color:#16A34A;font-size:10px;">—</td>
          </tr>
        </tbody>
      </table>
      <div class="obs-box" style="margin-top:12px;">
        <div class="obs-label" style="color:#93C5FD;">INSIGHT</div>
        <div class="obs-text" style="font-size:11px;">High impact risks are concentrated in areas related to revision, retention and self-testing. Addressing these will reduce overall academic risk.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="card-num">4</span> EARLY WARNING INDICATORS</div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:10px;">Signs that may lead to declining academic performance.</div>
      <div class="warning-grid">
        ${[
          { label: '⚠️ Frequent forgetting of recently studied concepts', risk: scores.retention < 60 ? 'High' : 'Moderate' },
          { label: '📅 Irregular or last-minute revision patterns', risk: scores.consistency < 60 ? 'High' : 'Moderate' },
          { label: '🎯 Low practice and self-testing frequency', risk: scores.selfTesting < 60 ? 'High' : 'Moderate' },
          { label: '⏰ Inconsistent daily study routine', risk: scores.consistency < 70 ? 'Moderate' : 'Low' },
          { label: '😟 Low confidence during tests and exams', risk: scores.examReadiness < 60 ? 'Moderate' : 'Low' },
          { label: '📱 High distraction during study sessions', risk: scores.focus < 55 ? 'High' : 'Moderate' },
        ].map(w => `
          <div class="warning-item">
            <div class="warning-label">${w.label}</div>
            <span class="warning-risk" style="color:${w.risk === 'High' ? '#EF4444' : w.risk === 'Moderate' ? '#F97316' : '#22C55E'};">${w.risk}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- If Left Unaddressed -->
  <div class="page-break-before"></div>
  <div class="card" style="margin-top:16px;">
    <div class="card-title"><span class="card-num">5</span> IF LEFT UNADDRESSED, POTENTIAL OUTCOMES MAY INCLUDE</div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;">
      ${[
        { icon:'📉', text:'Weaker retention of key concepts' },
        { icon:'📋', text:'Lower test scores and academic performance' },
        { icon:'😰', text:'Reduced confidence and increased exam stress' },
        { icon:'😕', text:'Difficulty keeping up with advanced topics' },
        { icon:'🎓', text:'Impact on long-term academic potential and goals' },
      ].map((item, i) => `
        <div style="text-align:center;flex:1;">
          <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 8px;margin:0 4px;">
            <div style="font-size:22px;margin-bottom:6px;">${item.icon}</div>
            <div style="font-size:10px;color:#374151;line-height:1.4;">${item.text}</div>
          </div>
          ${i < 4 ? '<div style="font-size:16px;color:#9CA3AF;margin-top:8px;">›</div>' : ''}
        </div>`).join('')}
    </div>
  </div>

  <div class="obs-box" style="margin-top:16px;">
    <div class="obs-label">PROFESSIONAL RECOMMENDATION</div>
    <div class="obs-text">${studentInfo.studentName} has the potential to significantly improve with early intervention. Building strong habits around regular revision, self-testing and study consistency will help reduce academic risks and create a strong foundation for long-term success.</div>
  </div>

  <div class="rec-box">
    <div style="font-size:20px;flex-shrink:0;">🎯</div>
    <div>
      <div class="rec-label">ACTION PRIORITY</div>
      <div class="rec-text">Focus on reducing high-impact risks (${primaryLabel}, ${secondaryLabel}) through structured support and consistent practice.</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">Edojo Learning</div>
    <div class="footer-brand">Student Profile Analysis™</div>
    <div class="footer-page">Page 4 of 5</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════ PAGE 5 ═══════════════════════════════════════════ -->
<div class="page">
  <div class="header">
    <div class="logo">edo<span>j</span>o<br/><span style="font-size:11px;font-weight:400;color:#6B7280;letter-spacing:1px;">Learning</span></div>
    <div class="report-title">
      <h1>STUDENT PROFILE ANALYSIS™</h1>
      <p>Academic Assessment Report &nbsp;&nbsp; Page 5 of 5</p>
    </div>
  </div>

  <div class="section-title">PERSONALIZED IMPROVEMENT ROADMAP</div>
  <div class="section-subtitle">A structured plan to help ${studentInfo.studentName} improve consistently and achieve academic goals.</div>

  <div class="two-col">
    <!-- Primary Focus Areas -->
    <div class="card">
      <div class="card-title"><span class="card-num">1</span> PRIMARY FOCUS AREAS</div>
      ${[
        { color:'#F97316', bg:'#FFF7ED', border:'#FED7AA', icon:'📚', title:primaryLabel, desc:`Build strong ${primaryLabel.toLowerCase()} through regular revision cycles and spaced repetition.` },
        { color:'#22C55E', bg:'#F0FDF4', border:'#BBF7D0', icon:'🎯', title:secondaryLabel, desc:`Develop a consistent ${secondaryLabel.toLowerCase()} routine and follow a structured approach.` },
        { color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE', icon:'🔬', title:'Self-Testing Habit', desc:'Increase self-testing frequency to improve recall, confidence and exam performance.' },
      ].map(f => `
        <div style="background:${f.bg};border:1px solid ${f.border};border-radius:10px;padding:12px;margin-bottom:10px;display:flex;gap:10px;align-items:flex-start;">
          <div style="font-size:20px;flex-shrink:0;">${f.icon}</div>
          <div>
            <div style="font-size:13px;font-weight:800;color:${f.color};margin-bottom:4px;">${f.title}</div>
            <div style="font-size:11px;color:#6B7280;line-height:1.5;">${f.desc}</div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Action Plan Table -->
    <div class="card">
      <div class="card-title"><span class="card-num">2</span> RECOMMENDED ACTION PLAN</div>
      <table class="action-table">
        <thead><tr><th>Action Step</th><th>Frequency</th></tr></thead>
        <tbody>
          ${[
            { step:'📅 Create a weekly study plan with fixed revision blocks', freq:'Every Week', cls:'freq-weekly' },
            { step:'📚 Revise key concepts within 24–48 hours of learning', freq:'Daily', cls:'freq-daily' },
            { step:'🎯 Solve 10–15 practice questions per subject daily', freq:'Daily', cls:'freq-daily' },
            { step:'✅ Take a short self-test at the end of each study session', freq:'Daily', cls:'freq-daily' },
            { step:'📓 Review mistakes and maintain an error notebook', freq:'Every Week', cls:'freq-weekly' },
            { step:'⏰ Reduce distractions and study in focused time blocks', freq:'Daily', cls:'freq-daily' },
          ].map(a => `
            <tr>
              <td>${a.step}</td>
              <td><span class="freq-badge ${a.cls}">${a.freq}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 4-Week Plan -->
  <div class="card" style="margin-top:16px;">
    <div class="card-title"><span class="card-num">3</span> 4-WEEK IMPROVEMENT PLAN</div>
    <div class="week-grid">
      <div class="week-card week-1">
        <div class="week-label">WEEK 1</div>
        <div class="week-title">Foundation</div>
        <div class="week-item">Organize study space and materials</div>
        <div class="week-item">Create weekly plan and daily study routine</div>
        <div class="week-item">Revise concepts learned in the last 7 days</div>
      </div>
      <div class="week-card week-2">
        <div class="week-label">WEEK 2</div>
        <div class="week-title">Consistency</div>
        <div class="week-item">Follow the plan consistently</div>
        <div class="week-item">Daily practice and self-testing</div>
        <div class="week-item">Revise concepts from the last 2 weeks</div>
      </div>
      <div class="week-card week-3">
        <div class="week-label">WEEK 3</div>
        <div class="week-title">Strengthening</div>
        <div class="week-item">Increase practice question difficulty</div>
        <div class="week-item">Focus on weak areas identified</div>
        <div class="week-item">Take mini tests and analyze mistakes</div>
      </div>
      <div class="week-card week-4">
        <div class="week-label">WEEK 4</div>
        <div class="week-title">Performance</div>
        <div class="week-item">Full-length practice test</div>
        <div class="week-item">Improve time management and accuracy</div>
        <div class="week-item">Final revision and confidence building</div>
      </div>
    </div>
  </div>

  <!-- Daily Framework + Success Indicators -->
  <div class="two-col" style="margin-top:16px;">
    <div class="card">
      <div class="card-title"><span class="card-num">4</span> DAILY STUDY FRAMEWORK</div>
      <div style="display:flex;align-items:center;gap:16px;">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <!-- 90 min total: Learning 25, Practice 25, Revision 20, Self-Test 10, Break 10 -->
          <!-- Learning 25/90 = 100deg -->
          <path d="M60,60 L60,10 A50,50 0 0,1 107,85 Z" fill="#22C55E"/>
          <!-- Practice 25/90 -->
          <path d="M60,60 L107,85 A50,50 0 0,1 35,107 Z" fill="#F97316"/>
          <!-- Revision 20/90 -->
          <path d="M60,60 L35,107 A50,50 0 0,1 13,60 Z" fill="#3B82F6"/>
          <!-- Self-Test 10/90 -->
          <path d="M60,60 L13,60 A50,50 0 0,1 23,28 Z" fill="#8B5CF6"/>
          <!-- Break 10/90 -->
          <path d="M60,60 L23,28 A50,50 0 0,1 60,10 Z" fill="#E5E7EB"/>
          <circle cx="60" cy="60" r="25" fill="white"/>
          <text x="60" y="57" text-anchor="middle" font-size="12" font-weight="900" fill="#1B2A4A" font-family="Arial">90</text>
          <text x="60" y="70" text-anchor="middle" font-size="9" fill="#6B7280" font-family="Arial">Minutes</text>
        </svg>
        <div style="flex:1;">
          ${[
            { color:'#22C55E', label:'Concept Learning (25 min)', desc:'Focus on understanding the topic clearly.' },
            { color:'#F97316', label:'Practice (25 min)', desc:'Solve questions and apply concepts.' },
            { color:'#3B82F6', label:'Revision (20 min)', desc:'Revise key points and important formulas.' },
            { color:'#8B5CF6', label:'Self-Test (10 min)', desc:'Test yourself without looking at notes.' },
            { color:'#E5E7EB', label:'Break (10 min)', desc:'Short break to relax and recharge.' },
          ].map(item => `
            <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0;margin-top:2px;"></div>
              <div>
                <div style="font-size:11px;font-weight:700;color:#1B2A4A;">${item.label}</div>
                <div style="font-size:10px;color:#6B7280;">${item.desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="card-num">5</span> SUCCESS INDICATORS</div>
      <div class="success-grid">
        ${[
          { icon:'📈', text:'Improved retention of concepts over time' },
          { icon:'🎯', text:'Consistent revision and self-testing habit' },
          { icon:'💪', text:'Increased confidence in tests and exams' },
          { icon:'⏰', text:'Better time management and focus' },
          { icon:'🏆', text:'Steady improvement in academic performance' },
          { icon:'📚', text:'Reduced homework backlog and stress' },
        ].map(s => `
          <div class="success-item">
            <div class="success-icon">${s.icon}</div>
            <div class="success-text">${s.text}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Final Message -->
  <div class="final-msg">
    <div class="final-msg-label">💡 FINAL MESSAGE</div>
    <div class="final-msg-text">${studentInfo.studentName} has strong potential and the right foundation to excel academically. Consistent effort, regular revision, self-testing and a structured approach will help achieve goals and unlock true potential. Every small step taken today builds the academic success of tomorrow.</div>
  </div>

  <div class="next-step">
    <div style="font-size:20px;flex-shrink:0;">🎯</div>
    <div>
      <div class="next-step-label">NEXT STEP</div>
      <div class="next-step-text">Follow this roadmap consistently. Small daily improvements will lead to significant long-term results. Edojo Learning is here to support ${studentInfo.studentName} at every step of the learning journey.</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">Edojo Learning</div>
    <div class="footer-brand">Student Profile Analysis™</div>
    <div class="footer-page">Page 5 of 5</div>
  </div>
</div>

</body>
</html>`;
}
