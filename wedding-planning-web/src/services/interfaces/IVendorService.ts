/**
 * Vendor Service Interface
 * ממשק לניהול ספקים
 */

import { Vendor } from '@/types';
import { IBaseService, ServiceResult } from './IBaseService';

export interface VendorExpenses {
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

export interface IVendorService extends IBaseService<Vendor> {
  // קבלת ספקים לפי קטגוריה
  getByCategory(coupleId: string, category: string): Promise<ServiceResult<Vendor[]>>;

  // קבלת ספקים נבחרים
  getSelected(coupleId: string): Promise<ServiceResult<Vendor[]>>;

  // שינוי סטטוס בחירה
  toggleSelection(vendorId: string, isSelected: boolean): Promise<ServiceResult<void>>;

  // חישוב הוצאות
  calculateExpenses(coupleId: string): Promise<ServiceResult<VendorExpenses>>;

  // עדכון חוזה
  updateContract(vendorId: string, contractUrl: string, contractFileName: string): Promise<ServiceResult<void>>;
}
