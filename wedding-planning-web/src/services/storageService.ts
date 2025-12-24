import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isMockMode } from '@/lib/firebase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

/**
 * Storage Service
 * ---------------
 * Service for uploading and managing files in Firebase Storage
 */

export interface UploadProgress {
  progress: number;
  state: 'running' | 'success' | 'error';
}

/**
 * Upload a contract file for a vendor or couple photo
 * @param coupleId - The couple's ID
 * @param vendorIdOrType - The vendor's ID or 'couple-photo' for couple photo
 * @param file - The file to upload
 * @returns Promise with download URL and file name
 */
export async function uploadContract(
  coupleId: string,
  vendorIdOrType: string,
  file: File
): Promise<{ url: string; fileName: string }> {
  if (isMockMode) {
    // Mock mode - return a mock URL
    const path = vendorIdOrType === 'couple-photo' 
      ? `couples/${coupleId}/photo`
      : `vendors/${coupleId}/${vendorIdOrType}`;
    return {
      url: `https://mock-storage.com/${path}/${file.name}`,
      fileName: file.name,
    };
  }

  // Validate file size - 5MB for photos, 10MB for contracts
  const maxSize = vendorIdOrType === 'couple-photo' ? 5 * 1024 * 1024 : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    throw new Error(`הקובץ גדול מדי. מקסימום ${maxSize / 1024 / 1024}MB`);
  }

  // Validate file type - allow images for couple photos
  const allowedTypesForPhoto = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (vendorIdOrType === 'couple-photo') {
    if (!allowedTypesForPhoto.includes(file.type)) {
      throw new Error('סוג קובץ לא נתמך. אנא העלה JPG, PNG או WEBP');
    }
  } else {
    // For contracts, use the original validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('סוג קובץ לא נתמך. אנא העלה PDF, DOC, DOCX, JPG או PNG');
    }
  }

  try {
    // Create storage reference
    let storagePath: string;
    if (vendorIdOrType === 'couple-photo') {
      storagePath = `couples/${coupleId}/photo_${Date.now()}_${file.name}`;
    } else {
      storagePath = `vendors/${coupleId}/${vendorIdOrType}/contract_${Date.now()}_${file.name}`;
    }
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ File uploaded successfully:', downloadURL);
    
    return {
      url: downloadURL,
      fileName: file.name,
    };
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    throw new Error(`שגיאה בהעלאת הקובץ: ${error.message}`);
  }
}

/**
 * Delete a contract file from storage
 * @param url - The storage URL of the file to delete
 */
export async function deleteContract(url: string): Promise<void> {
  if (isMockMode) {
    console.log('Mock mode: Would delete contract at', url);
    return;
  }

  try {
    // Extract path from download URL
    // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
    if (!pathMatch) {
      throw new Error('Invalid storage URL format');
    }
    
    // Decode the path (it's URL encoded)
    const filePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, filePath);
    
    // Delete file
    await deleteObject(storageRef);
    
    console.log('✅ Contract deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting contract:', error);
    // Don't throw - file might not exist
    if (error.code !== 'storage/object-not-found') {
      throw new Error(`שגיאה במחיקת הקובץ: ${error.message}`);
    }
  }
}

/**
 * Get download URL for a contract
 * @param coupleId - The couple's ID
 * @param vendorId - The vendor's ID
 * @returns Promise with download URL
 */
export async function getContractUrl(coupleId: string, vendorId: string): Promise<string | null> {
  if (isMockMode) {
    return `https://mock-storage.com/vendors/${coupleId}/${vendorId}/contract.pdf`;
  }

  try {
    // Try to find the contract file
    const storageRef = ref(storage, `vendors/${coupleId}/${vendorId}/contract`);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return null;
    }
    console.error('❌ Error getting contract URL:', error);
    throw error;
  }
}

