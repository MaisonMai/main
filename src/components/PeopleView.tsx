import { useState, useEffect } from 'react';
import { supabase, Person } from '../lib/supabase';
import { PeopleList } from './PeopleList';
import { AddPersonModal } from './AddPersonModal';
import { Users, Plus } from 'lucide-react';

type PeopleViewProps = {
  onSelectPerson: (person: Person) => void;
};

export function PeopleView({ onSelectPerson }: PeopleViewProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name');

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonAdded = () => {
    loadPeople();
    setShowAddModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">People</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Keep track of the important people in your life. Add their birthdays, interests, and notes to help you find the perfect gifts for every occasion. The more details you add, the better our AI can suggest thoughtful gift ideas.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg flex-shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-hinted-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No people yet</h3>
          <p className="text-gray-500 mb-6">
            Start by adding someone special to track gift ideas for
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Your First Person
          </button>
        </div>
      ) : (
        <PeopleList people={people} onSelectPerson={onSelectPerson} />
      )}

      {showAddModal && (
        <AddPersonModal
          onClose={() => setShowAddModal(false)}
          onPersonAdded={handlePersonAdded}
        />
      )}
    </div>
  );
}
