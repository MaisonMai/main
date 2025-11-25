import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

type GiftIdea = {
  id: string;
  title: string;
  notes?: string;
};

type AddReminderModalProps = {
  personId: string;
  onClose: () => void;
  onReminderAdded: () => void;
};

export function AddReminderModal({ personId, onClose, onReminderAdded }: AddReminderModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [daysBeforeNotification, setDaysBeforeNotification] = useState('7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<string>('');
  const [loadingGifts, setLoadingGifts] = useState(true);

  useEffect(() => {
    loadGiftIdeas();
  }, [personId]);

  const loadGiftIdeas = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('gift_ideas')
        .select('id, title, notes')
        .eq('person_id', personId)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGiftIdeas(data || []);
    } catch (err) {
      console.error('Error loading gift ideas:', err);
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reminders').insert([
        {
          person_id: personId,
          user_id: userData.user.id,
          title: title.trim(),
          date,
          is_recurring: isRecurring,
          days_before_notification: parseInt(daysBeforeNotification),
          is_active: true,
          gift_id: selectedGiftId || null,
        },
      ]);

      if (error) throw error;
      onReminderAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Reminder</h2>
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
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              placeholder="Birthday, Anniversary, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {!loadingGifts && giftIdeas.length > 0 && (
            <div>
              <label htmlFor="giftIdea" className="block text-sm font-semibold text-gray-700 mb-1">
                Link to Gift Idea (optional)
              </label>
              <select
                id="giftIdea"
                value={selectedGiftId}
                onChange={(e) => setSelectedGiftId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              >
                <option value="">None - Just a reminder</option>
                {giftIdeas.map((gift) => (
                  <option key={gift.id} value={gift.id}>
                    {gift.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Connect this reminder to a gift idea you've saved
              </p>
            </div>
          )}

          <div>
            <label htmlFor="daysBeforeNotification" className="block text-sm font-semibold text-gray-700 mb-1">
              Notify me (days before)
            </label>
            <input
              id="daysBeforeNotification"
              type="number"
              min="1"
              max="365"
              value={daysBeforeNotification}
              onChange={(e) => setDaysBeforeNotification(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isRecurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-200 rounded focus:ring-hinted-300"
            />
            <label htmlFor="isRecurring" className="text-sm text-gray-700">
              Repeat annually
            </label>
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
              {loading ? 'Adding...' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
