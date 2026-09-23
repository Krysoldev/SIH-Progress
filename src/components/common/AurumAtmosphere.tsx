import React from 'react';

export const AurumAtmosphere: React.FC = () => {
  return (
    <>
      {/* Top-Right Silver Radial Ambient Drift */}
      <div className="aurum-glow-tr" aria-hidden="true" />

      {/* Bottom-Left Steel Radial Ambient Drift */}
      <div className="aurum-glow-bl" aria-hidden="true" />

      {/* Fixed Micro-noise Grain Overlay */}
      <div className="aurum-grain-overlay" aria-hidden="true" />
    </>
  );
};
