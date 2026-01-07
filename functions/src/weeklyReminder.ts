/**
 * Weekly Reminder Scheduled Function
 *
 * Sends weekly summary emails to couples every Sunday at 9:00 AM Israel time.
 * Includes upcoming tasks, completed tasks, and wedding countdown.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import {
  Couple,
  Task,
  Epic,
  TaskSummary,
  WeeklySummaryData,
} from './types';
import {
  generateWeeklySummaryEmail,
  generateWeeklySummarySubject,
} from './templates';

/**
 * Get start and end of current week (Sunday to Saturday)
 */
function getWeekBounds(): { startOfWeek: Date; endOfWeek: Date } {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

/**
 * Get date 14 days from now
 */
function getTwoWeeksFromNow(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Calculate days until wedding
 */
function getDaysUntilWedding(weddingDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const wedding = new Date(weddingDate);
  wedding.setHours(0, 0, 0, 0);
  const diffTime = wedding.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  // Option 1: Use Firebase Extensions - Trigger Email
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

  // Option 2: Use a third-party service like SendGrid, Mailgun, etc.
  // Uncomment and configure based on your chosen provider:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: 'noreply@your-app.com',
    subject,
    html,
  });
  */
}

/**
 * Process weekly reminder for a single couple
 */
async function processCouple(coupleId: string, couple: Couple): Promise<void> {
  const db = getFirestore();

  // Check if weekly reminders are enabled
  if (!couple.notificationPreferences?.weeklyReminder) {
    console.log(`Weekly reminders disabled for couple: ${coupleId}`);
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

  // Get week bounds and upcoming period
  const { startOfWeek, endOfWeek } = getWeekBounds();
  const twoWeeksFromNow = getTwoWeeksFromNow();

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

  // Get all tasks for this couple
  const tasksSnapshot = await db
    .collection('couples')
    .doc(coupleId)
    .collection('tasks')
    .get();

  const tasks = tasksSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];

  // Filter tasks for this week
  const tasksThisWeek = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    const dueDate = task.dueDate.toDate();
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });

  // Filter tasks due soon (next 14 days, excluding this week)
  const tasksDueSoon = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    const dueDate = task.dueDate.toDate();
    return dueDate > endOfWeek && dueDate <= twoWeeksFromNow;
  });

  // Count completed tasks this week
  const completedThisWeek = tasks.filter((task) => {
    if (task.status !== 'completed' || !task.updatedAt) {
      return false;
    }
    const updatedDate = task.updatedAt.toDate();
    return updatedDate >= startOfWeek && updatedDate <= endOfWeek;
  }).length;

  // Count total pending tasks
  const totalPendingTasks = tasks.filter(
    (task) => task.status === 'pending' || task.status === 'in-progress'
  ).length;

  // Prepare email data
  const weddingDate = couple.weddingDate.toDate();
  const daysUntilWedding = getDaysUntilWedding(weddingDate);

  const summaryData: WeeklySummaryData = {
    partnerNames: {
      partner1: couple.partner1Name,
      partner2: couple.partner2Name,
    },
    weddingDate,
    daysUntilWedding,
    tasksThisWeek: tasksThisWeek
      .map((task) => taskToSummary(task, epicsMap.get(task.epicId) || 'כללי'))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    tasksDueSoon: tasksDueSoon
      .map((task) => taskToSummary(task, epicsMap.get(task.epicId) || 'כללי'))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    completedThisWeek,
    totalPendingTasks,
  };

  // Generate and send email
  const subject = generateWeeklySummarySubject(summaryData);
  const html = generateWeeklySummaryEmail(summaryData);

  await sendEmail(userEmail, subject, html);
  console.log(`Weekly summary sent to couple: ${coupleId}`);
}

/**
 * Weekly reminder scheduled function
 * Runs every Sunday at 9:00 AM Israel time (Asia/Jerusalem)
 */
export const weeklyReminderSchedule = onSchedule(
  {
    schedule: '0 9 * * 0', // Every Sunday at 9:00 AM
    timeZone: 'Asia/Jerusalem',
    retryCount: 3,
  },
  async (_event) => {
    console.log('Starting weekly reminder job...');

    const db = getFirestore();

    try {
      // Get all couples with weekly reminders enabled
      const couplesSnapshot = await db
        .collection('couples')
        .where('notificationPreferences.weeklyReminder', '==', true)
        .get();

      console.log(`Found ${couplesSnapshot.size} couples with weekly reminders enabled`);

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

      console.log('Weekly reminder job completed successfully');
    } catch (error) {
      console.error('Error in weekly reminder job:', error);
      throw error;
    }
  }
);
