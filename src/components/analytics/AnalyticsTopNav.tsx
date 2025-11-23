import { Search, Gift, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AnalyticsTopNav() {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 no-print">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="p-2 bg-primary-500 rounded-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">MaisonMai Analytics</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled
            />
          </div>

          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">AD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
