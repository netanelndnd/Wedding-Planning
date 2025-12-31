/**
 * Vendor Service
 * סרוויס לניהול ספקים
 */

import { Vendor } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, isMockMode } from '@/lib/firebase';
import { BaseFirestoreService, convertTimestamps } from './baseService';
import { IVendorService, VendorExpenses } from '../interfaces/IVendorService';
import { ServiceResult } from '../interfaces';

// מאגר נתונים מדומים
let mockVendors: Vendor[] = [];

class VendorServiceImpl extends BaseFirestoreService<Vendor> implements IVendorService {
  protected collectionName = 'vendors';

  protected get mockData(): Vendor[] {
    return mockVendors;
  }

  protected set mockData(data: Vendor[]) {
    mockVendors = data;
  }

  /**
   * קבלת ספקים לפי קטגוריה
   */
  async getByCategory(
    coupleId: string,
    category: string
  ): Promise<ServiceResult<Vendor[]>> {
    try {
      if (isMockMode) {
        const vendors = mockVendors.filter(
          (v) => v.coupleId === coupleId && v.category === category
        );
        return { success: true, data: vendors };
      }

      const q = query(
        collection(db, this.collectionName),
        where('coupleId', '==', coupleId),
        where('category', '==', category)
      );
      const snapshot = await getDocs(q);
      const vendors = snapshot.docs.map((doc) =>
        convertTimestamps<Vendor>(doc.data(), doc.id)
      );

      return { success: true, data: vendors };
    } catch (error) {
      console.error('Error getting vendors by category:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת ספקים נבחרים
   */
  async getSelected(coupleId: string): Promise<ServiceResult<Vendor[]>> {
    try {
      if (isMockMode) {
        const vendors = mockVendors.filter(
          (v) => v.coupleId === coupleId && v.isSelected
        );
        return { success: true, data: vendors };
      }

      const q = query(
        collection(db, this.collectionName),
        where('coupleId', '==', coupleId),
        where('isSelected', '==', true)
      );
      const snapshot = await getDocs(q);
      const vendors = snapshot.docs.map((doc) =>
        convertTimestamps<Vendor>(doc.data(), doc.id)
      );

      return { success: true, data: vendors };
    } catch (error) {
      console.error('Error getting selected vendors:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * שינוי סטטוס בחירה
   */
  async toggleSelection(
    vendorId: string,
    isSelected: boolean
  ): Promise<ServiceResult<void>> {
    return this.update(vendorId, { isSelected });
  }

  /**
   * חישוב הוצאות
   */
  async calculateExpenses(coupleId: string): Promise<ServiceResult<VendorExpenses>> {
    try {
      const result = await this.getSelected(coupleId);
      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'שגיאה בקבלת ספקים' };
      }

      const vendors = result.data;
      const byCategory: Record<string, number> = {};

      let total = 0;
      vendors.forEach((vendor) => {
        const price = vendor.actualPrice || vendor.price || 0;
        total += price;

        if (!byCategory[vendor.category]) {
          byCategory[vendor.category] = 0;
        }
        byCategory[vendor.category] += price;
      });

      return {
        success: true,
        data: {
          total,
          byCategory,
          count: vendors.length,
        },
      };
    } catch (error) {
      console.error('Error calculating expenses:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * עדכון חוזה
   */
  async updateContract(
    vendorId: string,
    contractUrl: string,
    contractFileName: string
  ): Promise<ServiceResult<void>> {
    return this.update(vendorId, { contractUrl, contractFileName });
  }
}

// ייצוא instance יחיד (Singleton)
export const vendorService = new VendorServiceImpl();
