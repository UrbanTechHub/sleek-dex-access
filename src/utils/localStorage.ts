import type { User } from '@/types/auth';
import { StorageKeys } from './storageKeys';

class LocalStorageService {
  private readonly STORAGE_KEY = StorageKeys.WALLET_USER;

  getUser(): User | null {
    try {
      const userData = window.localStorage.getItem(this.STORAGE_KEY);
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
      if (!user || !user.id || !user.pin || !Array.isArray(user.wallets)) {
        console.error('Invalid user data structure:', user);
        throw new Error('Invalid user data structure');
      }
      
      // Ensure we're storing the complete user object
      const userToStore = {
        ...user,
        wallets: user.wallets.map(wallet => ({
          ...wallet,
          lastUpdated: new Date()
        }))
      };
      
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userToStore));
      console.log('Successfully saved user data:', userToStore);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }
  
  removeUser(): void {
    try {
      window.localStorage.removeItem(this.STORAGE_KEY);
      console.log('Successfully removed user data');
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }

  clearAll(): void {
    try {
      window.localStorage.clear();
      console.log('Cleared all storage data');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  hasExistingWallet(): boolean {
    const user = this.getUser();
    console.log('Checking for existing wallet:', user !== null);
    return user !== null;
  }
}

export const storage = new LocalStorageService();