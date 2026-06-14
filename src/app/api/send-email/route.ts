// src/app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { SPAResult } from '@/types/spa';

export async function POST(req: NextRequest) {
  try {
    const { result, pdfBase64 }: { result: SPAResult; pdfBase64: string } = await req.json();

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const fileName = `SPA_Report_${result.studentInfo.studentName.replace(/\s+/g, '_')}.pdf`;
    const { studentInfo, academicHealthScore, scoreLevel, scores } = result;

    const emailBody = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1B2A4A;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">edojo <span style="color:#F59E0B;">Learning</span></h1>
    <p style="color:#93C5FD;margin:6px 0 0;">Student Profile Analysis™ Report</p>
  </div>
  <div style="padding:32px 24px;">
    <h2 style="color:#1B2A4A;">Dear ${studentInfo.parentName || 'Parent/Guardian'},</h2>
    <p style="color:#374151;line-height:1.6;">Please find attached the Student Profile Analysis (SPA) report for <strong>${studentInfo.studentName}</strong>.</p>
    
    <div style="background:#F8FAFF;border:1px solid #E0E7FF;border-radius:12px;padding:20px;margin:20px 0;">
      <h3 style="color:#1B2A4A;margin-bottom:16px;">📊 Report Summary</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Student Name</td>
          <td style="padding:8px 0;color:#1B2A4A;font-weight:700;">${studentInfo.studentName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Class</td>
          <td style="padding:8px 0;color:#1B2A4A;font-weight:700;">${studentInfo.class}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Academic Health Score</td>
          <td style="padding:8px 0;">
            <span style="background:${academicHealthScore >= 70 ? '#F0FDF4' : '#FFF7ED'};color:${academicHealthScore >= 70 ? '#16A34A' : '#EA580C'};padding:3px 12px;border-radius:20px;font-weight:700;font-size:14px;">${academicHealthScore}/100</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Level</td>
          <td style="padding:8px 0;color:#1B2A4A;font-weight:700;">${scoreLevel}</td>
        </tr>
      </table>
    </div>

    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:20px 0;">
      <h3 style="color:#16A34A;margin-bottom:12px;">✅ Key Strengths</h3>
      <ul style="color:#374151;padding-left:20px;line-height:1.8;">
        ${scores.conceptClarity >= 70 ? '<li>Strong conceptual understanding</li>' : ''}
        ${scores.focus >= 65 ? '<li>Good focus and attention during sessions</li>' : ''}
        <li>Positive learning attitude identified</li>
      </ul>
    </div>

    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:20px;margin:20px 0;">
      <h3 style="color:#EA580C;margin-bottom:12px;">⚡ Priority Areas</h3>
      <ul style="color:#374151;padding-left:20px;line-height:1.8;">
        ${scores.retention < 70 ? '<li>Strengthen knowledge retention through regular revision</li>' : ''}
        ${scores.selfTesting < 70 ? '<li>Build self-testing habit for better exam performance</li>' : ''}
        ${scores.consistency < 70 ? '<li>Improve study schedule consistency</li>' : ''}
      </ul>
    </div>

    <p style="color:#374151;line-height:1.6;">Please review the attached 5-page detailed report for complete analysis, root cause identification, performance risk assessment, and a personalized 4-week improvement roadmap.</p>
    
    <div style="background:#1B2A4A;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
      <p style="color:#E0E7FF;margin:0;line-height:1.6;">For any questions or to discuss this report, please contact Edojo Learning.</p>
    </div>
  </div>
  <div style="background:#F8FAFF;padding:16px 24px;text-align:center;border-top:1px solid #E0E7FF;">
    <p style="color:#6B7280;font-size:12px;margin:0;">© ${new Date().getFullYear()} Edojo Learning. Student Profile Analysis™</p>
  </div>
</div>`;

    // Send to admin
    await transporter.sendMail({
      from: `"Edojo Learning" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `SPA Report – ${studentInfo.studentName} (Class ${studentInfo.class}) | Score: ${academicHealthScore}/100`,
      html: emailBody,
      attachments: [{ filename: fileName, content: pdfBuffer, contentType: 'application/pdf' }],
    });

    // Send to student/parent if email provided
    if (studentInfo.studentEmail) {
      await transporter.sendMail({
        from: `"Edojo Learning" <${process.env.SMTP_USER}>`,
        to: studentInfo.studentEmail,
        subject: `Your Student Profile Analysis Report – ${studentInfo.studentName}`,
        html: emailBody,
        attachments: [{ filename: fileName, content: pdfBuffer, contentType: 'application/pdf' }],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Email sending failed' }, { status: 500 });
  }
}
