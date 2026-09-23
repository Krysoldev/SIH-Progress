import { Project, RiskLevel } from '../types/project';

export interface SimulationParameters {
  progressRateAdjustment: number; // percentage (-20 to +30)
  expenditureRateAdjustment: number; // percentage (-25 to +50)
  scheduleRecoveryBuffer: number; // months (0 to 6)
  materialInflationFactor: number; // percentage (0 to 15)
}

export interface SimulationOutcome {
  baselineCost: number; // ₹ Cr
  simulatedCost: number; // ₹ Cr
  costDelta: number; // ₹ Cr

  baselineCompletionMonth: number;
  simulatedCompletionMonth: number;
  scheduleDeltaMonths: number;

  baselineRiskScore: number;
  simulatedRiskScore: number;
  riskScoreDelta: number;
  newRiskLevel: RiskLevel;

  simulatedCpi: number;
  simulatedSpi: number;

  assumptions: string[];
}

export class SimulationEngine {
  static runSimulation(project: Project, params: SimulationParameters): SimulationOutcome {
    const remainingWork = Math.max(0, 100 - project.physicalProgress);
    const remainingTimeBaseline = Math.max(1, project.plannedDuration - project.elapsedDuration);

    // Speed up or slow down remaining progress
    const progressFactor = 1 + (params.progressRateAdjustment / 100);
    const effectiveRemainingTime = Math.max(
      1,
      (remainingTimeBaseline / Math.max(0.2, progressFactor)) - params.scheduleRecoveryBuffer
    );

    const simulatedCompletionMonth = Number(
      (project.elapsedDuration + effectiveRemainingTime).toFixed(1)
    );
    const baselineCompletionMonth = project.plannedDuration + project.prediction.predictedTimeOverrun;
    const scheduleDeltaMonths = Number(
      (simulatedCompletionMonth - baselineCompletionMonth).toFixed(1)
    );

    // Cost recalculation
    const monthlyBurn = project.currentExpenditure / Math.max(1, project.elapsedDuration);
    const costFactor = 1 + (params.expenditureRateAdjustment / 100);
    const inflationFactor = 1 + (params.materialInflationFactor / 100);

    const projectedRemainingSpend = effectiveRemainingTime * monthlyBurn * costFactor * inflationFactor;
    const simulatedCost = Number((project.currentExpenditure + projectedRemainingSpend).toFixed(1));
    const baselineCost = Number((project.plannedCost + project.prediction.predictedCostOverrun).toFixed(1));
    const costDelta = Number((simulatedCost - baselineCost).toFixed(1));

    // Dynamic Risk Score calculation
    let calculatedRisk = project.riskScore;

    // Progress improvement lowers risk
    calculatedRisk -= params.progressRateAdjustment * 0.6;

    // Expenditure increase increases risk
    calculatedRisk += params.expenditureRateAdjustment * 0.4;

    // Schedule buffer recovery decreases risk
    calculatedRisk -= params.scheduleRecoveryBuffer * 4.5;

    // Material inflation adds risk
    calculatedRisk += params.materialInflationFactor * 1.2;

    const simulatedRiskScore = Math.max(5, Math.min(98, Math.round(calculatedRisk)));
    const riskScoreDelta = simulatedRiskScore - project.riskScore;

    let newRiskLevel: RiskLevel = 'MEDIUM';
    if (simulatedRiskScore < 30) newRiskLevel = 'LOW';
    else if (simulatedRiskScore < 60) newRiskLevel = 'MEDIUM';
    else if (simulatedRiskScore < 80) newRiskLevel = 'HIGH';
    else newRiskLevel = 'CRITICAL';

    const simulatedCpi = Number(
      (project.plannedCost * (project.physicalProgress / 100) / (simulatedCost * 0.6)).toFixed(2)
    );
    const simulatedSpi = Number(
      (1 / Math.max(0.5, (simulatedCompletionMonth / project.plannedDuration))).toFixed(2)
    );

    const assumptions = [
      `Assumes physical construction productivity varies by ${params.progressRateAdjustment >= 0 ? '+' : ''}${params.progressRateAdjustment}% on remaining works.`,
      `Monthly financial burn rate adjusted by ${params.expenditureRateAdjustment >= 0 ? '+' : ''}${params.expenditureRateAdjustment}% relative to historical velocity.`,
      params.scheduleRecoveryBuffer > 0
        ? `Applies ${params.scheduleRecoveryBuffer} months of accelerated critical-path compression (parallel shifts / precast execution).`
        : 'Zero additional fast-track acceleration schedule adjustments applied.',
      params.materialInflationFactor > 0
        ? `Factors in ${params.materialInflationFactor}% commodity price escalation across structural steel and bitumen.`
        : 'Baseline commodity pricing maintained without inflation shock.',
    ];

    return {
      baselineCost,
      simulatedCost,
      costDelta,
      baselineCompletionMonth,
      simulatedCompletionMonth,
      scheduleDeltaMonths,
      baselineRiskScore: project.riskScore,
      simulatedRiskScore,
      riskScoreDelta,
      newRiskLevel,
      simulatedCpi,
      simulatedSpi,
      assumptions,
    };
  }
}
