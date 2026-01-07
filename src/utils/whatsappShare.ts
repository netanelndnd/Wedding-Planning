/**
 * WhatsApp Share Utility
 *
 * Utility functions for generating WhatsApp share links.
 * Supports sharing tasks with Hebrew text.
 */

import { Task } from '@/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Options for generating WhatsApp share message
 */
export interface WhatsAppShareOptions {
  /** Task to share */
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
 * Format a Timestamp or Date to Hebrew locale string
 */
function formatDate(date: Timestamp | Date | undefined): string {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Format currency in ILS
 */
function formatCurrency(amount: number | undefined): string {
  if (!amount) return '';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);
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
 * Generate a WhatsApp share message for a task
 *
 * @param options - Share options including task and optional context
 * @returns Formatted message string in Hebrew
 *
 * @example
 * ```ts
 * const message = generateTaskShareMessage({
 *   task: myTask,
 *   epicTitle: 'צילום ווידאו',
 *   partnerNames: { partner1: 'דני', partner2: 'מיכל' }
 * });
 * ```
 */
export function generateTaskShareMessage(options: WhatsAppShareOptions): string {
  const { task, epicTitle, partnerNames } = options;

  // Build message parts
  const parts: string[] = [];

  // Header with partner names if available
  if (partnerNames) {
    parts.push(`משימה לחתונה של ${partnerNames.partner1} ו${partnerNames.partner2}`);
  } else {
    parts.push('משימה לחתונה');
  }

  parts.push('');

  // Task title
  parts.push(`*${task.title}*`);

  // Description if available
  if (task.description) {
    parts.push(task.description);
  }

  parts.push('');

  // Details section
  if (epicTitle) {
    parts.push(`קטגוריה: ${epicTitle}`);
  }

  parts.push(`סטטוס: ${getStatusLabel(task.status)}`);

  if (task.dueDate) {
    parts.push(`תאריך יעד: ${formatDate(task.dueDate)}`);
  }

  if (task.estimatedCost || task.actualCost) {
    const costLabel = task.actualCost
      ? `עלות: ${formatCurrency(task.actualCost)}`
      : `עלות משוערת: ${formatCurrency(task.estimatedCost)}`;
    parts.push(costLabel);
  }

  return parts.join('\n');
}

/**
 * Generate a WhatsApp wa.me URL for sharing a task
 *
 * @param options - Share options including task and optional context
 * @param phoneNumber - Optional phone number to share with (without country code)
 * @returns WhatsApp share URL
 *
 * @example
 * ```ts
 * // Share without specific recipient
 * const url = generateWhatsAppLink({ task: myTask });
 * // Returns: https://wa.me/?text=...
 *
 * // Share with specific recipient
 * const url = generateWhatsAppLink({ task: myTask }, '0501234567');
 * // Returns: https://wa.me/972501234567?text=...
 * ```
 */
export function generateWhatsAppLink(
  options: WhatsAppShareOptions,
  phoneNumber?: string
): string {
  const message = generateTaskShareMessage(options);
  const encodedMessage = encodeURIComponent(message);

  if (phoneNumber) {
    // Convert Israeli phone format to international
    const internationalNumber = formatPhoneNumber(phoneNumber);
    return `https://wa.me/${internationalNumber}?text=${encodedMessage}`;
  }

  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Format Israeli phone number to international format
 *
 * @param phone - Phone number in various Israeli formats
 * @returns International format without + sign (e.g., 972501234567)
 *
 * @example
 * ```ts
 * formatPhoneNumber('050-123-4567'); // Returns: 972501234567
 * formatPhoneNumber('0501234567');   // Returns: 972501234567
 * formatPhoneNumber('+972501234567'); // Returns: 972501234567
 * ```
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle various Israeli formats
  if (cleaned.startsWith('972')) {
    // Already international format
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    // Israeli domestic format - replace leading 0 with 972
    return '972' + cleaned.substring(1);
  }

  // Return as-is if format is unknown
  return cleaned;
}

/**
 * Open WhatsApp share dialog in a new window
 *
 * @param options - Share options including task and optional context
 * @param phoneNumber - Optional phone number to share with
 *
 * @example
 * ```ts
 * openWhatsAppShare({ task: myTask, epicTitle: 'צילום' });
 * ```
 */
export function openWhatsAppShare(
  options: WhatsAppShareOptions,
  phoneNumber?: string
): void {
  const url = generateWhatsAppLink(options, phoneNumber);
  window.open(url, '_blank');
}
