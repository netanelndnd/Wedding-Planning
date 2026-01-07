/**
 * Firebase Cloud Functions - Wedding Planning MVP
 *
 * This module exports scheduled functions for email reminders:
 * - Weekly summary emails (sent every Sunday)
 * - Day-before task reminders (sent daily)
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export scheduled functions
export { weeklyReminderSchedule } from './weeklyReminder';
export { dayBeforeReminderSchedule } from './dayBeforeReminder';
