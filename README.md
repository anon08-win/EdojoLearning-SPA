# Edojo Learning – Student Profile Analysis™

A production-ready Next.js web application for conducting academic health assessments and generating professional 5-page PDF reports.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS |
| Database | Supabase (PostgreSQL) |
| PDF Generation | Puppeteer |
| Email | Nodemailer (SMTP) |
| Charts | Recharts |
| Language | TypeScript |

---

## 📁 Project Structure

```
edojo-spa/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── submit/route.ts          # Save submission + calculate scores
│   │   │   ├── generate-pdf/route.ts    # Puppeteer PDF generation
│   │   │   └── send-email/route.ts      # Nodemailer email delivery
│   │   ├── assessment/page.tsx          # Multi-step form
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── form/
│   │   │   ├── StepForm.tsx             # Individual step renderer
│   │   │   ├── ReviewStep.tsx           # Final review before submit
│   │   │   └── SubmitLoader.tsx         # Animated loading screen
│   │   └── ui/
│   │       ├── ScoreRing.tsx            # SVG circular score
│   │       ├── RadarChart.tsx           # Recharts radar chart
│   │       └── ScoreBars.tsx            # Animated score bars
│   ├── lib/
│   │   ├── scoring.ts                   # All scoring rules (exact match to SPA document)
│   │   ├── questions.ts                 # All 25 questions with options
│   │   ├── supabase.ts                  # Supabase client (browser + server)
│   │   └── report-template.ts           # Complete 5-page HTML report template
│   └── types/
│       └── spa.ts                       # TypeScript interfaces
├── supabase-schema.sql                  # Run this in Supabase SQL editor
├── .env.local.example                   # Environment variable template
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL editor
3. Create a Storage bucket named `reports` (public)

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email (Gmail App Password recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@edojolearning.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security → App Passwords
3. Generate a password for "Mail"
4. Use this as `SMTP_PASS`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 📊 Scoring System

All scores are calculated strictly per the SPA Scoring Rules Document:

| Section | Questions | Weight in AHS |
|---------|-----------|---------------|
| Concept Clarity | Q10, Q11, Q12 | 25% |
| Retention | Q13, Q14, Q15 | 20% |
| Focus | Q16, Q17, Q18 | 15% |
| Consistency | Q19, Q20, Q21 | 15% |
| Exam Readiness | Q22, Q23, Q24 | 15% |
| Self Testing | Q25, Q26, Q27 | 10% |

**Academic Health Score** = Weighted sum, rounded to nearest integer.

### Score Levels

| Score | Level | Color |
|-------|-------|-------|
| 85–100 | Excellent | 🟢 Green |
| 70–84 | Strong | 🟩 Light Green |
| 55–69 | Developing | 🟡 Yellow |
| 40–54 | Needs Improvement | 🟠 Orange |
| 0–39 | Critical Attention | 🔴 Red |

---

## 📄 Report Structure

The generated PDF contains 5 pages:

1. **Academic Overview** – AHS ring, radar chart, barriers, summary
2. **Learning Profile Analysis** – Learning styles, focus analysis, behaviour indicators
3. **Root Cause Analysis** – Performance drivers, barriers, performance cycle
4. **Performance Risk Assessment** – Risk gauge, risk matrix, early warning indicators
5. **Personalized Improvement Roadmap** – 4-week plan, daily framework, success indicators

---

## 🔧 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add all environment variables in the Vercel dashboard.

> **Note:** Puppeteer requires a Chromium binary. On Vercel, use `puppeteer-core` with `@sparticuz/chromium`:

```bash
npm install @sparticuz/chromium puppeteer-core
npm uninstall puppeteer
```

Then update `generate-pdf/route.ts`:
```typescript
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});
```

### Docker

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y chromium \
    fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
    libgdk-pixbuf2.0-0 libgtk-3-0 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils --no-install-recommends
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📧 Email Delivery Notes

- Reports are sent to the **admin email** for every submission
- Reports are also sent to the **student email** if provided
- PDF is attached directly to the email
- PDF is also stored in Supabase Storage (bucket: `reports`)

---

## 🛠️ Customization

- **Add/remove questions**: Edit `src/lib/questions.ts`
- **Change scoring rules**: Edit `src/lib/scoring.ts`
- **Change report design**: Edit `src/lib/report-template.ts`
- **Change branding/colors**: Edit `tailwind.config.js` and `globals.css`
