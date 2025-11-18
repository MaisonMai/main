import { useState } from 'react';
import { Person, supabase } from '../lib/supabase';
import { analyzePersonNotes } from '../lib/aiService';
import { X } from 'lucide-react';

type EditPersonModalProps = {
  person: Person;
  onClose: () => void;
  onPersonUpdated: () => void;
};

export function EditPersonModal({ person, onClose, onPersonUpdated }: EditPersonModalProps) {
  const [name, setName] = useState(person.name);
  const [relationship, setRelationship] = useState(person.relationship);
  const [birthday, setBirthday] = useState(person.birthday || '');
  const [notes, setNotes] = useState(person.notes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('people')
        .update({
          name: name.trim(),
          relationship: relationship.trim(),
          birthday: birthday || null,
          notes: notes.trim(),
        })
        .eq('id', person.id);

      if (error) throw error;

      if (notes.trim() !== person.notes && notes.trim().length > 0) {
        analyzePersonNotes(
          person.id,
          name.trim(),
          relationship.trim(),
          notes.trim(),
          birthday || undefined
        ).catch((err) => console.error('Background analysis error:', err));
      }

      onPersonUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update person');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Person</h2>
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
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Any helpful details..."
            />
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
              className="flex-1 px-4 py-2 bg-hinted-500 text-white rounded-lg font-semibold hover:bg-primary-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
