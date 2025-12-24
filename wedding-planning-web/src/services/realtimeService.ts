import { ref, set, update, remove, get, onValue, off, push, DatabaseReference } from 'firebase/database';
import { rtdb, isMockMode } from '@/lib/firebase';
import { Task, TaskStatus, Epic, Vendor, Guest } from '@/types';

// Mock Data Store (In-Memory for session)
let mockTasks: Task[] = [];
let mockEpics: Epic[] = [];
let mockGuests: Guest[] = [];
let mockVendors: Vendor[] = [];

/**
 * Realtime Database Service
 * -------------------------
 * This service uses Firebase Realtime Database instead of Firestore.
 * Data structure in Realtime Database:
 * {
 *   users: {
 *     {userId}: {
 *       couples: { ... },
 *       tasks: { taskId: { ... } },
 *       epics: { epicId: { ... } },
 *       guests: { guestId: { ... } },
 *       vendors: { vendorId: { ... } }
 *     }
 *   }
 * }
 */

// Helper function to get user path
const getUserPath = (userId: string) => `users/${userId}`;

// Helper function to convert Date to timestamp
const dateToTimestamp = (date: Date | null | undefined): number | null => {
  if (!date) return null;
  return date.getTime();
};

// Helper function to convert timestamp to Date
const timestampToDate = (timestamp: number | null | undefined): Date | null => {
  if (!timestamp) return null;
  return new Date(timestamp);
};

