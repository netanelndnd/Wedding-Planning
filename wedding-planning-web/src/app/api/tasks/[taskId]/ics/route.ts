import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate .ICS file for a task
 * GET /api/tasks/[taskId]/ics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

    // Get task data (we'll need to fetch it from Firestore)
    // For now, we'll create a helper function to generate ICS content
    // In a real implementation, you'd fetch the task from Firestore
    
    // Since we can't easily access Firestore here without the coupleId,
    // we'll accept task data as query parameters or create a service method
    
    const searchParams = req.nextUrl.searchParams;
    const title = searchParams.get('title') || 'משימה';
    const description = searchParams.get('description') || '';
    const dueDate = searchParams.get('dueDate');
    
    if (!dueDate) {
      return NextResponse.json(
        { error: 'תאריך יעד נדרש' },
        { status: 400 }
      );
    }

    // Generate ICS content
    const icsContent = generateICS({
      title,
      description,
      dueDate: new Date(dueDate),
      uid: `task-${taskId}-${Date.now()}`,
    });

    // Return as downloadable file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="task-${taskId}.ics"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating ICS:', error);
    return NextResponse.json(
      { error: error.message || 'שגיאה ביצירת קובץ היומן' },
      { status: 500 }
    );
  }
}

/**
 * Generate ICS file content
 */
function generateICS({
  title,
  description,
  dueDate,
  uid,
}: {
  title: string;
  description: string;
  dueDate: Date;
  uid: string;
}): string {
  // Format date for ICS (YYYYMMDDTHHMMSS)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  // Set start time to due date at 9:00 AM, end time at 10:00 AM
  const startDate = new Date(dueDate);
  startDate.setHours(9, 0, 0, 0);
  
  const endDate = new Date(dueDate);
  endDate.setHours(10, 0, 0, 0);

  const dtStart = formatDate(startDate);
  const dtEnd = formatDate(endDate);
  const dtStamp = formatDate(new Date()); // Current time

  // Escape special characters in description
  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Planning//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(line => line !== '') // Remove empty lines
    .join('\r\n');

  return icsContent;
}

