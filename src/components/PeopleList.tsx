import { Person } from '../lib/supabase';
import { User, Cake, Gift, ArrowRight } from 'lucide-react';

type PeopleListProps = {
  people: Person[];
  onSelectPerson: (person: Person) => void;
};

export function PeopleList({ people, onSelectPerson }: PeopleListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((person) => (
        <button
          key={person.id}
          onClick={() => onSelectPerson(person)}
          className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 hover:border-primary-300 text-left group relative overflow-hidden"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-all">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{person.name}</h3>
              {person.relationship && (
                <p className="text-sm text-gray-600 mt-1">{person.relationship}</p>
              )}
              {person.birthday && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-primary-600">
                  <Cake className="w-4 h-4" />
                  <span>{formatDate(person.birthday)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-primary-600 font-medium text-sm group-hover:gap-3 transition-all">
            <Gift className="w-4 h-4" />
            <span>View Gift Suggestions</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </div>

          <div className="absolute inset-0 border-2 border-primary-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </button>
      ))}
    </div>
  );
}
