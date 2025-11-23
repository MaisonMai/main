import { useState } from 'react';
import { ExternalLink, Search, Loader2 } from 'lucide-react';

type SearchResult = {
  url: string;
  title: string;
  snippet: string;
  why_this_is_relevant: string;
};

export function GiftPartnersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/gift-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'search',
          search_query: searchQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.flow === 'search' && result.shops) {
        setSearchResults(result.shops);
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Explore Unique Gift Shops
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-2">
          Find independent shops, artisan makers, and hidden gems that sell extraordinary gifts your loved ones will cherish.
        </p>
        <p className="text-base text-gray-500 max-w-2xl mx-auto">
          Search by category, location, or style to discover shops that align with your gift-giving needs.
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl border-2 border-primary-200 p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Shop Search</h2>
            <p className="text-base text-gray-600">Powered by Exa AI Search</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <p className="text-sm text-gray-700 mb-4 font-medium">
            Search for specific gift shops by category, location, or style
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Try searching for things like:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => { setSearchQuery('ceramics and pottery gift shops in East London with under £40 options'); setTimeout(handleSearch, 100); }}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              🏺 Ceramics in East London
            </button>
            <button
              onClick={() => { setSearchQuery('vintage bookstores with gift options in Brighton'); setTimeout(handleSearch, 100); }}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              📚 Vintage Bookstores
            </button>
            <button
              onClick={() => { setSearchQuery('independent jewellery designers London'); setTimeout(handleSearch, 100); }}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              💎 Jewellery Designers
            </button>
            <button
              onClick={() => { setSearchQuery('artisan chocolate makers UK'); setTimeout(handleSearch, 100); }}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              🍫 Artisan Chocolate
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g., pottery shops in Brighton with under £50 options"
            className="flex-1 px-5 py-4 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            {searching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {searching && (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-base font-semibold text-gray-900 mb-2">Searching for gift shops...</p>
            <p className="text-sm text-gray-600">This may take a few seconds</p>
          </div>
        )}

        {searchResults.length > 0 && !searching && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Found {searchResults.length} Gift Shops</h2>
            </div>
            {searchResults.map((result, index) => (
              <a
                key={index}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl p-6 hover:shadow-xl transition-all border-2 border-gray-200 hover:border-primary-300 group"
              >
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-primary-100 rounded-xl flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <ExternalLink className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-2">
                      {result.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">{result.snippet}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">
                        {result.why_this_is_relevant}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-7 h-7 text-primary-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        )}

        {!searching && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-yellow-200">
            <div className="p-4 bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-sm text-gray-600 mb-4">Try a different search term or be more specific</p>
            <p className="text-xs text-gray-500">Example: "vintage furniture shops in London"</p>
          </div>
        )}

        {!searching && !searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Search</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter a search query above or click one of the example buttons to discover unique gift shops
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
