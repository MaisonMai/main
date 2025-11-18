import { useState, useEffect, useRef } from 'react';
import { Reminder, supabase } from '../lib/supabase';
import { Bell, Calendar, Plus, Download } from 'lucide-react';
import { addToGoogleCalendar, addToAppleCalendar } from '../lib/calendarUtils';

type ReminderWithPerson = Reminder & {
  personName?: string;
};

export function UpcomingReminders() {
  const [upcomingReminders, setUpcomingReminders] = useState<ReminderWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarMenu, setShowCalendarMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUpcomingReminders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCalendarMenu(null);
      }
    };

    if (showCalendarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarMenu]);

  const loadUpcomingReminders = async () => {
    try {
      const today = new Date();

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_active', true)
        .gte('date', today.toISOString().split('T')[0])
        .order('date')
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        const personIds = [...new Set(data.map(r => r.person_id))];
        const { data: people } = await supabase
          .from('people')
          .select('id, name')
          .in('id', personIds);

        const peopleMap = new Map(people?.map(p => [p.id, p.name]) || []);
        const remindersWithNames = data.map(r => ({
          ...r,
          personName: peopleMap.get(r.person_id) || 'Unknown'
        }));

        setUpcomingReminders(remindersWithNames);
      } else {
        setUpcomingReminders([]);
      }
    } catch (error) {
      console.error('Error loading upcoming reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGoogleCalendar = (reminder: ReminderWithPerson) => {
    addToGoogleCalendar(reminder, reminder.personName || 'Unknown');
    setShowCalendarMenu(null);
  };

  const handleAddToAppleCalendar = (reminder: ReminderWithPerson) => {
    addToAppleCalendar(reminder, reminder.personName || 'Unknown');
    setShowCalendarMenu(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  if (loading || upcomingReminders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Reminders</h3>
      </div>
      <div className="space-y-3">
        {upcomingReminders.map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <Calendar className="w-4 h-4 text-primary-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{reminder.title}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(reminder.date)}
                  {reminder.personName && (
                    <span className="text-gray-500"> • for {reminder.personName}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-600">{getDaysUntil(reminder.date)}</span>
              <div className="relative" ref={showCalendarMenu === reminder.id ? menuRef : null}>
                <button
                  onClick={() => setShowCalendarMenu(showCalendarMenu === reminder.id ? null : reminder.id)}
                  className="p-1 hover:bg-emerald-100 rounded transition-colors"
                  title="Add to calendar"
                >
                  <Plus className="w-4 h-4 text-primary-600" />
                </button>
                {showCalendarMenu === reminder.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[180px]">
                    <button
                      onClick={() => handleAddToGoogleCalendar(reminder)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.5 3.5h-1V2h-2v1.5h-9V2h-2v1.5h-1A2.5 2.5 0 0 0 2 6v13.5A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5V6a2.5 2.5 0 0 0-2.5-2.5zm0 16h-15V9h15v10.5z" />
                      </svg>
                      Google Calendar
                    </button>
                    <button
                      onClick={() => handleAddToAppleCalendar(reminder)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Apple Calendar (.ics)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
