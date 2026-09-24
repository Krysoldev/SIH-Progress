/**
 * Master Dev - Infrastructure Intelligence & Early-Warning Platform
 * Shared Data & Application Controller
 */

// 1. Projects Data Store
const PROJECTS_DATA = [
  {
    id: 'proj-highway-exp-01',
    code: 'INFRA-HWY-001',
    name: 'Highway Expansion Package 4',
    location: 'Ahmedabad – Vadodara Corridor, Gujarat',
    state: 'Gujarat',
    lat: 22.3094,
    lng: 72.1362,
    plannedCost: 500,
    currentExpenditure: 340,
    physicalProgress: 55,
    plannedDuration: 36,
    elapsedDuration: 30,
    status: 'AT RISK',
    riskScore: 78,
    category: 'Highways & Expressways',
    contractor: 'Larsen & Infra Consortium',
    manager: 'Rajesh Nair, Project Director',
    description: 'Six-laning of high-density logistics corridor including 3 major river bridges and automated toll plazas.',
    evm: { pv: 415, ev: 275, ac: 340, cv: -65, sv: -140, cpi: 0.81, spi: 0.66, eac: 617, vac: -117 },
    prediction: { predictedCostOverrun: 85.5, predictedTimeOverrun: 5.2, confidenceScore: 0.89 },
    trajectory: [
      { month: 0, planned: 0, actual: 0 },
      { month: 6, planned: 15, actual: 16 },
      { month: 12, planned: 32, actual: 30 },
      { month: 18, planned: 50, actual: 44 },
      { month: 24, planned: 68, actual: 51 },
      { month: 30, planned: 83, actual: 55 }
    ],
    milestones: [
      { name: 'Stage-Gate Clearances & Land Acquisition', status: 'COMPLETED', date: 'Month 6', delay: 0 },
      { name: 'Earthworks & Embankment Completion', status: 'COMPLETED', date: 'Month 14', delay: 1 },
      { name: 'Major River Bridge Foundation Piling', status: 'DELAYED', date: 'Month 22', delay: 4 },
      { name: 'Flexible Pavement Bituminous Layers', status: 'IN_PROGRESS', date: 'Month 32', delay: 3 },
      { name: 'Toll Management & Smart Telemetry Signoff', status: 'PLANNED', date: 'Month 36', delay: 0 }
    ],
    alerts: [
      { id: 'alt-1', type: 'SCHEDULE', severity: 'CRITICAL', text: 'Schedule drag of 4 months on River Bridge pier foundations.' },
      { id: 'alt-2', type: 'COST', severity: 'HIGH', text: 'Cost Performance Index (CPI) has degraded to 0.81.' }
    ]
  },
  {
    id: 'proj-metro-blr-02',
    code: 'INFRA-MTR-002',
    name: 'Bengaluru Metro Phase 2B Airport Link',
    location: 'KR Puram – Kempegowda Airport, Karnataka',
    state: 'Karnataka',
    lat: 13.0827,
    lng: 77.6256,
    plannedCost: 820,
    currentExpenditure: 615,
    physicalProgress: 68,
    plannedDuration: 42,
    elapsedDuration: 34,
    status: 'WATCH',
    riskScore: 54,
    category: 'Rail Transit & Metros',
    contractor: 'NCC – BMRCL Joint Venture',
    manager: 'Er. Sandeep Patil, Executive Engineer',
    description: '37 km elevated metro line connecting eastern IT hub to international airport with 17 stations.',
    evm: { pv: 664, ev: 558, ac: 615, cv: -57, sv: -106, cpi: 0.91, spi: 0.84, eac: 901, vac: -81 },
    prediction: { predictedCostOverrun: 42.0, predictedTimeOverrun: 2.8, confidenceScore: 0.92 },
    trajectory: [
      { month: 0, planned: 0, actual: 0 },
      { month: 10, planned: 24, actual: 22 },
      { month: 20, planned: 48, actual: 45 },
      { month: 30, planned: 72, actual: 64 },
      { month: 34, planned: 81, actual: 68 }
    ],
    milestones: [
      { name: 'Utility Shifting & Viaduct Piling', status: 'COMPLETED', date: 'Month 12', delay: 0 },
      { name: 'Pre-cast U-Girder Erection', status: 'IN_PROGRESS', date: 'Month 28', delay: 2 },
      { name: 'Station Structural Framework', status: 'IN_PROGRESS', date: 'Month 36', delay: 1 }
    ],
    alerts: [
      { id: 'alt-3', type: 'PROGRESS', severity: 'MEDIUM', text: 'Night-time traffic corridor permission delays viaduct lifting.' }
    ]
  },
  {
    id: 'proj-port-vizag-03',
    code: 'INFRA-PRT-003',
    name: 'Visakhapatnam Deepwater Container Terminal',
    location: 'Outer Harbour, Visakhapatnam, Andhra Pradesh',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    plannedCost: 650,
    currentExpenditure: 280,
    physicalProgress: 42,
    plannedDuration: 30,
    elapsedDuration: 14,
    status: 'ON TRACK',
    riskScore: 24,
    category: 'Ports & Maritime',
    contractor: 'Adani Ports & SEZ EPC',
    manager: 'Capt. Ramesh Babu, Harbour Master',
    description: 'Extension of deep-draft container terminal to handle 1.5 million TEUs annually.',
    evm: { pv: 300, ev: 273, ac: 280, cv: -7, sv: -27, cpi: 0.98, spi: 0.91, eac: 663, vac: -13 },
    prediction: { predictedCostOverrun: 8.0, predictedTimeOverrun: 0.6, confidenceScore: 0.94 },
    trajectory: [
      { month: 0, planned: 0, actual: 0 },
      { month: 6, planned: 20, actual: 19 },
      { month: 12, planned: 38, actual: 36 },
      { month: 14, planned: 46, actual: 42 }
    ],
    milestones: [
      { name: 'Capital Dredging to -18m CD', status: 'COMPLETED', date: 'Month 8', delay: 0 },
      { name: 'Quay Wall Diaphragm Construction', status: 'IN_PROGRESS', date: 'Month 18', delay: 0 }
    ],
    alerts: []
  },
  {
    id: 'proj-rail-dfc-04',
    code: 'INFRA-DFC-004',
    name: 'Western Dedicated Freight Corridor (Rewari-Palanpur)',
    location: 'Rajasthan – Gujarat Border Alignment',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    plannedCost: 1200,
    currentExpenditure: 1140,
    physicalProgress: 76,
    plannedDuration: 48,
    elapsedDuration: 44,
    status: 'CRITICAL',
    riskScore: 86,
    category: 'Rail Transit & Metros',
    contractor: 'Tata Projects – Sojitz Consortium',
    manager: 'Er. Alok Sharma, Chief Engineer',
    description: 'High-axle-load dual electric freight rail corridor linking northern industrial hinterland to western ports.',
    evm: { pv: 1100, ev: 912, ac: 1140, cv: -228, sv: -188, cpi: 0.80, spi: 0.83, eac: 1500, vac: -300 },
    prediction: { predictedCostOverrun: 175.0, predictedTimeOverrun: 6.5, confidenceScore: 0.88 },
    trajectory: [
      { month: 0, planned: 0, actual: 0 },
      { month: 12, planned: 25, actual: 23 },
      { month: 24, planned: 52, actual: 46 },
      { month: 36, planned: 78, actual: 65 },
      { month: 44, planned: 92, actual: 76 }
    ],
    milestones: [
      { name: 'Track Laying Machine Deployment', status: 'COMPLETED', date: 'Month 24', delay: 2 },
      { name: '2x25kV Overhead Electrification', status: 'DELAYED', date: 'Month 40', delay: 5 }
    ],
    alerts: [
      { id: 'alt-4', type: 'SCHEDULE', severity: 'CRITICAL', text: 'Substation transformer procurement delay exceeds 5 months.' },
      { id: 'alt-5', type: 'COST', severity: 'CRITICAL', text: 'Cost variance has breached ₹228 Cr deficit.' }
    ]
  },
  {
    id: 'proj-solar-bhadla-05',
    code: 'INFRA-SLR-005',
    name: 'Bhadla Ultra Mega Solar Park Phase III',
    location: 'Phalodi District, Thar Desert, Rajasthan',
    state: 'Rajasthan',
    lat: 27.5387,
    lng: 71.9174,
    plannedCost: 350,
    currentExpenditure: 310,
    physicalProgress: 94,
    plannedDuration: 18,
    elapsedDuration: 17,
    status: 'ON TRACK',
    riskScore: 16,
    category: 'Energy Infrastructure',
    contractor: 'Sterling and Wilson Renewable Energy',
    manager: 'Sunita Meena, Director Solar',
    description: '500 MW grid-connected solar PV array with single-axis tracking systems and 220kV pooling station.',
    evm: { pv: 335, ev: 329, ac: 310, cv: 19, sv: -6, cpi: 1.06, spi: 0.98, eac: 330, vac: 20 },
    prediction: { predictedCostOverrun: 0, predictedTimeOverrun: 0.2, confidenceScore: 0.97 },
    trajectory: [
      { month: 0, planned: 0, actual: 0 },
      { month: 6, planned: 35, actual: 38 },
      { month: 12, planned: 70, actual: 72 },
      { month: 17, planned: 94, actual: 94 }
    ],
    milestones: [
      { name: 'PV Module Mounting Structure Complete', status: 'COMPLETED', date: 'Month 12', delay: 0 },
      { name: 'Inverter Pooling Substation Charge', status: 'COMPLETED', date: 'Month 15', delay: 0 },
      { name: 'Grid Synchronization Final Clearance', status: 'IN_PROGRESS', date: 'Month 18', delay: 0 }
    ],
    alerts: []
  },
  {
    id: 'proj-bridge-chenab-06',
    code: 'INFRA-BRG-006',
    name: 'Chenab River Rail Arch Bridge Package',
    location: 'Reasi District, Jammu & Kashmir',
    state: 'Jammu & Kashmir',
    lat: 33.1528,
    lng: 74.8828,
    plannedCost: 480,
    currentExpenditure: 390,
    physicalProgress: 82,
    plannedDuration: 36,
    elapsedDuration: 32,
    status: 'WATCH',
    riskScore: 48,
    category: 'Bridges & Tunnels',
    contractor: 'Afcons Infrastructure',
    manager: 'Er. Devendra Gupta, Chief Bridge Engineer',
    description: 'World highest railway arch bridge spanning 359 meters above river bed on Udhampur-Srinagar-Baramulla link.',
    evm: { pv: 426, ev: 393, ac: 390, cv: 3, sv: -33, cpi: 1.01, spi: 0.92, eac: 475, vac: 5 },
    prediction: { predictedCostOverrun: 12.0, predictedTimeOverrun: 1.5, confidenceScore: 0.91 },
    trajectory: [
      { month: 0, planned: 0, actual: 0 },
      { month: 10, planned: 28, actual: 26 },
      { month: 20, planned: 56, actual: 52 },
      { month: 30, planned: 80, actual: 78 },
      { month: 32, planned: 89, actual: 82 }
    ],
    milestones: [
      { name: 'Main Steel Arch Closure Joint', status: 'COMPLETED', date: 'Month 24', delay: 0 },
      { name: 'Deck Truss Launching', status: 'COMPLETED', date: 'Month 30', delay: 1 },
      { name: 'Wind Sensor & Blast Protection System', status: 'IN_PROGRESS', date: 'Month 34', delay: 1 }
    ],
    alerts: [
      { id: 'alt-6', type: 'SCHEDULE', severity: 'MEDIUM', text: 'Wind sensor calibration delayed by extreme weather.' }
    ]
  }
];

