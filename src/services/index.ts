/**
 * Services Barrel Export
 *
 * Main export file for all services in the application.
 * Re-exports CRUD services, interfaces, and development services.
 */

// CRUD Services
export * from './crud';

// Service Interfaces
export * from './interfaces';

// Development Services
export { mockDataService } from './dev/mockDataService';
