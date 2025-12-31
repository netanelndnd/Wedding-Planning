/**
 * Mock Data Service
 * הכנסת נתונים מדומים ל-Firestore
 */

import { db, auth, isMockMode } from '@/lib/firebase';
import { collection, addDoc, Timestamp, doc, setDoc, writeBatch, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import {
  generateMockCouple,
  generateMockEpics,
  generateMockTasks,
  generateMockGuests,
  generateMockVendors,
  MockDataConfig,
} from './mockDataGenerator';
import { ServiceResult } from '../interfaces';

export interface MockDataInsertResult {
  coupleCreated: boolean;
  epicsCreated: number;
  tasksCreated: number;
  guestsCreated: number;
  vendorsCreated: number;
}

/**
 * הכנסת נתונים מדומים ל-Firestore
 */
export async function insertMockData(
  userId: string,
  config: MockDataConfig = {}
): Promise<ServiceResult<MockDataInsertResult>> {
  const {
    guestCount = 50,
    vendorCount = 8,
    taskCount = 12,
    epicCount = 4,
  } = config;

  try {
    if (isMockMode) {
      console.log('Mock mode: Would insert mock data');
      return {
        success: true,
        data: {
          coupleCreated: true,
          epicsCreated: epicCount,
          tasksCreated: taskCount,
          guestsCreated: guestCount,
          vendorsCreated: vendorCount,
        },
      };
    }

    const result: MockDataInsertResult = {
      coupleCreated: false,
      epicsCreated: 0,
      tasksCreated: 0,
      guestsCreated: 0,
      vendorsCreated: 0,
    };

    // 1. יצירת הזוג
    const couple = generateMockCouple(userId);
    const coupleRef = doc(db, 'couples', userId);
    await setDoc(coupleRef, {
      partner1Name: couple.partner1Name,
      partner2Name: couple.partner2Name,
      weddingDate: couple.weddingDate ? Timestamp.fromDate(couple.weddingDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    result.coupleCreated = true;
    console.log('✅ Couple created');

    // 2. יצירת אפיקים
    const epics = generateMockEpics(userId, epicCount);
    const epicIds: string[] = [];

    for (const epic of epics) {
      const epicRef = await addDoc(collection(db, 'epics'), {
        coupleId: userId,
        title: epic.title,
        category: epic.category,
        color: epic.color,
        order: epic.order,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      epicIds.push(epicRef.id);
      result.epicsCreated++;
    }
    console.log(`✅ ${result.epicsCreated} epics created`);

    // עדכון האפיקים עם ה-IDs האמיתיים
    const epicsWithIds = epics.map((e, i) => ({ ...e, id: epicIds[i] }));

    // 3. יצירת משימות
    const tasks = generateMockTasks(userId, epicsWithIds, taskCount);
    const taskBatch = writeBatch(db);

    tasks.forEach((task, index) => {
      const taskRef = doc(collection(db, 'tasks'));
      taskBatch.set(taskRef, {
        coupleId: userId,
        epicId: epicIds[index % epicIds.length],
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await taskBatch.commit();
    result.tasksCreated = tasks.length;
    console.log(`✅ ${result.tasksCreated} tasks created`);

    // 4. יצירת אורחים (בקבוצות של 450)
    const guests = generateMockGuests(userId, guestCount);
    const guestChunks = chunkArray(guests, 450);

    for (const chunk of guestChunks) {
      const guestBatch = writeBatch(db);

      chunk.forEach((guest) => {
        const guestRef = doc(collection(db, 'guests'));
        guestBatch.set(guestRef, {
          coupleId: userId,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          relationship: guest.relationship,
          plusOne: guest.plusOne,
          rsvpStatus: guest.rsvpStatus,
          notes: guest.notes,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });

      await guestBatch.commit();
      result.guestsCreated += chunk.length;
    }
    console.log(`✅ ${result.guestsCreated} guests created`);

    // 5. יצירת ספקים
    const vendors = generateMockVendors(userId, vendorCount);
    const vendorBatch = writeBatch(db);

    vendors.forEach((vendor) => {
      const vendorRef = doc(collection(db, 'vendors'));
      vendorBatch.set(vendorRef, {
        coupleId: userId,
        name: vendor.name,
        category: vendor.category,
        phone: vendor.phone,
        email: vendor.email,
        price: vendor.price,
        actualPrice: vendor.actualPrice,
        rating: vendor.rating,
        isSelected: vendor.isSelected,
        notes: vendor.notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await vendorBatch.commit();
    result.vendorsCreated = vendors.length;
    console.log(`✅ ${result.vendorsCreated} vendors created`);

    console.log('🎉 Mock data inserted successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error inserting mock data:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * פיצול מערך לקבוצות
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ==================== DELETE ALL DATA ====================

export interface DeleteDataResult {
  tasksDeleted: number;
  epicsDeleted: number;
  guestsDeleted: number;
  vendorsDeleted: number;
  coupleDeleted: boolean;
  userDeleted: boolean;
}

/**
 * מחיקת כל הנתונים של המשתמש כולל המשתמש עצמו
 */
export async function deleteAllData(
  userId: string
): Promise<ServiceResult<DeleteDataResult>> {
  try {
    if (isMockMode) {
      console.log('Mock mode: Would delete all data');
      return {
        success: true,
        data: {
          tasksDeleted: 0,
          epicsDeleted: 0,
          guestsDeleted: 0,
          vendorsDeleted: 0,
          coupleDeleted: true,
          userDeleted: true,
        },
      };
    }

    const result: DeleteDataResult = {
      tasksDeleted: 0,
      epicsDeleted: 0,
      guestsDeleted: 0,
      vendorsDeleted: 0,
      coupleDeleted: false,
      userDeleted: false,
    };

    // 1. מחיקת כל המשימות
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('coupleId', '==', userId)
    );
    const tasksDocs = await getDocs(tasksQuery);
    const taskChunks = chunkArray(tasksDocs.docs, 450);

    for (const chunk of taskChunks) {
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      result.tasksDeleted += chunk.length;
    }
    console.log(`🗑️ ${result.tasksDeleted} tasks deleted`);

    // 2. מחיקת כל האפיקים
    const epicsQuery = query(
      collection(db, 'epics'),
      where('coupleId', '==', userId)
    );
    const epicsDocs = await getDocs(epicsQuery);
    const epicChunks = chunkArray(epicsDocs.docs, 450);

    for (const chunk of epicChunks) {
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      result.epicsDeleted += chunk.length;
    }
    console.log(`🗑️ ${result.epicsDeleted} epics deleted`);

    // 3. מחיקת כל האורחים
    const guestsQuery = query(
      collection(db, 'guests'),
      where('coupleId', '==', userId)
    );
    const guestsDocs = await getDocs(guestsQuery);
    const guestChunks = chunkArray(guestsDocs.docs, 450);

    for (const chunk of guestChunks) {
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      result.guestsDeleted += chunk.length;
    }
    console.log(`🗑️ ${result.guestsDeleted} guests deleted`);

    // 4. מחיקת כל הספקים
    const vendorsQuery = query(
      collection(db, 'vendors'),
      where('coupleId', '==', userId)
    );
    const vendorsDocs = await getDocs(vendorsQuery);
    const vendorChunks = chunkArray(vendorsDocs.docs, 450);

    for (const chunk of vendorChunks) {
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      result.vendorsDeleted += chunk.length;
    }
    console.log(`🗑️ ${result.vendorsDeleted} vendors deleted`);

    // 5. מחיקת מסמך הזוג
    const coupleRef = doc(db, 'couples', userId);
    await deleteDoc(coupleRef);
    result.coupleDeleted = true;
    console.log('🗑️ Couple document deleted');

    // 6. מחיקת המשתמש מ-Firebase Auth
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await deleteUser(currentUser);
      result.userDeleted = true;
      console.log('🗑️ User deleted from Firebase Auth');
    }

    console.log('🎉 All data deleted successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error deleting all data:', error);
    return { success: false, error: (error as Error).message };
  }
}