// Task Services
export const taskService = {
  async addTask(coupleId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode || !rtdb) {
      const newTask = {
        ...task,
        id: `mock-task-${Date.now()}`,
        coupleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task;
      mockTasks.push(newTask);
      return newTask.id;
    }

    try {
      const tasksRef = ref(rtdb, `${getUserPath(coupleId)}/tasks`);
      const newTaskRef = push(tasksRef);
      const taskId = newTaskRef.key!;

      await set(newTaskRef, {
        ...task,
        id: taskId,
        coupleId,
        dueDate: dateToTimestamp(task.dueDate || null),
        completedAt: dateToTimestamp(task.completedAt || null),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return taskId;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    if (isMockMode || !rtdb) {
      mockTasks = mockTasks.map(t => 
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t
      );
      return;
    }

    try {
      // Find the task's coupleId first
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        throw new Error('No users found');
      }

      const users = snapshot.val();
      let taskRef: DatabaseReference | null = null;
      let coupleId: string | null = null;

      // Search for the task in all users
      for (const userId in users) {
        const userTasksRef = ref(rtdb, `${getUserPath(userId)}/tasks/${taskId}`);
        const taskSnapshot = await get(userTasksRef);
        if (taskSnapshot.exists()) {
          taskRef = userTasksRef;
          coupleId = userId;
          break;
        }
      }

      if (!taskRef || !coupleId) {
        throw new Error('Task not found');
      }

      const processedUpdates: any = {
        ...updates,
        updatedAt: Date.now(),
      };

      if (updates.dueDate) {
        processedUpdates.dueDate = dateToTimestamp(updates.dueDate);
      }
      if (updates.completedAt) {
        processedUpdates.completedAt = dateToTimestamp(updates.completedAt);
      }

      await update(taskRef, processedUpdates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string) {
    if (isMockMode || !rtdb) {
      mockTasks = mockTasks.filter(t => t.id !== taskId);
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      // Find and delete the task
      for (const userId in users) {
        const taskRef = ref(rtdb, `${getUserPath(userId)}/tasks/${taskId}`);
        const taskSnapshot = await get(taskRef);
        if (taskSnapshot.exists()) {
          await remove(taskRef);
          return;
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  subscribeToTasks(coupleId: string, callback: (tasks: Task[]) => void) {
    if (isMockMode || !rtdb) {
      callback(mockTasks);
      return () => {};
    }

    const tasksRef = ref(rtdb, `${getUserPath(coupleId)}/tasks`);
    
    const listener = onValue(tasksRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const tasksData = snapshot.val();
      const tasks: Task[] = Object.keys(tasksData).map((key) => {
        const task = tasksData[key];
        return {
          ...task,
          id: key,
          dueDate: timestampToDate(task.dueDate),
          completedAt: timestampToDate(task.completedAt),
          createdAt: timestampToDate(task.createdAt) || new Date(),
          updatedAt: timestampToDate(task.updatedAt) || new Date(),
        } as Task;
      });

      callback(tasks);
    }, (error) => {
      console.error('Error subscribing to tasks:', error);
      callback([]);
    });

    // Return unsubscribe function
    return () => {
      off(tasksRef, 'value', listener);
    };
  },

  async changeTaskStatus(taskId: string, status: TaskStatus) {
    await this.updateTask(taskId, {
      status,
      ...(status === 'completed' && { completedAt: new Date() }),
    });
  },
};

// Epic Services
export const epicService = {
  async addEpic(coupleId: string, epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode || !rtdb) {
      const newEpic = {
        ...epic,
        id: `mock-epic-${Date.now()}`,
        coupleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Epic;
      mockEpics.push(newEpic);
      return newEpic.id;
    }

    try {
      const epicsRef = ref(rtdb, `${getUserPath(coupleId)}/epics`);
      const newEpicRef = push(epicsRef);
      const epicId = newEpicRef.key!;

      await set(newEpicRef, {
        ...epic,
        id: epicId,
        coupleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return epicId;
    } catch (error) {
      console.error('Error adding epic:', error);
      throw error;
    }
  },

  subscribeToEpics(coupleId: string, callback: (epics: Epic[]) => void) {
    if (isMockMode || !rtdb) {
      callback(mockEpics.sort((a, b) => a.order - b.order));
      return () => {};
    }

    const epicsRef = ref(rtdb, `${getUserPath(coupleId)}/epics`);
    
    const listener = onValue(epicsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const epicsData = snapshot.val();
      const epics: Epic[] = Object.keys(epicsData).map((key) => {
        const epic = epicsData[key];
        return {
          ...epic,
          id: key,
          createdAt: timestampToDate(epic.createdAt) || new Date(),
          updatedAt: timestampToDate(epic.updatedAt) || new Date(),
        } as Epic;
      });

      callback(epics.sort((a, b) => a.order - b.order));
    }, (error) => {
      console.error('Error subscribing to epics:', error);
      callback([]);
    });

    return () => {
      off(epicsRef, 'value', listener);
    };
  },

  async updateEpic(epicId: string, updates: Partial<Epic>) {
    if (isMockMode || !rtdb) {
      mockEpics = mockEpics.map(e => 
        e.id === epicId ? { ...e, ...updates, updatedAt: new Date() } : e
      );
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      for (const userId in users) {
        const epicRef = ref(rtdb, `${getUserPath(userId)}/epics/${epicId}`);
        const epicSnapshot = await get(epicRef);
        if (epicSnapshot.exists()) {
          await update(epicRef, {
            ...updates,
            updatedAt: Date.now(),
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error updating epic:', error);
      throw error;
    }
  },

  async deleteEpic(epicId: string) {
    if (isMockMode || !rtdb) {
      mockEpics = mockEpics.filter(e => e.id !== epicId);
      // Also delete related tasks
      mockTasks = mockTasks.filter(t => t.epicId !== epicId);
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      for (const userId in users) {
        const epicRef = ref(rtdb, `${getUserPath(userId)}/epics/${epicId}`);
        const epicSnapshot = await get(epicRef);
        if (epicSnapshot.exists()) {
          // Delete epic
          await remove(epicRef);
          
          // Delete related tasks
          const tasksRef = ref(rtdb, `${getUserPath(userId)}/tasks`);
          const tasksSnapshot = await get(tasksRef);
          if (tasksSnapshot.exists()) {
            const tasks = tasksSnapshot.val();
            const deletePromises = Object.keys(tasks)
              .filter(key => tasks[key].epicId === epicId)
              .map(key => remove(ref(rtdb, `${getUserPath(userId)}/tasks/${key}`)));
            await Promise.all(deletePromises);
          }
          return;
        }
      }
    } catch (error) {
      console.error('Error deleting epic:', error);
      throw error;
    }
  },
};

// Guest Services
export const guestService = {
  async addGuest(coupleId: string, guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode || !rtdb) {
      const newGuest = {
        ...guest,
        id: `mock-guest-${Date.now()}`,
        coupleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Guest;
      mockGuests.push(newGuest);
      return newGuest.id;
    }

    try {
      const guestsRef = ref(rtdb, `${getUserPath(coupleId)}/guests`);
      const newGuestRef = push(guestsRef);
      const guestId = newGuestRef.key!;

      await set(newGuestRef, {
        ...guest,
        id: guestId,
        coupleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return guestId;
    } catch (error) {
      console.error('Error adding guest:', error);
      throw error;
    }
  },

  subscribeToGuests(coupleId: string, callback: (guests: Guest[]) => void) {
    if (isMockMode || !rtdb) {
      callback(mockGuests);
      return () => {};
    }

    const guestsRef = ref(rtdb, `${getUserPath(coupleId)}/guests`);
    
    const listener = onValue(guestsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const guestsData = snapshot.val();
      const guests: Guest[] = Object.keys(guestsData).map((key) => {
        const guest = guestsData[key];
        return {
          ...guest,
          id: key,
          createdAt: timestampToDate(guest.createdAt) || new Date(),
          updatedAt: timestampToDate(guest.updatedAt) || new Date(),
        } as Guest;
      });

      callback(guests);
    }, (error) => {
      console.error('Error subscribing to guests:', error);
      callback([]);
    });

    return () => {
      off(guestsRef, 'value', listener);
    };
  },

  async updateGuest(guestId: string, updates: Partial<Guest>) {
    if (isMockMode || !rtdb) {
      mockGuests = mockGuests.map(g => 
        g.id === guestId ? { ...g, ...updates, updatedAt: new Date() } : g
      );
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      for (const userId in users) {
        const guestRef = ref(rtdb, `${getUserPath(userId)}/guests/${guestId}`);
        const guestSnapshot = await get(guestRef);
        if (guestSnapshot.exists()) {
          await update(guestRef, {
            ...updates,
            updatedAt: Date.now(),
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  },

  async deleteGuest(guestId: string) {
    if (isMockMode || !rtdb) {
      mockGuests = mockGuests.filter(g => g.id !== guestId);
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      for (const userId in users) {
        const guestRef = ref(rtdb, `${getUserPath(userId)}/guests/${guestId}`);
        const guestSnapshot = await get(guestRef);
        if (guestSnapshot.exists()) {
          await remove(guestRef);
          return;
        }
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  },
};

// Vendor Services
export const vendorService = {
  async addVendor(coupleId: string, vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode || !rtdb) {
      const newVendor = {
        ...vendor,
        id: `mock-vendor-${Date.now()}`,
        coupleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Vendor;
      mockVendors.push(newVendor);
      return newVendor.id;
    }

    try {
      const vendorsRef = ref(rtdb, `${getUserPath(coupleId)}/vendors`);
      const newVendorRef = push(vendorsRef);
      const vendorId = newVendorRef.key!;

      await set(newVendorRef, {
        ...vendor,
        id: vendorId,
        coupleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return vendorId;
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  },

  subscribeToVendors(coupleId: string, callback: (vendors: Vendor[]) => void) {
    if (isMockMode || !rtdb) {
      callback(mockVendors);
      return () => {};
    }

    const vendorsRef = ref(rtdb, `${getUserPath(coupleId)}/vendors`);
    
    const listener = onValue(vendorsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const vendorsData = snapshot.val();
      const vendors: Vendor[] = Object.keys(vendorsData).map((key) => {
        const vendor = vendorsData[key];
        return {
          ...vendor,
          id: key,
          createdAt: timestampToDate(vendor.createdAt) || new Date(),
          updatedAt: timestampToDate(vendor.updatedAt) || new Date(),
        } as Vendor;
      });

      callback(vendors);
    }, (error) => {
      console.error('Error subscribing to vendors:', error);
      callback([]);
    });

    return () => {
      off(vendorsRef, 'value', listener);
    };
  },

  async updateVendor(vendorId: string, updates: Partial<Vendor>) {
    if (isMockMode || !rtdb) {
      mockVendors = mockVendors.map(v => 
        v.id === vendorId ? { ...v, ...updates, updatedAt: new Date() } : v
      );
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      for (const userId in users) {
        const vendorRef = ref(rtdb, `${getUserPath(userId)}/vendors/${vendorId}`);
        const vendorSnapshot = await get(vendorRef);
        if (vendorSnapshot.exists()) {
          await update(vendorRef, {
            ...updates,
            updatedAt: Date.now(),
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  async deleteVendor(vendorId: string) {
    if (isMockMode || !rtdb) {
      mockVendors = mockVendors.filter(v => v.id !== vendorId);
      return;
    }

    try {
      const allUsersRef = ref(rtdb, 'users');
      const snapshot = await get(allUsersRef);
      
      if (!snapshot.exists()) {
        return;
      }

      const users = snapshot.val();
      
      for (const userId in users) {
        const vendorRef = ref(rtdb, `${getUserPath(userId)}/vendors/${vendorId}`);
        const vendorSnapshot = await get(vendorRef);
        if (vendorSnapshot.exists()) {
          await remove(vendorRef);
          return;
        }
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  },
};

// Couple Service (for saving couple data)
export const coupleService = {
  async saveCouple(userId: string, coupleData: {
    partner1Name: string;
    partner2Name: string;
    weddingDate: Date | null;
  }) {
    if (isMockMode || !rtdb) {
      return;
    }

    try {
      const coupleRef = ref(rtdb, `${getUserPath(userId)}/couple`);
      await set(coupleRef, {
        ...coupleData,
        weddingDate: dateToTimestamp(coupleData.weddingDate),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error saving couple:', error);
      throw error;
    }
  },

  async getCouple(userId: string) {
    if (isMockMode || !rtdb) {
      return null;
    }

    try {
      const coupleRef = ref(rtdb, `${getUserPath(userId)}/couple`);
      const snapshot = await get(coupleRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.val();
      return {
        ...data,
        weddingDate: timestampToDate(data.weddingDate),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      };
    } catch (error) {
      console.error('Error getting couple:', error);
      return null;
    }
  },
};

