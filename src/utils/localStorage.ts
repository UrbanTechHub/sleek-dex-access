import type { User } from '@/types/auth';

const USER_STORAGE_KEY = 'secure_dex_user';

export const storage = {
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      console.log('Raw user data from storage:', userData); // Debug log
      if (!userData) {
        console.log('No user data found in storage');
        return null;
      }
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser); // Debug log
      return parsedUser;
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
      return null;
    }
  },
  
  setUser: (user: User): void => {
    try {
      if (!user) {
        console.error('Attempted to save null user data');
        return;
      }
      const userString = JSON.stringify(user);
      localStorage.setItem(USER_STORAGE_KEY, userString);
      console.log('Successfully saved user data:', userString); // Debug log
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
      throw error;
    }
  },
  
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('Successfully removed user data from storage'); // Debug log
    } catch (error) {
      console.error('Error removing user data from localStorage:', error);
      throw error;
    }
  }
};