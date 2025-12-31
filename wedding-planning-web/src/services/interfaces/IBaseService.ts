/**
 * Base Service Interface
 * ממשק בסיס לכל הסרוויסים עם טיפוסים משותפים
 */

// תוצאת פעולה - מבנה אחיד לכל הפעולות
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ישות בסיס - שדות משותפים לכל הישויות
export interface BaseEntity {
  id: string;
  coupleId: string;
  createdAt: Date;
  updatedAt: Date;
}

// טיפוס ליצירת ישות (ללא שדות אוטומטיים)
export type CreateEntity<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// טיפוס לעדכון ישות (חלקי, ללא שדות קבועים)
export type UpdateEntity<T extends BaseEntity> = Partial<Omit<T, 'id' | 'coupleId' | 'createdAt'>>;

// ממשק בסיס לסרוויס CRUD
export interface IBaseService<T extends BaseEntity> {
  // Create - יצירת ישות חדשה
  add(coupleId: string, entity: CreateEntity<T>): Promise<ServiceResult<string>>;

  // Read - קריאת ישות בודדת
  getById(id: string): Promise<ServiceResult<T>>;

  // Read - קריאת כל הישויות של זוג
  getAll(coupleId: string): Promise<ServiceResult<T[]>>;

  // Update - עדכון ישות
  update(id: string, updates: UpdateEntity<T>): Promise<ServiceResult<void>>;

  // Delete - מחיקת ישות
  delete(id: string): Promise<ServiceResult<void>>;

  // Subscribe - האזנה לשינויים בזמן אמת
  subscribe(coupleId: string, callback: (entities: T[]) => void): () => void;
}
