import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { analyzePersonNotes } from '../lib/aiService';
import { X, Sparkles } from 'lucide-react';

type AddPersonModalProps = {
  onClose: () => void;
  onPersonAdded: () => void;
};

export function AddPersonModal({ onClose, onPersonAdded }: AddPersonModalProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data: personData, error: insertError } = await supabase
        .from('people')
        .insert([
          {
            user_id: userData.user.id,
            name: name.trim(),
            relationship: relationship.trim(),
            birthday: birthday || null,
            notes: notes.trim(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (notes.trim().length > 0 && personData) {
        setAnalyzing(true);
        await analyzePersonNotes(
          personData.id,
          name.trim(),
          relationship.trim(),
          notes.trim(),
          birthday || undefined
        );
      }

      onPersonAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add person');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl my-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Person</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="relationship" className="block text-sm font-semibold text-gray-700 mb-1">
              Relationship
            </label>
            <input
              id="relationship"
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
              placeholder="Friend, Family, Colleague..."
            />
          </div>

          <div>
            <label htmlFor="birthday" className="block text-sm font-semibold text-gray-700 mb-1">
              Birthday
            </label>
            <input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-hinted-300 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <span>Notes</span>
                {notes.trim().length > 20 && (
                  <span className="flex items-center gap-1 text-xs text-primary-600">
                    <Sparkles className="w-3 h-3" />
                    AI will analyze this
                  </span>
                )}
              </div>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hinted-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="e.g., Loves hiking, coffee enthusiast, into tech gadgets..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Add details about their interests for personalised gift suggestions
            </p>
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
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : loading ? 'Adding...' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
