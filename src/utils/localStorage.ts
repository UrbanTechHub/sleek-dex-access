import type { User } from '@/types/auth';

const USER_STORAGE_KEY = 'secure_dex_user';

export const storage = {
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
      return null;
    }
  },
  
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
      throw error;
    }
  },
  
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing user data from localStorage:', error);
      throw error;
    }
  }
};