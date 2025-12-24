import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, isMockMode } from '@/lib/firebase';
import { Task, TaskStatus, Epic, Vendor, Guest } from '@/types';

// Mock Data Store (In-Memory for session)
let mockTasks: Task[] = [
  {
    id: 'task-1',
    coupleId: 'mock-user-123',
    epicId: 'epic-1',
    title: 'לבחור אולם',
    category: 'venue',
    priority: 'high',
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    coupleId: 'mock-user-123',
    epicId: 'epic-1',
    title: 'לסגור דיג׳יי',
    category: 'music',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

let mockEpics: Epic[] = [
  {
    id: 'epic-1',
    coupleId: 'mock-user-123',
    title: 'ארגונים ראשוניים',
    category: 'general',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Task Services
export const taskService = {
  async addTask(coupleId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode) {
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

    const tasksCollection = collection(db, 'tasks');
    const docRef = await addDoc(tasksCollection, {
      ...task,
      dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    if (isMockMode) {
      mockTasks = mockTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      return;
    }

    const taskRef = doc(db, 'tasks', taskId);
    const processedUpdates: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    if (updates.dueDate) {
      processedUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.completedAt) {
      processedUpdates.completedAt = Timestamp.fromDate(updates.completedAt);
    }
    await updateDoc(taskRef, processedUpdates);
  },

  async deleteTask(taskId: string) {
    if (isMockMode) {
      mockTasks = mockTasks.filter(t => t.id !== taskId);
      return;
    }
    await deleteDoc(doc(db, 'tasks', taskId));
  },

  subscribeToTasks(coupleId: string, callback: (tasks: Task[]) => void) {
    if (isMockMode) {
      // Return initial mock data
      callback(mockTasks);
      // Mock subscription - in a real mock we'd use an event emitter, 
      // but for simple demo this is static unless we poll.
      // We'll just return a no-op unsubscribe.
      return () => {};
    }

    const q = query(collection(db, 'tasks'), where('coupleId', '==', coupleId));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate?.toDate?.() || data.dueDate,
          completedAt: data.completedAt?.toDate?.() || data.completedAt,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Task;
      });
      callback(tasks);
    });
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
    if (isMockMode) {
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

    const epicsCollection = collection(db, 'epics');
    const docRef = await addDoc(epicsCollection, {
      ...epic,
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  subscribeToEpics(coupleId: string, callback: (epics: Epic[]) => void) {
    if (isMockMode) {
      callback(mockEpics.sort((a, b) => a.order - b.order));
      return () => {};
    }

    const q = query(collection(db, 'epics'), where('coupleId', '==', coupleId));
    return onSnapshot(q, (snapshot) => {
      const epics = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Epic;
      });
      callback(epics.sort((a, b) => a.order - b.order));
    });
  },

  async updateEpic(epicId: string, updates: Partial<Epic>) {
    if (isMockMode) return; // Not implemented for mock
    const epicRef = doc(db, 'epics', epicId);
    await updateDoc(epicRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteEpic(epicId: string) {
    if (isMockMode) return; // Not implemented for mock
    const batch = writeBatch(db);
    batch.delete(doc(db, 'epics', epicId));
    const tasksQuery = query(collection(db, 'tasks'), where('epicId', '==', epicId));
    const taskDocs = await getDocs(tasksQuery);
    taskDocs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },
};

// Vendor Services
export const vendorService = {
  async addVendor(coupleId: string, vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode) return 'mock-vendor-id'; 
    const vendorsCollection = collection(db, 'vendors');
    const docRef = await addDoc(vendorsCollection, {
      ...vendor,
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  subscribeToVendors(coupleId: string, callback: (vendors: Vendor[]) => void) {
    if (isMockMode) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, 'vendors'), where('coupleId', '==', coupleId));
    return onSnapshot(q, (snapshot) => {
      const vendors = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Vendor;
      });
      callback(vendors);
    });
  },

  async updateVendor(vendorId: string, updates: Partial<Vendor>) {
    if (isMockMode) return;
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteVendor(vendorId: string) {
    if (isMockMode) return;
    await deleteDoc(doc(db, 'vendors', vendorId));
  },
};

// Guest Services
export const guestService = {
  async addGuest(coupleId: string, guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode) return 'mock-guest-id';
    const guestsCollection = collection(db, 'guests');
    const docRef = await addDoc(guestsCollection, {
      ...guest,
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  subscribeToGuests(coupleId: string, callback: (guests: Guest[]) => void) {
    if (isMockMode) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, 'guests'), where('coupleId', '==', coupleId));
    return onSnapshot(q, (snapshot) => {
      const guests = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Guest;

        //כככ
      });
      callback(guests);
    });
  },

  async updateGuest(guestId: string, updates: Partial<Guest>) {
    if (isMockMode) return;
    const guestRef = doc(db, 'guests', guestId);
    await updateDoc(guestRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteGuest(guestId: string) {
    if (isMockMode) return;
    await deleteDoc(doc(db, 'guests', guestId));
  },
};
