import type { User } from '@/types/auth';
import { StorageKeys } from './storageKeys';

interface StoredData {
  users: Record<string, User>;
}

const initialData: StoredData = {
  users: {}
};

class FileStorageService {
  private getStorageData(): StoredData {
    const data = localStorage.getItem(StorageKeys.USER_DATA);
    if (!data) {
      this.initializeStorage();
      return initialData;
    }
    return JSON.parse(data) as StoredData;
  }

  private setStorageData(data: StoredData): void {
    localStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(data));
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(StorageKeys.USER_DATA)) {
      this.setStorageData(initialData);
      console.log('Initialized empty user data storage');
    }
  }

  init(): void {
    try {
      this.initializeStorage();
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  getAllData(): StoredData {
    try {
      return this.getStorageData();
    } catch (error) {
      console.error('Error getting data:', error);
      return initialData;
    }
  }

  saveUser(userData: User): boolean {
    try {
      const currentData = this.getStorageData();
      currentData.users[userData.id] = userData;
      this.setStorageData(currentData);
      
      // Verify save was successful
      const savedData = this.getStorageData();
      const userSaved = !!savedData.users[userData.id];
      console.log('User save verification:', userSaved);
      
      return userSaved;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  getUser(userId: string): User | null {
    try {
      const data = this.getStorageData();
      return data.users[userId] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  getUserByPin(pin: string): User | null {
    try {
      const data = this.getStorageData();
      const foundUser = Object.values(data.users).find(user => user.pin === pin);
      console.log('Found user by PIN:', foundUser);
      return foundUser || null;
    } catch (error) {
      console.error('Error finding user by PIN:', error);
      return null;
    }
  }

  deleteUser(userId: string): boolean {
    try {
      const currentData = this.getStorageData();
      if (!currentData.users[userId]) {
        return false;
      }
      delete currentData.users[userId];
      this.setStorageData(currentData);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  clearAll(): void {
    try {
      localStorage.removeItem(StorageKeys.USER_DATA);
      this.initializeStorage();
      console.log('Cleared all user data');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const fileStorage = new FileStorageService();