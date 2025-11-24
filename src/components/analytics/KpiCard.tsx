import { TrendingUp, TrendingDown } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  format?: 'number' | 'percent';
  onClick?: () => void;
};

export function KpiCard({ title, value, change, icon, format = 'number', onClick }: KpiCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (format === 'number') return val.toLocaleString();
    return `${val.toFixed(1)}%`;
  };

  const isPositive = change !== undefined && change >= 0;
  const showChange = change !== undefined && change !== 0;

  const Component = onClick ? 'button' : 'div';
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary-300 transition-all active:scale-[0.98]' : '';

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow text-left w-full ${clickableClasses}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{formatValue(value)}</p>

          {showChange && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 ml-1">vs previous period</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </Component>
  );
}
