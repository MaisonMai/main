import { useState, useEffect } from 'react';
import { supabase, GiftIdea, Person } from '../lib/supabase';
import { Gift, ExternalLink, DollarSign, Check } from 'lucide-react';

type GiftWithPerson = GiftIdea & {
  person: Person;
};

export function GiftsView() {
  const [gifts, setGifts] = useState<GiftWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchased' | 'pending'>('all');

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      const { data: giftData, error: giftError } = await supabase
        .from('gift_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (giftError) throw giftError;

      if (!giftData || giftData.length === 0) {
        setGifts([]);
        setLoading(false);
        return;
      }

      const personIds = [...new Set(giftData.map((g) => g.person_id))];
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .in('id', personIds);

      if (peopleError) throw peopleError;

      const giftsWithPeople = giftData.map((gift) => ({
        ...gift,
        person: peopleData?.find((p) => p.id === gift.person_id)!,
      }));

      setGifts(giftsWithPeople);
    } catch (error) {
      console.error('Error loading gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePurchased = async (gift: GiftIdea) => {
    try {
      const { error } = await supabase
        .from('gift_ideas')
        .update({ is_purchased: !gift.is_purchased })
        .eq('id', gift.id);

      if (error) throw error;
      loadGifts();
    } catch (error) {
      console.error('Error updating gift:', error);
    }
  };

  const filteredGifts = gifts.filter((gift) => {
    if (filter === 'purchased') return gift.is_purchased;
    if (filter === 'pending') return !gift.is_purchased;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gift Ideas</h2>
        <p className="text-gray-500">
          Browse all your curated gift ideas. Track what you've purchased and discover the perfect gifts for everyone on your list.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all'
              ? 'bg-hinted-200 text-primary-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          All ({gifts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-hinted-200 text-primary-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          To Buy ({gifts.filter((g) => !g.is_purchased).length})
        </button>
        <button
          onClick={() => setFilter('purchased')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'purchased'
              ? 'bg-hinted-200 text-primary-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Purchased ({gifts.filter((g) => g.is_purchased).length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-hinted-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredGifts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No gift ideas yet' : filter === 'purchased' ? 'No purchased gifts' : 'No pending gifts'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Add gift ideas from the People tab' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGifts.map((gift) => (
            <div
              key={gift.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                gift.is_purchased
                  ? 'border-hinted-200 bg-primary-50'
                  : 'border-gray-100 hover:border-hinted-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      gift.is_purchased ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {gift.title}
                  </h3>
                  <p className="text-sm text-primary-600 mt-1">For {gift.person?.name}</p>
                </div>
                <button
                  onClick={() => togglePurchased(gift)}
                  className={`p-2 rounded-lg transition-all ${
                    gift.is_purchased
                      ? 'bg-hinted-200 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-hinted-100'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              {gift.description && (
                <p className="text-sm text-gray-600 mb-3">{gift.description}</p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getPriorityColor(gift.priority)}`}>
                  {gift.priority}
                </span>
                {gift.price && (
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>{gift.price}</span>
                  </div>
                )}
                {gift.url && (
                  <a
                    href={gift.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Link</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
