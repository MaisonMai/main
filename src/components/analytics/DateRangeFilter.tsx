type DateRangeFilterProps = {
  fromDate: string;
  toDate: string;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
  currentRangeLabel: string;
};

export function DateRangeFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  currentRangeLabel
}: DateRangeFilterProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={onApply}
          className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Apply
        </button>

        <button
          onClick={onClear}
          className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Clear
        </button>

        <div className="text-sm text-slate-600 ml-auto">
          {currentRangeLabel}
        </div>
      </div>
    </div>
  );
}
