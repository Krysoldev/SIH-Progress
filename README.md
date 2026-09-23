# MASTER DEV
### AI-Powered Project Intelligence & Early-Warning Platform

> **"Darkness is the canvas. Silver is the signal."** — The **AURUM** Visual Design System

---

## Executive Overview

**MASTER DEV** is an infrastructure project monitoring and early-warning intelligence platform designed for large-scale capital infrastructure projects (highways, metros, high-speed rail, deepwater ports, bridges, and energy parks).

The platform consolidates fragmented project telemetry into an executive project-control room, delivering:
- **Planned vs Actual S-Curves** across physical completion and capital expenditure.
- **Earned Value Management (EVM)** metrics grounded in ANSI/EIA-748 standards (CPI, SPI, EAC, VAC, TCPI).
- **Automated Early-Warning Signals** across schedule velocity, cost drift, and milestone bottlenecks.
- **Grounded Root-Cause Attribution** explaining *why* a project is at risk with verifiable project telemetry.
- **Project Intelligence Copilot (AI)** for interactive queries with evidence citations and recommended next investigations.
- **GIS Asset Map** for spatial risk monitoring and corridor alignment tracking across India.
- **What-If Scenario Simulation Laboratory** for evaluating recovery levers, fast-track schedule compression, and commodity inflation shocks.
- **Executive Audit Reports** with one-click print and PDF generation.

---

## Visual Design Identity: AURUM

The entire platform is built with **AURUM**, a visual design system created specifically for high-stakes infrastructure control consoles:
- **Obsidian Canvas**: Deep layered darkness (`#050609` to `#2a3038`).
- **Silver Signal System**: Metallic platinum and silver reserved strictly for active signals, critical metrics, and key interactions (`#b8c0cc` to `#ffffff`).
- **Atmospheric Depth**: Dual slow-drifting radial ambient glows (top-right silver 22s drift, bottom-left steel 26s drift) and fixed SVG micro-noise grain overlay (`mix-blend-mode: overlay`, opacity: 0.035).
- **Material Language**: Upper-left light reflections, subtle metallic insets, and silver-tinted borders.
- **Typography**: Google Fonts `Fraunces Variable` (display serif, weight 300), `Calibri / Inter Tight` (UI/body), and `JetBrains Mono` (technical uppercase metadata).

---

## Platform Screens (12 Integrated Views)

| Screen | Description |
|---|---|
| **1. Login Console** | Full obsidian atmosphere, metallic highlight card, session management, and 1-click Quick Demo Sign-ins for all personas (*Project Director, Financial Controller, Site Supervisor, Lead Risk Analyst*). |
| **2. Project Overview** | Portfolio KPI cards, Highway Expansion flagship callout banner, Recharts S-curve, risk score distribution, and interactive Active Projects table with hover illumination. |
| **3. Projects Portfolio** | Searchable directory with table and grid card views, filtering by status (*CRITICAL, AT RISK, WATCH, ON TRACK*), sector, and search terms. |
| **4. Project Details** | Deep inspection on selected asset (Highway Expansion Package 4 ₹500 Cr / 78 Risk): top 5 KPI cards, dual physical and financial S-curves, EVM panel, stage-gate milestone tracker, and active signals. |
| **5. EVM & Analytics** | Portfolio EVM performance matrix (Cost Performance Index vs Schedule Performance Index), ANSI/EIA-748 benchmark guide, and Budget at Completion (BAC) vs Estimate at Completion (EAC) variance charts. |
| **6. Risk Analysis** | Dedicated Risk screen: composite 78/100 risk dial, component risk scores (Schedule: 82, Cost: 74, Progress: 81, Milestone: 68), and evidence-grounded *"WHY IS THIS PROJECT AT RISK?"* root cause attribution. |
| **7. Early Warnings** | Categorized signal feed (`SCHEDULE`, `COST`, `PROGRESS`, `MILESTONE`, `RISK`), severity badges, impact evaluations, interactive alert acknowledgment, and AI Copilot launch links. |
| **8. AI Project Copilot** | Context drawer showing live telemetry paired with natural language chat. Structured responses with **ANSWER**, **EVIDENCE**, **PROJECT DATA USED**, and **WHAT TO INVESTIGATE NEXT**. Supports grounded deterministic reasoning and optional Gemini API keys. |
| **9. GIS Asset Map** | Leaflet map with CartoDB Dark Matter styling. Geo-referenced markers across India with risk halos, interactive popups, and quick corridor cards. |
| **10. Executive Reports** | Executive Intelligence Briefing, Risk Audit, and Financial Audit generator with live structured document preview and functional **DOWNLOAD / PRINT REPORT** (`window.print()`). |
| **11. What-If Simulation** | Dynamic scenario laboratory with interactive sliders: Progress Rate Adjustment (-20% to +30%), Monthly Expenditure Velocity (-25% to +50%), Critical-Path Fast Track Buffer (0 to 6 months), and Commodity Price Inflation (0% to 15%). Computes real-time Projected Cost, Completion Month, and New Risk Score. |
| **12. Settings & Roles** | Role Switcher (*Project Director, Financial Controller, Site Supervisor, Risk Analyst*), database status monitor, synthetic data reset button, and AI Copilot configuration. |

---

## Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Centralized Aurum Design Tokens (`src/styles/aurum.css`)
- **Typography**: Google Fonts (Fraunces, Inter Tight, JetBrains Mono) + Calibri
- **Charts**: Recharts with custom Aurum theme
- **GIS Maps**: Leaflet + React-Leaflet with CartoDB Dark Matter tiles
- **Database & Auth**:
  - Live Supabase integration layer (`@supabase/supabase-js`)
  - Out-of-the-box offline synthetic intelligence engine with persistent `localStorage` mutations
- **AI Copilot**:
  - Grounded Deterministic Intelligence Engine
  - Optional Google Gemini API integration (`gemini-1.5-flash`)
- **Icons**: Lucide React

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

### 4. Optional Supabase Configuration
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*Note: If no Supabase credentials are provided, Master Dev runs seamlessly in offline synthetic intelligence mode.*

---

## License

Private & Confidential • Master Dev Platform Architecture • Built for Smart India Hackathon (SIH).
