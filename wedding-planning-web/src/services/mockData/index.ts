/**
 * Mock Data
 * ייצוא פונקציות יצירת נתונים מדומים
 */

export {
  generateMockCouple,
  generateMockEpics,
  generateMockTasks,
  generateMockGuests,
  generateMockVendors,
  type MockDataConfig,
} from './mockDataGenerator';

export {
  insertMockData,
  deleteAllData,
  type MockDataInsertResult,
  type DeleteDataResult,
} from './mockDataService';
