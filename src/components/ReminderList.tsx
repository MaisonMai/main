import { useState, useEffect, useRef } from 'react';
import { Reminder, supabase } from '../lib/supabase';
import { Trash2, Bell, BellOff, Calendar, Download, Plus } from 'lucide-react';
import { addToGoogleCalendar, addToAppleCalendar } from '../lib/calendarUtils';

type ReminderListProps = {
  reminders: Reminder[];
  onUpdate: () => void;
};

type ReminderWithPerson = Reminder & {
  personName?: string;
};

export function ReminderList({ reminders, onUpdate }: ReminderListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [remindersWithPeople, setRemindersWithPeople] = useState<ReminderWithPerson[]>([]);
  const [showCalendarMenu, setShowCalendarMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const toggleActive = async (reminder: Reminder) => {
    setUpdatingId(reminder.id);
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !reminder.is_active })
        .eq('id', reminder.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating reminder:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;

    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  useState(() => {
    const loadPeopleNames = async () => {
      const personIds = [...new Set(reminders.map(r => r.person_id))];
      const { data: people } = await supabase
        .from('people')
        .select('id, name')
        .in('id', personIds);

      const peopleMap = new Map(people?.map(p => [p.id, p.name]) || []);
      const remindersWithNames = reminders.map(r => ({
        ...r,
        personName: peopleMap.get(r.person_id) || 'Unknown'
      }));

      setRemindersWithPeople(remindersWithNames);
    };

    loadPeopleNames();
  });

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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `In ${diffDays} days`;
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reminders yet. Add your first one!
      </div>
    );
  }

  const displayReminders = remindersWithPeople.length > 0 ? remindersWithPeople : reminders;

  return (
    <div className="space-y-3">
      {displayReminders.map((reminder) => (
        <div
          key={reminder.id}
          className={`bg-gray-50 rounded-xl p-4 border ${
            reminder.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'
          }`}
        >
          <div className="flex gap-3">
            <button
              onClick={() => toggleActive(reminder)}
              disabled={updatingId === reminder.id}
              className="pt-1"
            >
              {reminder.is_active ? (
                <Bell className="w-5 h-5 text-primary-600" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                  {'personName' in reminder && reminder.personName && (
                    <p className="text-xs text-gray-500 mt-0.5">for {reminder.personName}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative" ref={showCalendarMenu === reminder.id ? menuRef : null}>
                    <button
                      onClick={() => setShowCalendarMenu(showCalendarMenu === reminder.id ? null : reminder.id)}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-primary-100 rounded-lg transition-colors text-xs font-medium text-primary-700"
                      title="Export to your calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    {showCalendarMenu === reminder.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[180px]">
                        <button
                          onClick={() => handleAddToGoogleCalendar(reminder as ReminderWithPerson)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.5 3.5h-1V2h-2v1.5h-9V2h-2v1.5h-1A2.5 2.5 0 0 0 2 6v13.5A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5V6a2.5 2.5 0 0 0-2.5-2.5zm0 16h-15V9h15v10.5z" />
                          </svg>
                          Google Calendar
                        </button>
                        <button
                          onClick={() => handleAddToAppleCalendar(reminder as ReminderWithPerson)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Apple Calendar (.ics)
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(reminder.date)}</span>
                  <span className="text-primary-600 font-semibold">{getDaysUntil(reminder.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    Notify {reminder.days_before_notification} days before
                  </span>
                  {reminder.is_recurring && (
                    <span className="text-xs px-2 py-0.5 bg-primary-200 text-primary-700 rounded-full font-semibold">
                      Recurring
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
