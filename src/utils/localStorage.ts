import type { User } from '@/types/auth';
import { StorageKeys } from './storageKeys';

class LocalStorageService {
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(StorageKeys.WALLET_USER);
      if (!userData) {
        console.log('No user data found in storage');
        return null;
      }
      const user = JSON.parse(userData) as User;
      console.log('Retrieved user from storage:', user);
      return user;
    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  }
  
  setUser(user: User): void {
    try {
      localStorage.setItem(StorageKeys.WALLET_USER, JSON.stringify(user));
      console.log('Successfully saved user data:', user);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }
  
  removeUser(): void {
    try {
      localStorage.removeItem(StorageKeys.WALLET_USER);
      console.log('Successfully removed user data');
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }

  clearAll(): void {
    try {
      localStorage.clear();
      console.log('Cleared all storage data');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const storage = new LocalStorageService();