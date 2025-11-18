import { useState, useEffect } from 'react';
import { supabase, Person, Reminder } from '../lib/supabase';
import { Calendar, Gift, ArrowRight, Cake } from 'lucide-react';

type PersonWithReminders = Person & {
  nextReminder?: Reminder;
  daysUntil?: number;
  giftIdeasCount?: number;
};

type DashboardViewProps = {
  onViewPerson: (person: Person) => void;
};

export function DashboardView({ onViewPerson }: DashboardViewProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<PersonWithReminders[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: reminders, error: remindersError } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_active', true)
        .order('date');

      if (remindersError) throw remindersError;

      const upcomingReminders = (reminders || []).filter((reminder) => {
        const reminderDate = new Date(reminder.date);

        if (reminder.is_recurring) {
          const currentYear = today.getFullYear();
          const nextOccurrence = new Date(
            currentYear,
            reminderDate.getMonth(),
            reminderDate.getDate()
          );

          if (nextOccurrence < today) {
            nextOccurrence.setFullYear(currentYear + 1);
          }

          const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 30;
        } else {
          const daysUntil = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 30;
        }
      });

      const personIds = [...new Set(upcomingReminders.map((r) => r.person_id))];

      if (personIds.length === 0) {
        setUpcomingEvents([]);
        setLoading(false);
        return;
      }

      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .in('id', personIds);

      if (peopleError) throw peopleError;

      const peopleWithEvents = await Promise.all(
        (people || []).map(async (person) => {
          const personReminders = upcomingReminders.filter((r) => r.person_id === person.id);
          const nextReminder = personReminders[0];

          const { count } = await supabase
            .from('gift_ideas')
            .select('*', { count: 'exact', head: true })
            .eq('person_id', person.id);

          const reminderDate = new Date(nextReminder.date);
          let nextOccurrence: Date;

          if (nextReminder.is_recurring) {
            const currentYear = today.getFullYear();
            nextOccurrence = new Date(
              currentYear,
              reminderDate.getMonth(),
              reminderDate.getDate()
            );

            if (nextOccurrence < today) {
              nextOccurrence.setFullYear(currentYear + 1);
            }
          } else {
            nextOccurrence = reminderDate;
          }

          const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          return {
            ...person,
            nextReminder: {
              ...nextReminder,
              date: nextOccurrence.toISOString().split('T')[0],
            },
            daysUntil,
            giftIdeasCount: count || 0,
          };
        })
      );

      peopleWithEvents.sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0));
      setUpcomingEvents(peopleWithEvents);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-500">
          Stay on top of upcoming birthdays, anniversaries, and special occasions. Never miss an important date again!
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-hinted-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming events</h3>
          <p className="text-gray-500">Add reminders for special dates to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((person) => (
            <button
              key={person.id}
              onClick={() => onViewPerson(person)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:border-hinted-200 hover:shadow-md transition-all text-left group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-hinted-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Cake className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{person.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                      {person.relationship && <span className="truncate">{person.relationship}</span>}
                      {person.nextReminder && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{person.nextReminder.title}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">{formatDate(person.nextReminder.date)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-14 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-primary-600">
                      {person.daysUntil !== undefined ? getDaysText(person.daysUntil) : '-'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Days Left</div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1 text-base sm:text-lg font-semibold text-gray-900">
                      <Gift className="w-4 h-4" />
                      <span>{person.giftIdeasCount || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ideas</div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors hidden sm:block" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
