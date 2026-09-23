import React from 'react';

interface AurumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AurumButton: React.FC<AurumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs md:text-sm',
    lg: 'px-6 py-3 text-sm md:text-base',
  }[size];

  const variantClasses = {
    primary: 'btn-aurum-primary',
    secondary: 'btn-aurum-secondary',
    ghost: 'bg-transparent text-bone-muted hover:text-bone hover:bg-obsidian-3/60 rounded-pill px-3 py-2 transition-colors',
    danger: 'bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/50 rounded-pill px-4 py-2 transition-all',
  }[variant];

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium tracking-wide
        cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
