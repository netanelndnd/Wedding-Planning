/**
 * ICS Calendar Export Utility
 *
 * Utility functions for generating ICS (iCalendar) files.
 * Supports exporting tasks and wedding date to calendar applications.
 */

import { Task } from '@/types';

/**
 * Options for generating ICS event from a task
 */
export interface TaskIcsOptions {
  /** Task to export */
  task: Task;
  /** Epic/category title for context */
  epicTitle?: string;
  /** Partner names for personalization */
  partnerNames?: {
    partner1: string;
    partner2: string;
  };
}

/**
 * Options for generating ICS event for wedding date
 */
export interface WeddingIcsOptions {
  /** Wedding date */
  weddingDate: Date;
  /** Partner names */
  partnerNames: {
    partner1: string;
    partner2: string;
  };
  /** Optional venue/location */
  location?: string;
  /** Optional description/notes */
  description?: string;
}

/**
 * Format date to ICS date format (YYYYMMDD)
 */
function formatIcsDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format date to ICS datetime format (YYYYMMDDTHHMMSS)
 */
function formatIcsDateTime(date: Date): string {
  const dateStr = formatIcsDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${dateStr}T${hours}${minutes}${seconds}`;
}

/**
 * Generate a unique identifier for the event
 */
function generateUid(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${random}@wedding-planner`;
}

/**
 * Escape special characters in ICS text fields
 * ICS requires escaping backslashes, semicolons, commas, and newlines
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines according to ICS specification (max 75 chars)
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const lines: string[] = [];
  let remaining = line;

  // First line can be 75 chars
  lines.push(remaining.substring(0, maxLength));
  remaining = remaining.substring(maxLength);

  // Continuation lines start with space and can be 74 chars
  while (remaining.length > 0) {
    lines.push(' ' + remaining.substring(0, maxLength - 1));
    remaining = remaining.substring(maxLength - 1);
  }

  return lines.join('\r\n');
}

/**
 * Get Hebrew status label
 */
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'pending': 'ממתין',
    'in-progress': 'בתהליך',
    'completed': 'הושלם',
    'cancelled': 'בוטל',
  };
  return statusLabels[status] || status;
}

/**
 * Generate ICS content for a task
 *
 * @param options - Task ICS options
 * @returns ICS file content as string
 *
 * @example
 * ```ts
 * const icsContent = generateTaskIcs({
 *   task: myTask,
 *   epicTitle: 'צילום ווידאו',
 * });
 * ```
 */
export function generateTaskIcs(options: TaskIcsOptions): string {
  const { task, epicTitle, partnerNames } = options;

  // Get the due date or use current date + 7 days as default
  let eventDate: Date;
  if (task.dueDate) {
    eventDate = task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate();
  } else {
    eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7);
  }

  // Build event summary
  let summary = task.title;
  if (epicTitle) {
    summary = `[${epicTitle}] ${task.title}`;
  }

  // Build description
  const descParts: string[] = [];
  if (partnerNames) {
    descParts.push(`חתונה של ${partnerNames.partner1} ו${partnerNames.partner2}`);
  }
  if (task.description) {
    descParts.push(task.description);
  }
  descParts.push(`סטטוס: ${getStatusLabel(task.status)}`);
  if (task.notes) {
    descParts.push(`הערות: ${task.notes}`);
  }

  const description = descParts.join('\\n');

  // Generate ICS content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Planner//Task Export//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUid()}`,
    `DTSTAMP:${formatIcsDateTime(new Date())}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(eventDate)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(new Date(eventDate.getTime() + 86400000))}`,
    foldLine(`SUMMARY:${escapeIcsText(summary)}`),
    foldLine(`DESCRIPTION:${escapeIcsText(description)}`),
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Generate ICS content for wedding date
 *
 * @param options - Wedding ICS options
 * @returns ICS file content as string
 *
 * @example
 * ```ts
 * const icsContent = generateWeddingIcs({
 *   weddingDate: new Date('2026-06-15'),
 *   partnerNames: { partner1: 'דני', partner2: 'מיכל' },
 *   location: 'אולם האירועים',
 * });
 * ```
 */
export function generateWeddingIcs(options: WeddingIcsOptions): string {
  const { weddingDate, partnerNames, location, description } = options;

  // Build event summary
  const summary = `החתונה של ${partnerNames.partner1} ו${partnerNames.partner2}`;

  // Build description
  const descParts: string[] = [];
  descParts.push(`החתונה של ${partnerNames.partner1} ו${partnerNames.partner2}`);
  if (description) {
    descParts.push(description);
  }
  descParts.push('נוצר על ידי מתכנן החתונה');

  const eventDescription = descParts.join('\\n');

  // Generate ICS content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Planner//Wedding Date Export//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUid()}`,
    `DTSTAMP:${formatIcsDateTime(new Date())}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(weddingDate)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(new Date(weddingDate.getTime() + 86400000))}`,
    foldLine(`SUMMARY:${escapeIcsText(summary)}`),
    foldLine(`DESCRIPTION:${escapeIcsText(eventDescription)}`),
  ];

  // Add location if provided
  if (location) {
    lines.push(foldLine(`LOCATION:${escapeIcsText(location)}`));
  }

  lines.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.join('\r\n');
}

/**
 * Download ICS file to user's device
 *
 * @param content - ICS file content
 * @param filename - Name for the downloaded file (without .ics extension)
 *
 * @example
 * ```ts
 * const icsContent = generateTaskIcs({ task: myTask });
 * downloadIcsFile(icsContent, 'wedding-task');
 * ```
 */
export function downloadIcsFile(content: string, filename: string): void {
  // Create blob with ICS content
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });

  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Export a task to calendar (generates and downloads ICS file)
 *
 * @param options - Task ICS options
 * @param filename - Optional custom filename (default: task title)
 *
 * @example
 * ```ts
 * exportTaskToCalendar({
 *   task: myTask,
 *   epicTitle: 'צילום',
 * });
 * ```
 */
export function exportTaskToCalendar(
  options: TaskIcsOptions,
  filename?: string
): void {
  const icsContent = generateTaskIcs(options);
  const safeFilename = filename || options.task.title.replace(/[^a-zA-Z0-9א-ת\s-]/g, '').trim();
  downloadIcsFile(icsContent, safeFilename || 'wedding-task');
}

/**
 * Export wedding date to calendar (generates and downloads ICS file)
 *
 * @param options - Wedding ICS options
 *
 * @example
 * ```ts
 * exportWeddingToCalendar({
 *   weddingDate: new Date('2026-06-15'),
 *   partnerNames: { partner1: 'דני', partner2: 'מיכל' },
 * });
 * ```
 */
export function exportWeddingToCalendar(options: WeddingIcsOptions): void {
  const icsContent = generateWeddingIcs(options);
  const filename = `חתונה-${options.partnerNames.partner1}-${options.partnerNames.partner2}`;
  downloadIcsFile(icsContent, filename);
}
