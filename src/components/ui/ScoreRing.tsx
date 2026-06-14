// src/components/ui/ScoreRing.tsx
'use client';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function scoreColor(score: number): string {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#16A34A';
  if (score >= 55) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8, label }: Props) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
        <text x={cx} y={cx - 4} textAnchor="middle" fontSize={size * 0.22} fontWeight="900" fill="#1B2A4A" fontFamily="Arial">
          {score}
        </text>
        <text x={cx} y={cx + size * 0.14} textAnchor="middle" fontSize={size * 0.1} fill="#6B7280" fontFamily="Arial">
          /100
        </text>
      </svg>
      {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
    </div>
  );
}
