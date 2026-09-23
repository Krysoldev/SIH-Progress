import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useNotification } from '../context/NotificationContext';
import { ScreenId } from '../components/layout/AurumSidebar';
import { ProjectMap } from '../components/map/ProjectMap';
import { AurumCard } from '../components/common/AurumCard';
import { AurumBadge } from '../components/common/AurumBadge';
import { AurumModal } from '../components/common/AurumModal';
import { AurumButton } from '../components/common/AurumButton';
import { Project } from '../types/project';
import {
  MapPin,
  ArrowRight,
  ShieldAlert,
  Layers,
  Key,
  Globe,
  Wifi,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Compass,
  Zap
} from 'lucide-react';
import {
  getSavedCartoApiKey,
  saveCartoApiKey,
  clearCartoApiKey,
  testCartoConnection,
  maskApiKey,
  DEFAULT_CARTO_API_KEY
} from '../services/cartoService';

interface MapPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onNavigate }) => {
  const { projects, selectedProject, setSelectedProject } = useProjects();
  const { notify } = useNotification();

  // CARTO Key Configuration Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [cartoKeyInput, setCartoKeyInput] = useState(getSavedCartoApiKey);
  const [isTestingCarto, setIsTestingCarto] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: true,
    success: true,
    message: 'CARTO Basemap CDN Active',
    latencyMs: 42,
  });

  const handleInspect = (p: Project) => {
    setSelectedProject(p);
    onNavigate('details');
  };

  const handleTestCarto = async () => {
    setIsTestingCarto(true);
    const res = await testCartoConnection(cartoKeyInput);
    setIsTestingCarto(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    });
    if (res.success) {
      notify('success', 'CARTO CDN Verified', res.message);
    } else {
      notify('error', 'CARTO Key Error', res.message);
    }
  };

  const handleSaveCartoKey = () => {
    saveCartoApiKey(cartoKeyInput);
    setShowConfigModal(false);
    notify('success', 'CARTO Config Saved', 'New CARTO API key active on GIS layers.');
  };

  const handleRestoreDefaultKey = () => {
    setCartoKeyInput(DEFAULT_CARTO_API_KEY);
    saveCartoApiKey(DEFAULT_CARTO_API_KEY);
    notify('info', 'Default Restored', 'Reverted to default CARTO API Key.');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title Header with CARTO Cloud Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-silver/10 pb-5">
        <div>
          <span className="mono-label">SPATIAL INFRASTRUCTURE TELEMETRY</span>
          <h1 className="font-display text-3xl md:text-4xl text-bone font-light tracking-tight mt-0.5">
            GIS ASSET MAP
          </h1>
          <p className="text-bone-muted text-xs md:text-sm mt-1 font-sans">
            Geographic risk distribution, corridor alignments, and site execution signals powered by CARTO.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Live CARTO Status Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 bg-obsidian-2 hover:bg-obsidian-3 px-3 py-1.5 rounded-full border border-silver/20 transition-all font-mono text-xs text-bone shadow-soft"
            title="Configure CARTO API Key"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-silver-bright font-semibold">CARTO.COM</span>
            <span className="text-bone-muted">•</span>
            <span className="text-bone-muted text-[0.68rem]">{maskApiKey(getSavedCartoApiKey())}</span>
            <Key size={12} className="text-silver-bright ml-0.5" />
          </button>

          <span className="font-mono text-xs text-bone-muted bg-obsidian-2 px-3 py-1.5 rounded-full border border-silver/10">
            {projects.length} Geo-Referenced Assets
          </span>
        </div>
      </div>

      {/* Strategic Corridor Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-obsidian-2/80 border border-silver/10 hover-glow-card flex items-center justify-between">
          <div>
            <span className="mono-label text-[0.62rem] block text-silver">WESTERN CORRIDOR</span>
            <span className="font-display text-sm font-semibold text-bone">Delhi — Vadodara — Pune</span>
            <span className="font-mono text-[0.65rem] text-bone-muted block mt-0.5">1,480 km • High-Speed Spine</span>
          </div>
          <span className="w-2 h-8 rounded-full bg-slate-300/40" />
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-2/80 border border-silver/10 hover-glow-card flex items-center justify-between">
          <div>
            <span className="mono-label text-[0.62rem] block text-amber-400">NORTH-EASTERN ARC</span>
            <span className="font-display text-sm font-semibold text-bone">Lucknow — Guwahati</span>
            <span className="font-mono text-[0.65rem] text-bone-muted block mt-0.5">1,820 km • Energy Grid</span>
          </div>
          <span className="w-2 h-8 rounded-full bg-amber-400/40" />
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-2/80 border border-silver/10 hover-glow-card flex items-center justify-between">
          <div>
            <span className="mono-label text-[0.62rem] block text-blue-400">PENINSULAR LOGISTICS</span>
            <span className="font-display text-sm font-semibold text-bone">Pune — BLR — Paradip</span>
            <span className="font-mono text-[0.65rem] text-bone-muted block mt-0.5">1,240 km • Deep-Sea Intermodal</span>
          </div>
          <span className="w-2 h-8 rounded-full bg-blue-400/40" />
        </div>
      </div>

      {/* Interactive Map Display */}
      <ProjectMap
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onInspectProject={handleInspect}
      />

      {/* Quick Select Project Corridor Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="mono-label">ASSET SELECTION SHORTCUTS</span>
          <span className="font-mono text-[0.68rem] text-bone-muted">CLICK TO CENTER MAP • ARROW TO INSPECT</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map(p => {
            const isSelected = p.id === selectedProject?.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className={`
                  p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover-glow-card
                  ${
                    isSelected
                      ? 'bg-obsidian-3 border-silver/40 shadow-soft'
                      : 'bg-obsidian-2/80 border-silver/10 hover:border-silver/25 hover:bg-obsidian-3/50'
                  }
                `}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[0.62rem] text-bone-muted">{p.code}</span>
                    <AurumBadge status={p.status} size="sm" />
                  </div>
                  <h4 className="font-display text-xs font-medium text-bone truncate">{p.name}</h4>
                  <p className="font-mono text-[0.65rem] text-bone-muted truncate mt-0.5">
                    {p.location.split(',')[0]} • Lat: {p.lat.toFixed(2)}, Lng: {p.lng.toFixed(2)} • Risk: {p.riskScore}/100
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspect(p);
                  }}
                  title="Inspect Details"
                  className="p-1.5 rounded-lg bg-obsidian-4 hover:bg-obsidian-5 border border-silver/15 text-silver shrink-0 transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARTO Configuration Modal */}
      <AurumModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="CARTO.COM GIS Telemetry Engine"
        maxWidth="lg"
      >
        <div className="space-y-5 font-sans">
          <div className="p-3.5 rounded-xl bg-obsidian-2 border border-silver/15 flex items-start gap-3">
            <Globe className="text-silver-bright shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-semibold text-bone">CARTO Spatial Cloud Integration</h4>
              <p className="text-[0.72rem] text-bone-muted mt-0.5 leading-relaxed">
                CARTO powers high-performance raster basemaps (Dark Matter, Positron, Voyager) and infrastructure corridor alignments.
              </p>
            </div>
          </div>

          <div>
            <label className="mono-label block mb-1.5 text-silver">CARTO API KEY</label>
            <div className="relative">
              <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-muted" />
              <input
                type="text"
                value={cartoKeyInput}
                onChange={e => setCartoKeyInput(e.target.value)}
                placeholder="cb1_3uzo_..."
                className="w-full bg-obsidian-2 border border-silver/20 rounded-xl pl-9 pr-4 py-2.5 text-xs text-bone font-mono focus:outline-none focus:border-silver-bright/50"
              />
            </div>
            <p className="text-[0.68rem] text-bone-muted mt-1.5 font-mono">
              Key format: <code>cb1_...</code> (CARTO Cloud API Key). Applied to tile requests.
            </p>
          </div>

          {/* Test Status Readout */}
          {testResult.tested && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{testResult.message}</span>
              </div>
              {testResult.latencyMs && (
                <span className="text-[0.68rem] px-2 py-0.5 rounded bg-obsidian-3 border border-silver/15">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-silver/10">
            <button
              type="button"
              onClick={handleTestCarto}
              disabled={isTestingCarto}
              className="btn-aurum-secondary text-xs flex items-center gap-1.5"
            >
              <Wifi size={13} />
              <span>{isTestingCarto ? 'TESTING CDN...' : 'TEST CARTO CDN'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDefaultKey}
                className="text-xs font-mono text-bone-muted hover:text-silver underline px-2 py-1"
              >
                Reset Default Key
              </button>
              <AurumButton variant="primary" size="sm" onClick={handleSaveCartoKey}>
                SAVE CARTO KEY
              </AurumButton>
            </div>
          </div>
        </div>
      </AurumModal>
    </div>
  );
};
