/**
 * Day-Before Reminder Scheduled Function
 *
 * Sends reminder emails for tasks due tomorrow.
 * Runs daily at 6:00 PM Israel time.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import {
  Couple,
  Task,
  Epic,
  TaskSummary,
  DayBeforeReminderData,
} from './types';
import {
  generateDayBeforeReminderEmail,
  generateDayBeforeReminderSubject,
} from './templates';

/**
 * Get tomorrow's date range (start and end of day)
 */
function getTomorrowBounds(): { startOfTomorrow: Date; endOfTomorrow: Date } {
  const now = new Date();

  const startOfTomorrow = new Date(now);
  startOfTomorrow.setDate(now.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(startOfTomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  return { startOfTomorrow, endOfTomorrow };
}

/**
 * Convert Firestore task to TaskSummary
 */
function taskToSummary(task: Task, epicTitle: string): TaskSummary {
  return {
    title: task.title,
    dueDate: task.dueDate ? task.dueDate.toDate() : new Date(),
    status: task.status,
    assignedTo: task.assignedTo,
    epicTitle,
  };
}

/**
 * Send email using Firebase Extensions or custom email service
 * Note: This is a placeholder - integrate with your preferred email service
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  // Use Firebase Extensions - Trigger Email
  // This requires setting up the "Trigger Email" extension
  // and writing to a 'mail' collection

  const db = getFirestore();
  await db.collection('mail').add({
    to,
    message: {
      subject,
      html,
    },
    createdAt: Timestamp.now(),
  });

  console.log(`Email queued for: ${to}, Subject: ${subject}`);
}

/**
 * Process day-before reminder for a single couple
 */
async function processCouple(coupleId: string, couple: Couple): Promise<void> {
  const db = getFirestore();

  // Check if day-before reminders are enabled
  if (!couple.notificationPreferences?.dayBeforeReminder) {
    console.log(`Day-before reminders disabled for couple: ${coupleId}`);
    return;
  }

  // Get user email from Firebase Auth
  const auth = getAuth();
  let userEmail: string;
  try {
    const userRecord = await auth.getUser(coupleId);
    userEmail = couple.notificationPreferences?.notificationEmail || userRecord.email || '';
    if (!userEmail) {
      console.log(`No email found for couple: ${coupleId}`);
      return;
    }
  } catch (error) {
    console.error(`Failed to get user email for couple: ${coupleId}`, error);
    return;
  }

  // Get tomorrow's bounds
  const { startOfTomorrow, endOfTomorrow } = getTomorrowBounds();

  // Get all epics for this couple
  const epicsSnapshot = await db
    .collection('couples')
    .doc(coupleId)
    .collection('epics')
    .get();

  const epicsMap = new Map<string, string>();
  epicsSnapshot.docs.forEach((doc) => {
    const epic = doc.data() as Epic;
    epicsMap.set(doc.id, epic.title);
  });

  // Get tasks due tomorrow
  const tasksSnapshot = await db
    .collection('couples')
    .doc(coupleId)
    .collection('tasks')
    .where('status', 'in', ['pending', 'in-progress'])
    .get();

  const allTasks = tasksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];

  // Filter tasks due tomorrow
  const tasksDueTomorrow = allTasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }
    const dueDate = task.dueDate.toDate();
    return dueDate >= startOfTomorrow && dueDate <= endOfTomorrow;
  });

  // If no tasks due tomorrow, skip
  if (tasksDueTomorrow.length === 0) {
    console.log(`No tasks due tomorrow for couple: ${coupleId}`);
    return;
  }

  // Prepare email data
  const reminderData: DayBeforeReminderData = {
    partnerNames: {
      partner1: couple.partner1Name,
      partner2: couple.partner2Name,
    },
    tasksDueTomorrow: tasksDueTomorrow
      .map((task) => taskToSummary(task, epicsMap.get(task.epicId) || 'כללי'))
      .sort((a, b) => a.title.localeCompare(b.title, 'he')),
  };

  // Generate and send email
  const subject = generateDayBeforeReminderSubject(reminderData);
  const html = generateDayBeforeReminderEmail(reminderData);

  await sendEmail(userEmail, subject, html);
  console.log(`Day-before reminder sent to couple: ${coupleId}, Tasks: ${tasksDueTomorrow.length}`);
}

/**
 * Day-before reminder scheduled function
 * Runs every day at 6:00 PM Israel time (Asia/Jerusalem)
 */
export const dayBeforeReminderSchedule = onSchedule(
  {
    schedule: '0 18 * * *', // Every day at 6:00 PM
    timeZone: 'Asia/Jerusalem',
    retryCount: 3,
  },
  async (_event) => {
    console.log('Starting day-before reminder job...');

    const db = getFirestore();

    try {
      // Get all couples with day-before reminders enabled
      const couplesSnapshot = await db
        .collection('couples')
        .where('notificationPreferences.dayBeforeReminder', '==', true)
        .get();

      console.log(`Found ${couplesSnapshot.size} couples with day-before reminders enabled`);

      // Process each couple
      const promises = couplesSnapshot.docs.map(async (doc) => {
        const couple = { id: doc.id, ...doc.data() } as Couple;
        try {
          await processCouple(doc.id, couple);
        } catch (error) {
          console.error(`Error processing couple ${doc.id}:`, error);
        }
      });

      await Promise.all(promises);

      console.log('Day-before reminder job completed successfully');
    } catch (error) {
      console.error('Error in day-before reminder job:', error);
      throw error;
    }
  }
);
