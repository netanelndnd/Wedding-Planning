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
    epicId: 'epic-1111',
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

    // Remove undefined values - Firestore doesn't allow undefined
    const cleanTask: any = {
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(task).forEach(key => {
      const value = (task as any)[key];
      if (value !== undefined) {
        // Handle Date objects - convert to Timestamp
        if (key === 'dueDate' && value instanceof Date) {
          cleanTask[key] = Timestamp.fromDate(value);
        } else if (key === 'completedAt' && value instanceof Date) {
          cleanTask[key] = Timestamp.fromDate(value);
        } else {
          cleanTask[key] = value;
        }
      }
    });
    
    const tasksCollection = collection(db, 'tasks');
    const docRef = await addDoc(tasksCollection, cleanTask);
    return docRef.id;
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    if (isMockMode) {
      mockTasks = mockTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      return;
    }

    // Remove undefined values - Firestore doesn't allow undefined
    const cleanUpdates: any = {
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        // Handle Date objects - convert to Timestamp
        if (key === 'dueDate' && value instanceof Date) {
          cleanUpdates[key] = Timestamp.fromDate(value);
        } else if (key === 'completedAt' && value instanceof Date) {
          cleanUpdates[key] = Timestamp.fromDate(value);
        } else {
          cleanUpdates[key] = value;
        }
      }
    });
    
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, cleanUpdates);
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

    // Remove undefined values - Firestore doesn't allow undefined
    const cleanEpic: any = {
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(epic).forEach(key => {
      const value = (epic as any)[key];
      if (value !== undefined) {
        cleanEpic[key] = value;
      }
    });
    
    const epicsCollection = collection(db, 'epics');
    const docRef = await addDoc(epicsCollection, cleanEpic);
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
    
    // Remove undefined values - Firestore doesn't allow undefined
    const cleanUpdates: any = {
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    const epicRef = doc(db, 'epics', epicId);
    await updateDoc(epicRef, cleanUpdates);
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
    
    // Remove undefined values - Firestore doesn't allow undefined
    const cleanVendor: any = {
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(vendor).forEach(key => {
      const value = (vendor as any)[key];
      if (value !== undefined) {
        cleanVendor[key] = value;
      }
    });
    
    const vendorsCollection = collection(db, 'vendors');
    const docRef = await addDoc(vendorsCollection, cleanVendor);
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
    
    // Remove undefined values - Firestore doesn't allow undefined
    const cleanUpdates: any = {
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, cleanUpdates);
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
    
    // Remove undefined values - Firestore doesn't allow undefined
    const cleanGuest: any = {
      coupleId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(guest).forEach(key => {
      const value = (guest as any)[key];
      if (value !== undefined) {
        cleanGuest[key] = value;
      }
    });
    
    const guestsCollection = collection(db, 'guests');
    const docRef = await addDoc(guestsCollection, cleanGuest);
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

        
      });
      callback(guests);
    });
  },

  async updateGuest(guestId: string, updates: Partial<Guest>) {
    if (isMockMode) return;
    
    // Remove undefined values - Firestore doesn't allow undefined
    const cleanUpdates: any = {
      updatedAt: Timestamp.now(),
    };
    
    // Only include fields that are not undefined
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    const guestRef = doc(db, 'guests', guestId);
    await updateDoc(guestRef, cleanUpdates);
  },

  async deleteGuest(guestId: string) {
    if (isMockMode) return;
    await deleteDoc(doc(db, 'guests', guestId));
  },
};
