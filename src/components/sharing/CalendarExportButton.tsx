'use client';

/**
 * CalendarExportButton Component
 *
 * Button component for exporting task or wedding date to calendar.
 * Downloads an ICS file that can be imported into calendar applications.
 */

import React from 'react';
import { Task } from '@/types';
import {
  exportTaskToCalendar,
  exportWeddingToCalendar,
  TaskIcsOptions,
  WeddingIcsOptions,
} from '@/utils/icsExport';
import { Button } from '@/components/ui/Button';

/**
 * Base props shared by all variants
 */
interface BaseCalendarExportProps {
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show text label or icon only */
  iconOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for task export variant
 */
interface TaskCalendarExportProps extends BaseCalendarExportProps {
  /** Export type - task */
  type: 'task';
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
 * Props for wedding date export variant
 */
interface WeddingCalendarExportProps extends BaseCalendarExportProps {
  /** Export type - wedding */
  type: 'wedding';
  /** Wedding date to export */
  weddingDate: Date;
  /** Partner names (required for wedding export) */
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
 * Union type for all CalendarExportButton props
 */
export type CalendarExportButtonProps =
  | TaskCalendarExportProps
  | WeddingCalendarExportProps;

/**
 * Calendar export button component
 *
 * @example
 * ```tsx
 * // Export task to calendar
 * <CalendarExportButton
 *   type="task"
 *   task={task}
 *   epicTitle="צילום ווידאו"
 *   size="sm"
 * />
 *
 * // Export wedding date to calendar
 * <CalendarExportButton
 *   type="wedding"
 *   weddingDate={new Date('2026-06-15')}
 *   partnerNames={{ partner1: 'דני', partner2: 'מיכל' }}
 * />
 *
 * // Icon only variant
 * <CalendarExportButton
 *   type="task"
 *   task={task}
 *   iconOnly
 * />
 * ```
 */
export function CalendarExportButton(
  props: CalendarExportButtonProps
): React.ReactElement {
  const { size = 'sm', iconOnly = false, className = '' } = props;

  /**
   * Handle export button click
   */
  const handleExport = (): void => {
    if (props.type === 'task') {
      const options: TaskIcsOptions = {
        task: props.task,
        epicTitle: props.epicTitle,
        partnerNames: props.partnerNames,
      };
      exportTaskToCalendar(options);
    } else {
      const options: WeddingIcsOptions = {
        weddingDate: props.weddingDate,
        partnerNames: props.partnerNames,
        location: props.location,
        description: props.description,
      };
      exportWeddingToCalendar(options);
    }
  };

  // Determine button label based on export type
  const buttonLabel = props.type === 'task' ? 'ליומן' : 'הוסף ליומן';
  const ariaLabel =
    props.type === 'task' ? 'הוסף משימה ליומן' : 'הוסף תאריך חתונה ליומן';

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={handleExport}
      className={`${iconOnly ? '' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'} ${className}`}
      title={ariaLabel}
      aria-label={ariaLabel}
    >
      <svg
        className={`w-4 h-4 ${iconOnly ? '' : 'me-1'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      {!iconOnly && <span>{buttonLabel}</span>}
    </Button>
  );
}

CalendarExportButton.displayName = 'CalendarExportButton';
