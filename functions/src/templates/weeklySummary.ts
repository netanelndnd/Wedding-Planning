/**
 * Weekly Summary Email Template
 *
 * Generates HTML email content for weekly wedding planning summary.
 * All text is in Hebrew (RTL).
 */

import { WeeklySummaryData, TaskSummary } from '../types';

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
 * Format short date in Hebrew locale
 */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status label in Hebrew
 */
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'pending': 'ממתין',
    'in-progress': 'בביצוע',
    'completed': 'הושלם',
    'cancelled': 'בוטל',
  };
  return statusLabels[status] || status;
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
 * Generate task row HTML
 */
function generateTaskRow(task: TaskSummary, partnerNames: { partner1: string; partner2: string }): string {
  return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${task.title}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${formatShortDate(task.dueDate)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${getAssigneeLabel(task.assignedTo, partnerNames)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          background-color: ${task.status === 'completed' ? '#d1fae5' : task.status === 'in-progress' ? '#dbeafe' : '#fef3c7'};
          color: ${task.status === 'completed' ? '#065f46' : task.status === 'in-progress' ? '#1e40af' : '#92400e'};
        ">
          ${getStatusLabel(task.status)}
        </span>
      </td>
    </tr>
  `;
}

/**
 * Generate weekly summary email HTML
 */
export function generateWeeklySummaryEmail(data: WeeklySummaryData): string {
  const { partnerNames, weddingDate, daysUntilWedding, tasksThisWeek, tasksDueSoon, completedThisWeek, totalPendingTasks } = data;

  const hasTasksThisWeek = tasksThisWeek.length > 0;
  const hasTasksDueSoon = tasksDueSoon.length > 0;

  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>סיכום שבועי - תכנון החתונה</title>
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
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border-radius: 12px 12px 0 0;
      padding: 30px;
      text-align: center;
    ">
      <h1 style="
        color: white;
        margin: 0 0 10px 0;
        font-size: 28px;
      ">
        סיכום שבועי
      </h1>
      <p style="
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-size: 16px;
      ">
        החתונה של ${partnerNames.partner1} ו${partnerNames.partner2}
      </p>
    </div>

    <!-- Main Content -->
    <div style="
      background-color: white;
      padding: 30px;
      border-radius: 0 0 12px 12px;
    ">
      <!-- Wedding Countdown -->
      <div style="
        background-color: #fdf2f8;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin-bottom: 30px;
      ">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
          תאריך החתונה: ${formatDate(weddingDate)}
        </p>
        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ec4899;">
          ${daysUntilWedding > 0 ? `נותרו ${daysUntilWedding} ימים` : daysUntilWedding === 0 ? 'היום היום הגדול!' : 'מזל טוב!'}
        </p>
      </div>

      <!-- Statistics -->
      <div style="
        display: flex;
        justify-content: space-around;
        margin-bottom: 30px;
        text-align: center;
      ">
        <div style="flex: 1; padding: 15px;">
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #10b981;">
            ${completedThisWeek}
          </p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
            משימות הושלמו השבוע
          </p>
        </div>
        <div style="flex: 1; padding: 15px; border-right: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #f59e0b;">
            ${totalPendingTasks}
          </p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
            משימות ממתינות
          </p>
        </div>
      </div>

      <!-- Tasks Due This Week -->
      ${hasTasksThisWeek ? `
        <div style="margin-bottom: 30px;">
          <h2 style="
            color: #1f2937;
            font-size: 18px;
            margin: 0 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #ec4899;
          ">
            משימות לשבוע הקרוב
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">משימה</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">תאריך יעד</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">אחראי</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              ${tasksThisWeek.map(task => generateTaskRow(task, partnerNames)).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div style="
          background-color: #f0fdf4;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin-bottom: 30px;
        ">
          <p style="margin: 0; color: #166534; font-size: 16px;">
            אין משימות מתוכננות לשבוע הקרוב
          </p>
        </div>
      `}

      <!-- Upcoming Tasks (Next 2 Weeks) -->
      ${hasTasksDueSoon ? `
        <div style="margin-bottom: 30px;">
          <h2 style="
            color: #1f2937;
            font-size: 18px;
            margin: 0 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #8b5cf6;
          ">
            משימות בקרוב (14 ימים הבאים)
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">משימה</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">תאריך יעד</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">אחראי</th>
                <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              ${tasksDueSoon.map(task => generateTaskRow(task, partnerNames)).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Footer CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.APP_URL || 'https://your-app.com'}/dashboard" style="
          display: inline-block;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        ">
          צפייה בלוח הבקרה
        </a>
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
        קיבלת מייל זה כי נרשמת לקבלת תזכורות שבועיות.
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
 * Generate weekly summary email subject
 */
export function generateWeeklySummarySubject(data: WeeklySummaryData): string {
  const { daysUntilWedding, totalPendingTasks } = data;

  if (daysUntilWedding <= 7) {
    return `השבוע האחרון לפני החתונה! ${totalPendingTasks} משימות ממתינות`;
  } else if (daysUntilWedding <= 30) {
    return `נותרו ${daysUntilWedding} ימים לחתונה - סיכום שבועי`;
  } else {
    return `סיכום שבועי - תכנון החתונה (${totalPendingTasks} משימות ממתינות)`;
  }
}