// 2. Active Officers / IAM Store
const OFFICERS_DATA = [
  { id: 'usr-1', name: 'Rajesh Nair', email: 'rajesh.nair@masterdev.infra', role: 'Project Director', dept: 'National Infrastructure Taskforce' },
  { id: 'usr-2', name: 'Priya Sharma', email: 'priya.sharma@masterdev.infra', role: 'Financial Controller', dept: 'Capital Expenditure & EVM' },
  { id: 'usr-3', name: 'Vikram Singh', email: 'vikram.singh@masterdev.infra', role: 'Resident Engineer', dept: 'Western Corridor Site Division' },
  { id: 'usr-4', name: 'Dr. Arjun Mehta', email: 'arjun.mehta@masterdev.infra', role: 'AI Risk Analyst', dept: 'Early-Warning Analytics' }
];

// 3. Navigation Sidebar Builder
function renderSidebar(activeScreen) {
  const sidebar = document.getElementById('appSidebar');
  if (!sidebar) return;

  const navItems = [
    { id: 'overview', href: 'index.html', icon: '📊', label: 'Overview' },
    { id: 'projects', href: 'projects.html', icon: '📁', label: 'Projects Portfolio' },
    { id: 'details', href: 'project-detail.html', icon: '🔍', label: 'Project Details' },
    { id: 'analytics', href: 'analytics.html', icon: '📈', label: 'EVM Analytics' },
    { id: 'risk', href: 'risk.html', icon: '⚠️', label: 'Risk Analysis' },
    { id: 'alerts', href: 'alerts.html', icon: '🔔', label: 'Early Warnings' },
    { id: 'copilot', href: 'copilot.html', icon: '✨', label: 'AI Copilot' },
    { id: 'map', href: 'map.html', icon: '🗺️', label: 'GIS Asset Map' },
    { id: 'reports', href: 'reports.html', icon: '📑', label: 'Executive Reports' },
    { id: 'simulation', href: 'simulation.html', icon: '🎛️', label: 'What-If Simulation' },
    { id: 'admin', href: 'admin.html', icon: '🛡️', label: 'Admin Console' },
    { id: 'settings', href: 'settings.html', icon: '⚙️', label: 'Settings' }
  ];

  let navHtml = `
    <div class="brand-section">
      <div class="brand-logo">
        <div class="brand-logo-inner"></div>
      </div>
      <div>
        <div class="brand-title">MASTER <i>DEV</i></div>
        <div class="brand-badge">Infra Intelligence</div>
      </div>
    </div>
    <div class="nav-menu">
      <div class="nav-label">Core Platform</div>
  `;

  navItems.forEach(item => {
    const isActive = item.id === activeScreen ? 'active' : '';
    navHtml += `
      <a href="${item.href}" class="nav-item ${isActive}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `;
  });

  navHtml += `
    </div>
    <div class="sidebar-footer">
      <div class="user-snippet">
        <div class="avatar">RN</div>
        <div style="flex: 1; overflow: hidden;">
          <div class="user-name">Rajesh Nair</div>
          <div class="user-role">Project Director</div>
        </div>
        <a href="login.html" title="Sign Out" style="color: var(--text-faint); font-size: 1rem;">🚪</a>
      </div>
    </div>
  `;

  sidebar.innerHTML = navHtml;
}

