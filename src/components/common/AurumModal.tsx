import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AurumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const AurumModal: React.FC<AurumModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div
        className="fixed inset-0 bg-obsidian-0/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={`
          relative w-full ${maxWidthClass} bg-obsidian-2 border border-silver/20
          rounded-showcase shadow-deep shadow-metallic-inset p-6 md:p-8
          z-10 animate-in fade-in zoom-in-95 duration-150
        `}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-5 border-b border-silver/10 pb-4">
          <div>
            <h3 className="font-display text-xl md:text-2xl text-bone font-light">
              {title}
            </h3>
            {subtitle && (
              <p className="font-mono text-xs text-bone-muted uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-bone-muted hover:text-silver-bright p-1 rounded-full hover:bg-obsidian-4 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
