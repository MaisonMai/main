import { useState } from 'react';
import { GiftIdea, supabase } from '../lib/supabase';
import { ExternalLink, Trash2, CheckCircle, Circle, DollarSign, Pencil } from 'lucide-react';
import { EditGiftModal } from './EditGiftModal';

type GiftIdeaListProps = {
  giftIdeas: GiftIdea[];
  onUpdate: () => void;
};

export function GiftIdeaList({ giftIdeas, onUpdate }: GiftIdeaListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingGift, setEditingGift] = useState<GiftIdea | null>(null);

  const togglePurchased = async (idea: GiftIdea) => {
    setUpdatingId(idea.id);
    try {
      const { error } = await supabase
        .from('gift_ideas')
        .update({ is_purchased: !idea.is_purchased })
        .eq('id', idea.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating gift idea:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteGiftIdea = async (id: string) => {
    if (!confirm('Delete this gift idea?')) return;

    try {
      const { error } = await supabase.from('gift_ideas').delete().eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting gift idea:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (giftIdeas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No gift ideas yet. Add your first one!
      </div>
    );
  }

  return (
    <>
      {editingGift && (
        <EditGiftModal
          gift={editingGift}
          onClose={() => setEditingGift(null)}
          onUpdate={() => {
            onUpdate();
            setEditingGift(null);
          }}
        />
      )}

      <div className="space-y-3">
        {giftIdeas.map((idea) => (
        <div
          key={idea.id}
          className={`bg-gray-50 rounded-xl p-4 border ${
            idea.is_purchased ? 'border-hinted-200 bg-primary-50' : 'border-gray-200'
          }`}
        >
          <div className="flex gap-3">
            <button
              onClick={() => togglePurchased(idea)}
              disabled={updatingId === idea.id}
              className="pt-1"
            >
              {idea.is_purchased ? (
                <CheckCircle className="w-5 h-5 text-primary-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={`font-semibold text-gray-900 ${
                    idea.is_purchased ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {idea.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${getPriorityColor(
                      idea.priority
                    )}`}
                  >
                    {idea.priority}
                  </span>
                  <button
                    onClick={() => setEditingGift(idea)}
                    className="p-1 hover:bg-hinted-100 rounded transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-primary-600" />
                  </button>
                  <button
                    onClick={() => deleteGiftIdea(idea.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {idea.description && (
                <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
              )}

              <div className="flex items-center gap-4 mt-2">
                {idea.price && (
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>{idea.price}</span>
                  </div>
                )}
                {idea.url && (
                  <a
                    href={idea.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Link</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        ))}
      </div>
    </>
  );
}