// 4. Modal Helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// 5. Toast Notifications
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#064e3b' : type === 'error' ? '#7f1d1d' : '#1e293b';
  const border = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#64748b';
  toast.style.cssText = `background: ${bg}; border: 1px solid ${border}; color: #f8fafc; padding: 12px 18px; border-radius: 8px; font-size: 0.8rem; font-family: var(--font-mono); box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: modalIn 0.2s ease;`;
  toast.textContent = message;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// 6. S-Curve Canvas Chart
function drawSCurve(canvasId, trajectory) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth;
  const height = canvas.height = canvas.parentElement.clientHeight || 260;

  ctx.clearRect(0, 0, width, height);

  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Grid lines
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
  ctx.lineWidth = 1;
  ctx.font = '10px JetBrains Mono';
  ctx.fillStyle = '#64748b';

  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartH / 5) * i;
    const val = 100 - i * 20;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(`${val}%`, 10, y + 3);
  }

  const maxMonth = trajectory[trajectory.length - 1].month || 36;

  // Draw Planned Path (Silver dashed)
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  trajectory.forEach((pt, idx) => {
    const x = padding.left + (pt.month / maxMonth) * chartW;
    const y = padding.top + chartH - (pt.planned / 100) * chartH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw Actual Path (Solid Emerald / Bright Silver)
  ctx.setLineDash([]);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  trajectory.forEach((pt, idx) => {
    const x = padding.left + (pt.month / maxMonth) * chartW;
    const y = padding.top + chartH - (pt.actual / 100) * chartH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw Data Points
  trajectory.forEach(pt => {
    const x = padding.left + (pt.month / maxMonth) * chartW;
    const y = padding.top + chartH - (pt.actual / 100) * chartH;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Month label
    ctx.fillStyle = '#64748b';
    ctx.fillText(`M${pt.month}`, x - 8, height - 12);
  });
}

// 7. Risk Distribution Canvas Bar Chart
function drawRiskDistribution(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth;
  const height = canvas.height = canvas.parentElement.clientHeight || 200;

  ctx.clearRect(0, 0, width, height);

  const categories = [
    { label: 'Low (<40)', count: PROJECTS_DATA.filter(p => p.riskScore < 40).length, color: '#10b981' },
    { label: 'Watch (40-64)', count: PROJECTS_DATA.filter(p => p.riskScore >= 40 && p.riskScore < 65).length, color: '#eab308' },
    { label: 'At Risk (65-79)', count: PROJECTS_DATA.filter(p => p.riskScore >= 65 && p.riskScore < 80).length, color: '#f97316' },
    { label: 'Critical (≥80)', count: PROJECTS_DATA.filter(p => p.riskScore >= 80).length, color: '#ef4444' }
  ];

  const maxCount = 4;
  const padding = { top: 20, right: 20, bottom: 35, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = chartW / categories.length - 20;

  categories.forEach((cat, idx) => {
    const x = padding.left + idx * (chartW / categories.length) + 10;
    const barH = (cat.count / maxCount) * chartH;
    const y = padding.top + chartH - barH;

    // Bar
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Count text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillText(`${cat.count}`, x + barWidth / 2 - 4, y - 5);

    // Label
    ctx.fillStyle = '#8e9bb0';
    ctx.font = '9px JetBrains Mono';
    ctx.fillText(cat.label, x - 2, height - 12);
  });
}

// 8. Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('appSidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
});
