/**
 * Services Interfaces
 * ייצוא כל הממשקים
 */

// Base
export type {
  ServiceResult,
  BaseEntity,
  CreateEntity,
  UpdateEntity,
  IBaseService,
} from './IBaseService';

// Task
export type { ITaskService } from './ITaskService';

// Guest
export type { IGuestService, GuestStats, RsvpStatus } from './IGuestService';

// Vendor
export type { IVendorService, VendorExpenses } from './IVendorService';

// Epic
export type { IEpicService, EpicWithTasks } from './IEpicService';

// Couple
export type { ICoupleService, CreateCouple, UpdateCouple } from './ICoupleService';
