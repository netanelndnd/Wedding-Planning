/**
 * Services - Main Export
 * ייצוא כל הסרוויסים והממשקים
 */

// Interfaces
export * from './interfaces';

// CRUD Services
export * from './crud';

// Mock Data
export * from './mockData';

// Storage Service (existing)
export { uploadContract, deleteContract, getContractUrl } from './storageService';
