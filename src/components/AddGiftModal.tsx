import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { analyzeGiftIdea } from '../lib/aiService';
import { X } from 'lucide-react';

type AddGiftModalProps = {
  personId: string;
  onClose: () => void;
  onGiftAdded: () => void;
};

export function AddGiftModal({ personId, onClose, onGiftAdded }: AddGiftModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: giftData, error: insertError } = await supabase
        .from('gift_ideas')
        .insert([
          {
            person_id: personId,
            user_id: userData.user.id,
            title: title.trim(),
            description: description.trim(),
            url: url.trim(),
            price: price ? parseFloat(price) : null,
            priority,
            is_purchased: false,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (giftData) {
        analyzeGiftIdea(
          giftData.id,
          personId,
          title.trim(),
          description.trim(),
          url.trim(),
          price ? parseFloat(price) : undefined
        ).catch((err) => console.error('Background analysis error:', err));
      }

      onGiftAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add gift idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Gift Idea</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
              Gift Idea *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              placeholder="Wireless headphones"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Details about the gift..."
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-1">
              Link
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1">
                Price
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Gift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
