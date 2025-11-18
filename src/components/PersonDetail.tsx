import { useState, useEffect } from 'react';
import { Person, GiftIdea, Reminder, supabase } from '../lib/supabase';
import { ArrowLeft, Edit2, Trash2, Gift, Calendar, Plus, ClipboardList } from 'lucide-react';
import { GiftIdeaList } from './GiftIdeaList';
import { AddGiftModal } from './AddGiftModal';
import { ReminderList } from './ReminderList';
import { AddReminderModal } from './AddReminderModal';
import { EditPersonModal } from './EditPersonModal';
import { AiGiftSuggestions } from './AiGiftSuggestions';
import { PersonQuestionnaire } from './PersonQuestionnaire';

type PersonDetailProps = {
  person: Person;
  onBack: () => void;
  onPersonUpdated: () => void;
  onPersonDeleted: () => void;
};

export function PersonDetail({
  person,
  onBack,
  onPersonUpdated,
  onPersonDeleted,
}: PersonDetailProps) {
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'gifts' | 'reminders'>('gifts');
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [person.id]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadGiftIdeas(), loadReminders(), checkQuestionnaire()]);
    setLoading(false);
  };

  const checkQuestionnaire = async () => {
    const { data } = await supabase
      .from('questionnaire_responses')
      .select('id')
      .eq('person_id', person.id)
      .maybeSingle();

    setHasQuestionnaire(!!data);
  };

  const loadGiftIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_ideas')
        .select('*')
        .eq('person_id', person.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGiftIdeas(data || []);
    } catch (error) {
      console.error('Error loading gift ideas:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('person_id', person.id)
        .order('date');

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleDeletePerson = async () => {
    if (!confirm(`Are you sure you want to delete ${person.name}? This will also delete all associated gift ideas and reminders.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('people').delete().eq('id', person.id);

      if (error) throw error;
      onPersonDeleted();
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Failed to delete person');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">{person.name}</h2>
          {person.relationship && (
            <p className="text-gray-600 mt-1">{person.relationship}</p>
          )}
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleDeletePerson}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 text-red-600" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Birthday</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(person.birthday)}</p>
          </div>
          {person.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Notes</p>
              <p className="text-gray-900">{person.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowQuestionnaire(true)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all shadow-sm hover:shadow-md ${
              hasQuestionnaire
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            {hasQuestionnaire ? '✓ Questionnaire Completed' : 'Complete Personalization Questionnaire'}
          </button>
          {hasQuestionnaire && (
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 text-center mt-2 transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit Questionnaire
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'gifts'
                  ? 'text-primary-600 border-b-2 border-hinted-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                Gift Ideas ({giftIdeas.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'reminders'
                  ? 'text-primary-600 border-b-2 border-hinted-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Reminders ({reminders.length})
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-4 border-hinted-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'gifts' ? (
            <div>
              <AiGiftSuggestions key={refreshKey} person={person} onGiftAdded={loadGiftIdeas} />

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Gift Ideas</h3>
                <button
                  onClick={() => setShowAddGiftModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Gift Idea
                </button>
              </div>
              <GiftIdeaList giftIdeas={giftIdeas} onUpdate={loadGiftIdeas} />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
                <button
                  onClick={() => setShowAddReminderModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Reminder
                </button>
              </div>
              <ReminderList reminders={reminders} onUpdate={loadReminders} />
            </div>
          )}
        </div>
      </div>

      {showAddGiftModal && (
        <AddGiftModal
          personId={person.id}
          onClose={() => setShowAddGiftModal(false)}
          onGiftAdded={() => {
            loadGiftIdeas();
            setShowAddGiftModal(false);
          }}
        />
      )}

      {showAddReminderModal && (
        <AddReminderModal
          personId={person.id}
          onClose={() => setShowAddReminderModal(false)}
          onReminderAdded={() => {
            loadReminders();
            setShowAddReminderModal(false);
          }}
        />
      )}

      {showEditModal && (
        <EditPersonModal
          person={person}
          onClose={() => setShowEditModal(false)}
          onPersonUpdated={() => {
            onPersonUpdated();
            setShowEditModal(false);
          }}
        />
      )}

      {showQuestionnaire && (
        <PersonQuestionnaire
          person={person}
          onClose={() => setShowQuestionnaire(false)}
          onComplete={() => {
            setShowQuestionnaire(false);
            setRefreshKey(prev => prev + 1);
            loadData();
          }}
        />
      )}
    </div>
  );
}
