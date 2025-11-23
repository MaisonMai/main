import { Download } from 'lucide-react';

type ExportButtonProps = {
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
};

export function ExportButton({ onClick, label = 'Export CSV', variant = 'secondary' }: ExportButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  const variantClasses =
    variant === 'primary'
      ? 'bg-primary-500 text-white hover:bg-primary-600'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
