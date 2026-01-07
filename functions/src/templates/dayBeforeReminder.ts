/**
 * Day-Before Reminder Email Template
 *
 * Generates HTML email content for day-before task reminders.
 * All text is in Hebrew (RTL).
 */

import { DayBeforeReminderData, TaskSummary } from '../types';

/**
 * Format date in Hebrew locale
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get assignee label in Hebrew
 */
function getAssigneeLabel(assignedTo: string, partnerNames: { partner1: string; partner2: string }): string {
  switch (assignedTo) {
    case 'partner1':
      return partnerNames.partner1;
    case 'partner2':
      return partnerNames.partner2;
    case 'both':
      return 'שניכם';
    default:
      return assignedTo;
  }
}

/**
 * Get priority color based on task status
 */
function getTaskPriorityStyle(status: string): { bgColor: string; borderColor: string } {
  switch (status) {
    case 'pending':
      return { bgColor: '#fef3c7', borderColor: '#f59e0b' };
    case 'in-progress':
      return { bgColor: '#dbeafe', borderColor: '#3b82f6' };
    default:
      return { bgColor: '#f3f4f6', borderColor: '#9ca3af' };
  }
}

/**
 * Generate task card HTML
 */
function generateTaskCard(task: TaskSummary, partnerNames: { partner1: string; partner2: string }): string {
  const priorityStyle = getTaskPriorityStyle(task.status);

  return `
    <div style="
      background-color: ${priorityStyle.bgColor};
      border-right: 4px solid ${priorityStyle.borderColor};
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    ">
      <h3 style="
        margin: 0 0 8px 0;
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
      ">
        ${task.title}
      </h3>
      <div style="
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: #6b7280;
      ">
        <span>
          <strong>קטגוריה:</strong> ${task.epicTitle}
        </span>
        <span>
          <strong>אחראי:</strong> ${getAssigneeLabel(task.assignedTo, partnerNames)}
        </span>
      </div>
    </div>
  `;
}

/**
 * Generate day-before reminder email HTML
 */
export function generateDayBeforeReminderEmail(data: DayBeforeReminderData): string {
  const { partnerNames, tasksDueTomorrow } = data;
  const taskCount = tasksDueTomorrow.length;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>תזכורת - משימות למחר</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f3f4f6;
  direction: rtl;
">
  <div style="
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  ">
    <!-- Header -->
    <div style="
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      border-radius: 12px 12px 0 0;
      padding: 30px;
      text-align: center;
    ">
      <div style="
        font-size: 48px;
        margin-bottom: 10px;
      ">
        &#x23F0;
      </div>
      <h1 style="
        color: white;
        margin: 0 0 10px 0;
        font-size: 24px;
      ">
        תזכורת: ${taskCount} ${taskCount === 1 ? 'משימה' : 'משימות'} למחר!
      </h1>
      <p style="
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 16px;
      ">
        ${formatDate(tomorrow)}
      </p>
    </div>

    <!-- Main Content -->
    <div style="
      background-color: white;
      padding: 30px;
      border-radius: 0 0 12px 12px;
    ">
      <!-- Greeting -->
      <div style="margin-bottom: 24px;">
        <p style="
          margin: 0;
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        ">
          שלום ${partnerNames.partner1} ו${partnerNames.partner2},
        </p>
        <p style="
          margin: 10px 0 0 0;
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
        ">
          רציתי להזכיר לכם שיש לכם ${taskCount === 1 ? 'משימה אחת שמיועדת' : `${taskCount} משימות שמיועדות`} למחר.
          אל תשכחו לטפל ${taskCount === 1 ? 'בה' : 'בהן'}!
        </p>
      </div>

      <!-- Task List -->
      <div style="margin-bottom: 24px;">
        <h2 style="
          color: #1f2937;
          font-size: 18px;
          margin: 0 0 16px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #f59e0b;
        ">
          ${taskCount === 1 ? 'המשימה שלכם למחר' : 'המשימות שלכם למחר'}
        </h2>
        ${tasksDueTomorrow.map(task => generateTaskCard(task, partnerNames)).join('')}
      </div>

      <!-- Tips Section -->
      <div style="
        background-color: #f0f9ff;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      ">
        <h3 style="
          margin: 0 0 12px 0;
          color: #0369a1;
          font-size: 14px;
          font-weight: 600;
        ">
          טיפים להצלחה:
        </h3>
        <ul style="
          margin: 0;
          padding: 0 20px 0 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.8;
        ">
          <li>תכננו את הזמן הדרוש לכל משימה</li>
          <li>הכינו מראש את כל מה שצריך</li>
          <li>אל תהססו לבקש עזרה אם צריך</li>
        </ul>
      </div>

      <!-- Footer CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.APP_URL || 'https://your-app.com'}/tasks" style="
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        ">
          צפייה במשימות
        </a>
      </div>

      <!-- Motivation -->
      <div style="
        text-align: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 14px;
          font-style: italic;
        ">
          &ldquo;הדרך הטובה ביותר להתחיל היא להפסיק לדבר ולהתחיל לעשות&rdquo;
        </p>
        <p style="
          margin: 8px 0 0 0;
          color: #9ca3af;
          font-size: 12px;
        ">
          - וולט דיסני
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    ">
      <p style="margin: 0 0 10px 0;">
        קיבלת מייל זה כי נרשמת לקבלת תזכורות יומיות.
      </p>
      <p style="margin: 0;">
        ניתן לבטל את ההרשמה בהגדרות החשבון.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate day-before reminder email subject
 */
export function generateDayBeforeReminderSubject(data: DayBeforeReminderData): string {
  const taskCount = data.tasksDueTomorrow.length;

  if (taskCount === 1) {
    return `תזכורת: "${data.tasksDueTomorrow[0].title}" מחר!`;
  } else {
    return `תזכורת: ${taskCount} משימות לביצוע מחר`;
  }
}
