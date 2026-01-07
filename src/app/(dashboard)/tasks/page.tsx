'use client';

/**
 * Tasks Page
 *
 * Main page for task management with category grouping and partner filtering.
 * Includes create/edit task functionality and real-time updates.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { useTasks } from '@/hooks/useTasks';
import { useEpics } from '@/hooks/useEpics';
import {
  TaskList,
  TaskForm,
  CategoryList,
} from '@/components/tasks';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types';

/**
 * Tasks page component
 */
export default function TasksPage(): React.ReactElement {
  const { user } = useAuth();
  const { selectedPartner } = usePartner();
  const coupleId = user?.uid || null;

  // Hooks
  const { epics, loading: epicsLoading, createDefaultEpics } = useEpics(coupleId);
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } =
    useTasks(coupleId);

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);

  // Filter tasks by partner and selected epic
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by partner
    if (selectedPartner !== 'both') {
      filtered = filtered.filter(
        (task) =>
          task.assignedTo === selectedPartner || task.assignedTo === 'both'
      );
    }

    // Filter by selected epic
    if (selectedEpicId) {
      filtered = filtered.filter((task) => task.epicId === selectedEpicId);
    }

    return filtered;
  }, [tasks, selectedPartner, selectedEpicId]);

  // Handle create default epics
  const handleCreateDefaults = async () => {
    setIsCreatingDefaults(true);
    await createDefaultEpics();
    setIsCreatingDefaults(false);
  };

  // Handle open create form
  const handleOpenCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Handle open edit form
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    if (editingTask) {
      // Update existing task
      await updateTask(editingTask.id, data as UpdateTaskData);
    } else {
      // Create new task
      await createTask(data as CreateTaskData);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Handle delete
  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  // Loading state
  if (epicsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No epics state - show create defaults button
  if (epics.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ניהול משימות
          </h1>
          <p className="text-gray-600 mb-6">
            לפני שתוכל להוסיף משימות, עליך ליצור קטגוריות
          </p>
          <Button
            variant="primary"
            onClick={handleCreateDefaults}
            loading={isCreatingDefaults}
          >
            צור 10 קטגוריות ברירת מחדל
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול משימות</h1>
          <p className="text-gray-600 mt-1">
            נהל את כל המשימות שלך לחתונה במקום אחד
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateForm}>
          ➕ הוסף משימה
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Category List */}
        <div className="lg:col-span-1">
          <CategoryList
            epics={epics}
            tasks={tasks}
            selectedEpicId={selectedEpicId}
            onSelectEpic={setSelectedEpicId}
          />
        </div>

        {/* Main - Task List */}
        <div className="lg:col-span-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">
                {selectedEpicId
                  ? 'אין משימות בקטגוריה זו'
                  : selectedPartner !== 'both'
                  ? 'אין משימות עבור בן/בת זוג זה'
                  : 'אין משימות'}
              </p>
              <Button variant="primary" onClick={handleOpenCreateForm}>
                הוסף משימה ראשונה
              </Button>
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              epics={epics}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        epics={epics}
        isOpen={isFormOpen}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}
