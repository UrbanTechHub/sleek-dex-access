import { fileStorage } from './fileStorage';
import type { User } from '@/types/auth';

export const storage = {
  getUser: (): User | null => {
    try {
      const data = fileStorage.getAllData();
      const users = Object.values(data.users);
      const firstUser = users[0];
      console.log('Retrieved user from storage:', firstUser);
      return firstUser || null;
    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  },
  
  setUser: (user: User): void => {
    try {
      if (!user || !user.id || !user.pin || !Array.isArray(user.wallets)) {
        console.error('Attempted to save invalid user data');
        throw new Error('Invalid user data');
      }

      const success = fileStorage.saveUser(user);
      if (!success) {
        throw new Error('Failed to save user data');
      }
      console.log('Successfully saved user data:', user);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },
  
  removeUser: (): void => {
    try {
      const user = storage.getUser();
      if (user) {
        // Instead of clearing all data, just remove the specific user
        const success = fileStorage.deleteUser(user.id);
        if (!success) {
          throw new Error('Failed to remove user data');
        }
      }
      console.log('Successfully removed user data');
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }
};