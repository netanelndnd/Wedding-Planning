/**
 * Mock Data Service
 * הכנסת נתונים מדומים ל-Firestore
 */

import { db, isMockMode } from '@/lib/firebase';
import { collection, addDoc, Timestamp, doc, setDoc, writeBatch } from 'firebase/firestore';
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
