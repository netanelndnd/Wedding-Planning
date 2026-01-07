/**
 * MockDataService
 *
 * Service for seeding the database with mock data during development.
 * Used for testing and demonstration purposes.
 */

import { logger } from '@/lib/logger';

/**
 * Mock Data Service for development testing
 */
class MockDataService {
  /**
   * Seed database with mock couple profile, epics, tasks, and guests
   */
  async seedDatabase(userId: string): Promise<void> {
    try {
      logger.info('Starting database seed', { userId });

      // TODO: Implement seeding when Epic, Task, and Guest services are created
      // This will be implemented in Phase 4 (US2) and Phase 6 (US4)

      // For now, this is a placeholder
      logger.info('Database seeding placeholder - implement in Phase 4/6', {
        userId,
      });
    } catch (error) {
      logger.error('Failed to seed database', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Clear all data for a user (for testing)
   */
  async clearUserData(userId: string): Promise<void> {
    try {
      logger.info('Clearing user data', { userId });

      // TODO: Implement clearing when all services are created
      // This will delete: couple profile, epics, tasks, and guests

      logger.info('User data clearing placeholder - implement in Phase 4/6', {
        userId,
      });
    } catch (error) {
      logger.error('Failed to clear user data', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
