import React, { useState } from 'react';
import { AurumSidebar, ScreenId } from './AurumSidebar';
import { AurumHeader } from './AurumHeader';
import { AurumAtmosphere } from '../common/AurumAtmosphere';

interface AurumShellProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  children: React.ReactNode;
}

export const AurumShell: React.FC<AurumShellProps> = ({
  currentScreen,
  onNavigate,
  children,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="relative min-h-screen bg-obsidian-0 text-bone flex flex-col font-sans">
      {/* Aurum Cinematic Atmosphere: Drifting silver & steel glows + SVG noise overlay */}
      <AurumAtmosphere />

      {/* Persistent Left Sidebar */}
      <AurumSidebar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area (offset by sidebar width on large screens) */}
      <div className="flex-1 flex flex-col lg:pl-64 md:lg:pl-68 relative z-10 transition-all duration-300">
        {/* Top Header */}
        <AurumHeader
          onToggleMobile={() => setIsOpenMobile(!isOpenMobile)}
          onNavigateToAlerts={() => onNavigate('alerts')}
          onNavigateToCopilot={() => onNavigate('copilot')}
        />

        {/* Viewport container with generous editorial spacing */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

        {/* Executive Console Footer */}
        <footer className="border-t border-silver/10 px-4 md:px-8 py-4 text-center md:flex md:justify-between md:items-center text-xs text-bone-muted font-mono">
          <p>© 2026 MASTER DEV • INFRASTRUCTURE PROJECT CONTROL PLATFORM • AURUM v1.2</p>
          <div className="flex items-center justify-center gap-4 mt-2 md:mt-0">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              INTELLIGENCE ENGINE ACTIVE
            </span>
            <span className="text-silver-dark">•</span>
            <span>SYNTHETIC PORTFOLIO MODE</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
