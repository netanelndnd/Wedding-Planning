'use client';

/**
 * TaskForm Component
 *
 * Modal form for creating and editing tasks.
 * Includes validation and all task fields.
 */

import React, { useState, useEffect } from 'react';
import {
  Task,
  Epic,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  AssignedTo,
} from '@/types';
import { TASK_STATUS_LABELS, ASSIGNED_TO_LABELS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

/**
 * TaskForm component props
 */
export interface TaskFormProps {
  /** Editing mode - provide task to edit, null for create */
  task?: Task | null;
  /** Available epics for selection */
  epics: Epic[];
  /** Called when form is submitted */
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Show/hide modal */
  isOpen: boolean;
}

/**
 * Task form component for create/edit
 *
 * @example
 * ```tsx
 * <TaskForm
 *   task={editingTask}
 *   epics={epics}
 *   isOpen={isModalOpen}
 *   onSubmit={handleSubmit}
 *   onCancel={() => setIsModalOpen(false)}
 * />
 * ```
 */
export function TaskForm({
  task,
  epics,
  onSubmit,
  onCancel,
  isOpen,
}: TaskFormProps): React.ReactElement | null {
  const isEditMode = !!task;

  // Form state
  const [formData, setFormData] = useState<CreateTaskData>({
    epicId: '',
    title: '',
    description: '',
    dueDate: undefined,
    assignedTo: 'both',
    estimatedCost: undefined,
    actualCost: undefined,
    status: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        epicId: task.epicId,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.toDate() : undefined,
        assignedTo: task.assignedTo,
        estimatedCost: task.estimatedCost,
        actualCost: task.actualCost,
        status: task.status,
        notes: task.notes || '',
      });
    } else {
      // Reset for new task
      setFormData({
        epicId: epics[0]?.id || '',
        title: '',
        description: '',
        dueDate: undefined,
        assignedTo: 'both',
        estimatedCost: undefined,
        actualCost: undefined,
        status: 'pending',
        notes: '',
      });
    }
    setErrors({});
  }, [task, epics, isOpen]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'נא להזין כותרת';
    }
    if (!formData.epicId) {
      newErrors.epicId = 'נא לבחור קטגוריה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Clean up data - remove empty strings and undefined values
      const cleanData: CreateTaskData | UpdateTaskData = {
        ...formData,
        description: formData.description?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      await onSubmit(cleanData);
      onCancel(); // Close modal on success
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const modalTitleId = 'task-form-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id={modalTitleId} className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'עריכת משימה' : 'הוספת משימה חדשה'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="סגור"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <Input
            label="כותרת *"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={errors.title}
            placeholder="לדוגמה: הזמנת צלם"
          />

          {/* Epic (Category) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-epic" className="text-sm font-medium text-gray-700">
              קטגוריה *
            </label>
            <select
              id="task-epic"
              value={formData.epicId}
              onChange={(e) =>
                setFormData({ ...formData, epicId: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={errors.epicId ? 'true' : 'false'}
              aria-describedby={errors.epicId ? 'task-epic-error' : undefined}
            >
              <option value="">בחר קטגוריה</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.icon} {epic.title}
                </option>
              ))}
            </select>
            {errors.epicId && (
              <p id="task-epic-error" className="text-sm text-red-600" role="alert">{errors.epicId}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-description" className="text-sm font-medium text-gray-700">תיאור</label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="תיאור המשימה..."
            />
          </div>

          {/* Assigned To */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-assigned" className="text-sm font-medium text-gray-700">אחראי</label>
            <select
              id="task-assigned"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assignedTo: e.target.value as AssignedTo,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(ASSIGNED_TO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <Input
            label="תאריך יעד"
            type="date"
            value={
              formData.dueDate
                ? formData.dueDate.toISOString().split('T')[0]
                : ''
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                dueDate: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />

          {/* Estimated Cost */}
          <Input
            label="עלות משוערת (₪)"
            type="number"
            min="0"
            step="1"
            value={formData.estimatedCost ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                estimatedCost: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="0"
          />

          {/* Actual Cost */}
          <Input
            label="עלות בפועל (₪)"
            type="number"
            min="0"
            step="1"
            value={formData.actualCost ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                actualCost: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="0"
          />

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-status" className="text-sm font-medium text-gray-700">סטטוס</label>
            <select
              id="task-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as TaskStatus,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-notes" className="text-sm font-medium text-gray-700">הערות</label>
            <textarea
              id="task-notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="הערות נוספות..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isEditMode ? 'שמור שינויים' : 'הוסף משימה'}
          </Button>
        </div>
      </div>
    </div>
  );
}

TaskForm.displayName = 'TaskForm';
