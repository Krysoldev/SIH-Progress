import React from 'react';
import { useNotification, NotificationItem } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const AurumToastContainer: React.FC = () => {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map(n => (
        <ToastItem key={n.id} notification={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: NotificationItem; onDismiss: () => void }> = ({
  notification,
  onDismiss,
}) => {
  const { type, title, message } = notification;

  const iconMap = {
    success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />,
    error: <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />,
    info: <Info size={16} className="text-silver-bright shrink-0 mt-0.5" />,
  };

  const borderMap = {
    success: 'border-emerald-500/30 bg-obsidian-2/95 shadow-[0_8px_25px_rgba(16,185,129,0.12)]',
    warning: 'border-amber-500/30 bg-obsidian-2/95 shadow-[0_8px_25px_rgba(245,158,11,0.12)]',
    error: 'border-rose-500/30 bg-obsidian-2/95 shadow-[0_8px_25px_rgba(244,63,94,0.15)]',
    info: 'border-silver/30 bg-obsidian-2/95 shadow-[0_8px_25px_rgba(228,232,238,0.1)]',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md animate-slide-in-right transition-all ${borderMap[type]}`}
    >
      {iconMap[type]}
      <div className="flex-1 min-w-0 pr-1">
        <div className="text-xs font-semibold text-bone font-mono tracking-tight">{title}</div>
        {message && <div className="text-[0.72rem] text-bone-muted mt-0.5 leading-relaxed">{message}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="text-bone-muted hover:text-bone p-1 rounded-md transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
};
