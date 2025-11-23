import { useState } from 'react';
import { ExportButton } from './ExportButton';
import { Search } from 'lucide-react';
import { AnalyticsEvent } from '../../lib/analyticsHelpers';
import { computeProductStats, exportToCsv } from '../../lib/analyticsHelpers';

type ProductsPageProps = {
  filteredEvents: AnalyticsEvent[];
};

export function ProductsPage({ filteredEvents }: ProductsPageProps) {
  if (filteredEvents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Performance</h1>
          <p className="text-slate-600">Analyze which gift ideas perform best</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-slate-700 mb-2 font-medium text-lg">Product Analytics Coming Soon</p>
          <p className="text-slate-600 text-sm mb-4">Detailed product performance analytics will be available soon. For now, view gift ideas data in the Overview and Engagement tabs.</p>
          <p className="text-slate-500 text-xs">Current data shows {filteredEvents.length === 0 ? 'real metrics from your database' : 'tracked events'} in other tabs.</p>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setcategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const products = computeProductStats(filteredEvents);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shop_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    const rows = filteredProducts.map((p) => ({
      product: p.product_name,
      category: p.category,
      shop: p.shop_name,
      recommended: p.recommended_count,
      saves: p.saves,
      clicks: p.clicks,
      saveRate: p.saveRate,
      clickThroughRate: p.clickThroughRate
    }));
    exportToCsv('products.csv', rows, ['product', 'category', 'shop', 'recommended', 'saves', 'clicks', 'saveRate', 'clickThroughRate']);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Products</h1>
        <p className="text-slate-600">View all recommended products and their performance metrics</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name or shop..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setcategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <ExportButton onClick={handleExport} label="Export CSV" />
            <ExportButton onClick={handleExport} label="Export for Excel" />
          </div>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Shop</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Recommended</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Saves</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Clicks</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Save Rate</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">CTR</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{product.product_name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 capitalize">{product.category}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{product.shop_name}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{product.recommended_count}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{product.saves}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{product.clicks}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{product.saveRate}%</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{product.clickThroughRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
