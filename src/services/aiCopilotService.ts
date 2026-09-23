import { Project } from '../types/project';

export interface CopilotResponse {
  answer: string;
  evidence: string[];
  projectDataUsed: {
    label: string;
    value: string;
  }[];
  nextInvestigation: string;
  source: 'DETERMINISTIC_ENGINE' | 'GEMINI_LIVE_API';
}

export class AICopilotService {
  static async query(
    userPrompt: string,
    activeProject: Project,
    allProjects: Project[] = []
  ): Promise<CopilotResponse> {
    const geminiKey = localStorage.getItem('aurum_gemini_api_key');

    // If Gemini key is set, try calling Gemini API with strict structured prompt
    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const liveResponse = await this.callGeminiAPI(geminiKey, userPrompt, activeProject);
        if (liveResponse) {
          return liveResponse;
        }
      } catch (err) {
        console.warn('Live Gemini API call failed or timed out, utilizing deterministic engine:', err);
      }
    }

    // Default: Grounded Deterministic Intelligence Engine
    return this.evaluateDeterministic(userPrompt, activeProject, allProjects);
  }

  private static evaluateDeterministic(
    prompt: string,
    p: Project,
    allProjects: Project[]
  ): CopilotResponse {
    const q = prompt.toLowerCase();

    // 1. Why is this project at risk / root causes
    if (q.includes('risk') || q.includes('why') || q.includes('problem') || q.includes('critical')) {
      const topDelayed = p.milestones.filter(m => m.status === 'DELAYED');
      const delayedDesc = topDelayed.length > 0
        ? topDelayed.map(m => `"${m.name}" (+${m.delayMonths} mos delay)`).join(', ')
        : 'None directly marked';

      return {
        answer: `The project "${p.name}" is currently categorized as ${p.status} primarily because physical progress (${p.physicalProgress}%) has fallen substantially behind the contractual baseline, while ${Math.round((p.elapsedDuration / p.plannedDuration) * 100)}% of the planned duration has already elapsed. Furthermore, capital expenditure (₹${p.currentExpenditure} Cr) is significantly elevated relative to completed physical assets, yielding an unfavorable Cost Performance Index (CPI) of ${p.evm.cpi}.`,
        evidence: [
          `Physical progress is ${p.physicalProgress}% against planned S-curve target of ~${Math.round((p.elapsedDuration / p.plannedDuration) * 100)}% for Month ${p.elapsedDuration}.`,
          `Elapsed duration is ${p.elapsedDuration} of ${p.plannedDuration} total months (only ${p.plannedDuration - p.elapsedDuration} months remaining for ${100 - p.physicalProgress}% remaining scope).`,
          `Cost burn rate efficiency (CPI) is ${p.evm.cpi} (< 1.0 indicates cost overrun velocity).`,
          `Schedule Performance Index (SPI) is ${p.evm.spi} (< 1.0 indicates schedule drag).`,
          `Critical Path Milestone bottleneck: ${delayedDesc}.`,
        ],
        projectDataUsed: [
          { label: 'Project Name', value: p.name },
          { label: 'Current Expenditure', value: `₹${p.currentExpenditure} Cr / ₹${p.plannedCost} Cr` },
          { label: 'Physical Progress', value: `${p.physicalProgress}%` },
          { label: 'Elapsed Duration', value: `${p.elapsedDuration} / ${p.plannedDuration} Months` },
          { label: 'Calculated Risk Score', value: `${p.riskScore} / 100 (${p.riskBreakdown.riskLevel})` },
          { label: 'CPI / SPI', value: `${p.evm.cpi} / ${p.evm.spi}` },
        ],
        nextInvestigation: 'Conduct an urgent technical review of the Pier Foundation geotechnical work packages and evaluate parallel mobilization of second paving spread to recoup 3 months of float.',
        source: 'DETERMINISTIC_ENGINE',
      };
    }

    // 2. Cost / Expenditure / Overrun query
    if (q.includes('cost') || q.includes('expenditure') || q.includes('overrun') || q.includes('budget') || q.includes('money')) {
      return {
        answer: `Analysis of financial burn indicates a projected Cost Overrun of ₹${p.prediction.predictedCostOverrun} Cr (Estimate at Completion: ₹${p.evm.eac.toFixed(1)} Cr vs Budget at Completion: ₹${p.plannedCost} Cr). The project has expended ₹${p.currentExpenditure} Cr (${Math.round((p.currentExpenditure / p.plannedCost) * 100)}% of total budget) while achieving only ${p.physicalProgress}% of physical milestones.`,
        evidence: [
          `Current Cost Variance (CV = EV - AC) is -₹${Math.abs(p.evm.cv).toFixed(1)} Cr.`,
          `Cost Performance Index (CPI) is ${p.evm.cpi}, meaning every ₹1.00 spent produces only ₹${p.evm.cpi} worth of completed physical infrastructure.`,
          `The To-Complete Performance Index (TCPI) required to finish within the original budget is ${p.evm.tcpi}, which is considered unachievable without scope or budget recalibration.`,
        ],
        projectDataUsed: [
          { label: 'Planned Budget (BAC)', value: `₹${p.plannedCost} Cr` },
          { label: 'Actual Cost (AC)', value: `₹${p.currentExpenditure} Cr` },
          { label: 'Earned Value (EV)', value: `₹${p.evm.ev} Cr` },
          { label: 'Projected EAC', value: `₹${p.evm.eac.toFixed(1)} Cr` },
          { label: 'Variance at Completion (VAC)', value: `-₹${Math.abs(p.evm.vac).toFixed(1)} Cr` },
        ],
        nextInvestigation: 'Audit subcontractor geotechnical claim variations and freeze non-essential administrative allocations until pavement rate analysis is reconciled.',
        source: 'DETERMINISTIC_ENGINE',
      };
    }

    // 3. Schedule / Delay / Milestone query
    if (q.includes('schedule') || q.includes('delay') || q.includes('time') || q.includes('milestone') || q.includes('when')) {
      return {
        answer: `The predictive model forecasts a schedule slippage of +${p.prediction.predictedTimeOverrun} months past the contractual completion deadline of Month ${p.plannedDuration}. The primary critical-path inhibitor is ${p.milestones.find(m => m.criticalPath && m.status === 'DELAYED')?.name || 'civil engineering constraints'}.`,
        evidence: [
          `Schedule Variance (SV = EV - PV) is -₹${Math.abs(p.evm.sv).toFixed(1)} Cr.`,
          `Schedule Performance Index (SPI) is ${p.evm.spi}, confirming progress velocity is lagging behind schedule by ~${Math.round((1 - p.evm.spi) * 100)}%.`,
          `Critical milestones delayed: ${p.milestones.filter(m => m.status === 'DELAYED').length} active milestone(s) flagged on critical chain.`,
        ],
        projectDataUsed: [
          { label: 'Planned Duration', value: `${p.plannedDuration} Months` },
          { label: 'Elapsed Duration', value: `${p.elapsedDuration} Months` },
          { label: 'Forecast Delay', value: `+${p.prediction.predictedTimeOverrun} Months` },
          { label: 'Predicted Completion', value: `Month ${Math.round(p.plannedDuration + p.prediction.predictedTimeOverrun)}` },
        ],
        nextInvestigation: 'Review float buffer on non-critical civil milestones and apply for night-work execution permits to increase available operational hours.',
        source: 'DETERMINISTIC_ENGINE',
      };
    }

    // 4. Portfolio / Comparison query
    if (q.includes('portfolio') || q.includes('compare') || q.includes('all') || q.includes('other')) {
      const atRiskCount = allProjects.filter(item => item.status === 'AT RISK' || item.status === 'CRITICAL').length;
      return {
        answer: `Across the monitored infrastructure portfolio (${allProjects.length} total capital projects), ${atRiskCount} projects are currently flagged for high attention. "${p.name}" represents the highest exposure in the Roads & Highways segment with an overall risk score of ${p.riskScore}/100.`,
        evidence: [
          `Portfolio-wide average progress is ${Math.round(allProjects.reduce((a, b) => a + b.physicalProgress, 0) / (allProjects.length || 1))}%.`,
          `Total portfolio committed capital is ₹${allProjects.reduce((a, b) => a + b.plannedCost, 0)} Cr with current expenditure of ₹${allProjects.reduce((a, b) => a + b.currentExpenditure, 0)} Cr.`,
          `High-risk cohort includes: ${allProjects.filter(item => item.riskScore > 60).map(item => item.name).join(', ')}.`,
        ],
        projectDataUsed: [
          { label: 'Portfolio Projects', value: `${allProjects.length} Assets` },
          { label: 'At-Risk Volume', value: `${atRiskCount} Projects` },
          { label: 'Active Project Rank', value: `#${allProjects.slice().sort((a,b) => b.riskScore - a.riskScore).findIndex(x => x.id === p.id) + 1} by Risk` },
        ],
        nextInvestigation: 'Filter the GIS map by "AT RISK" status and generate the Consolidated Executive Risk Briefing from the Reports tab.',
        source: 'DETERMINISTIC_ENGINE',
      };
    }

    // Default structured answer
    return {
      answer: `Summary for ${p.name}: The project is under active monitoring with a risk score of ${p.riskScore}/100 (${p.status}). Physical progress is currently ${p.physicalProgress}% against an expenditure of ₹${p.currentExpenditure} Cr. The AI early-warning system has flagged ${p.alerts.length} active alerts requiring executive attention.`,
      evidence: p.riskBreakdown.rootCauses.slice(0, 3),
      projectDataUsed: [
        { label: 'Project Name', value: p.name },
        { label: 'Status / Risk', value: `${p.status} (${p.riskScore}/100)` },
        { label: 'Progress / Cost', value: `${p.physicalProgress}% | ₹${p.currentExpenditure} Cr` },
      ],
      nextInvestigation: 'Inspect the Milestone Tracker and S-Curve trajectory in Project Details for detailed stage-gate milestones.',
      source: 'DETERMINISTIC_ENGINE',
    };
  }

  private static async callGeminiAPI(
    apiKey: string,
    prompt: string,
    p: Project
  ): Promise<CopilotResponse | null> {
    const systemPrompt = `You are the MASTER DEV Project Intelligence Copilot for large infrastructure projects.
Analyze the following project telemetry and respond strictly in valid JSON format:
Project: ${p.name} (${p.code})
Location: ${p.location}
Status: ${p.status}
Risk Score: ${p.riskScore} / 100
Planned Cost: ₹${p.plannedCost} Cr
Actual Expenditure: ₹${p.currentExpenditure} Cr
Physical Progress: ${p.physicalProgress}%
Planned Duration: ${p.plannedDuration} months
Elapsed Duration: ${p.elapsedDuration} months
CPI: ${p.evm.cpi}
SPI: ${p.evm.spi}
Predicted Cost Overrun: ₹${p.prediction.predictedCostOverrun} Cr
Predicted Delay: +${p.prediction.predictedTimeOverrun} months
Delayed Milestones: ${p.milestones.filter(m => m.status === 'DELAYED').map(m => m.name).join(', ')}

Return JSON with this exact schema:
{
  "answer": "Clear, executive-grade analysis answering the user query",
  "evidence": ["Evidence point 1 with data", "Evidence point 2 with data"],
  "projectDataUsed": [{"label": "Metric", "value": "Value"}],
  "nextInvestigation": "Recommended next engineering/management investigation"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }] },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const json = await response.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return {
        answer: parsed.answer || 'Analysis complete.',
        evidence: parsed.evidence || [],
        projectDataUsed: parsed.projectDataUsed || [],
        nextInvestigation: parsed.nextInvestigation || 'Inspect project trajectory.',
        source: 'GEMINI_LIVE_API',
      };
    }
    return null;
  }
}
