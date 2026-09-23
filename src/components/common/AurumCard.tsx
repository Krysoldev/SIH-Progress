import React from 'react';

interface AurumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'feature' | 'showcase' | 'cta' | 'compact';
  highlightTopLeft?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AurumCard: React.FC<AurumCardProps> = ({
  variant = 'feature',
  highlightTopLeft = true,
  children,
  className = '',
  ...props
}) => {
  const radiusClass = {
    feature: 'rounded-feature', // 20px
    showcase: 'rounded-showcase', // 24px
    cta: 'rounded-cta', // 32px
    compact: 'rounded-stat', // 12px
  }[variant];

  return (
    <div
      className={`
        relative bg-obsidian-2/80 backdrop-blur-md
        border border-silver/10 hover:border-silver/25
        shadow-soft shadow-metallic-inset
        transition-all duration-200 ease-out
        overflow-hidden
        ${radiusClass}
        ${className}
      `}
      {...props}
    >
      {/* Subtle Upper-Left Ambient Light Reflection */}
      {highlightTopLeft && (
        <div
          className="absolute -top-12 -left-12 w-32 h-32 bg-silver-bright/5 rounded-full filter blur-xl pointer-events-none"
          aria-hidden="true"
        />
      )}

      {children}
    </div>
  );
};
