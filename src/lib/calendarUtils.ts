import { Reminder } from './supabase';

export function generateICalFile(reminder: Reminder, personName: string): string {
  const eventDate = new Date(reminder.date);
  const notificationDate = new Date(eventDate);
  notificationDate.setDate(notificationDate.getDate() - reminder.days_before_notification);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `${reminder.id}@maisonmai.com`;
  const created = formatDate(new Date(reminder.created_at));
  const start = formatDate(eventDate);

  const description = reminder.is_recurring
    ? `Annual reminder for ${personName}'s ${reminder.title}`
    : `Reminder for ${personName}'s ${reminder.title}`;

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Maison Mai//Gift Reminder App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${created}`,
    `DTSTART;VALUE=DATE:${reminder.date.replace(/-/g, '')}`,
    `SUMMARY:${reminder.title} - ${personName}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    ...(reminder.is_recurring ? ['RRULE:FREQ=YEARLY'] : []),
    'BEGIN:VALARM',
    'TRIGGER:-P' + reminder.days_before_notification + 'D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${reminder.title} for ${personName}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icalContent;
}

export function downloadICalFile(reminder: Reminder, personName: string): void {
  const icalContent = generateICalFile(reminder, personName);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${reminder.title.replace(/\s+/g, '_')}_${personName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function getGoogleCalendarUrl(reminder: Reminder, personName: string): string {
  const eventDate = new Date(reminder.date);

  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = eventDate.toISOString().split('T')[0].replace(/-/g, '');
  const end = start;

  const title = encodeURIComponent(`${reminder.title} - ${personName}`);
  const description = encodeURIComponent(
    reminder.is_recurring
      ? `Annual reminder for ${personName}'s ${reminder.title}. Set to remind ${reminder.days_before_notification} days in advance.`
      : `Reminder for ${personName}'s ${reminder.title}. Set to remind ${reminder.days_before_notification} days in advance.`
  );

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  if (reminder.is_recurring) {
    params.append('recur', 'RRULE:FREQ=YEARLY');
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function addToGoogleCalendar(reminder: Reminder, personName: string): void {
  const url = getGoogleCalendarUrl(reminder, personName);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function addToAppleCalendar(reminder: Reminder, personName: string): void {
  downloadICalFile(reminder, personName);
}
