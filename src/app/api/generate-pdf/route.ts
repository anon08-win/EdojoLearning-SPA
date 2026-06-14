// src/app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateReportHTML } from '@/lib/report-template';
import { createAdminClient } from '@/lib/supabase';
import type { SPAResult } from '@/types/spa';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function POST(req: NextRequest) {
  try {


    const { result }: { result: SPAResult } = await req.json();

    const html = generateReportHTML(result);

    // Dynamic import of puppeteer (server-side only)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();

    await page.setContent(html);

    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    await browser.close();

    // Try to store PDF in Supabase Storage
    try {
      const supabase = createAdminClient();
      const fileName = `spa-reports/${result.submissionId}.pdf`;

      const { error: storageError } = await supabase.storage
        .from('reports')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!storageError) {
        const { data: urlData } = supabase.storage
          .from('reports')
          .getPublicUrl(fileName);

        await supabase
          .from('spa_submissions')
          .update({ pdf_url: urlData.publicUrl })
          .eq('id', result.submissionId);
      }
    } catch (storageErr) {
      console.warn('Storage upload failed (optional):', storageErr);
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SPA_Report_${result.studentInfo.studentName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
