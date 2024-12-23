import type { User } from '@/types/auth';

const USER_STORAGE_KEY = 'secure_dex_user';

export const storage = {
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      console.log('Raw user data from storage:', userData);
      
      if (!userData) {
        console.log('No user data found in storage');
        return null;
      }

      const parsedUser = JSON.parse(userData);
      
      // Validate user data structure
      if (!parsedUser.id || !parsedUser.pin || !Array.isArray(parsedUser.wallets)) {
        console.error('Invalid user data structure in storage');
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }

      console.log('Parsed user data:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  },
  
  setUser: (user: User): void => {
    try {
      if (!user || !user.id || !user.pin || !Array.isArray(user.wallets)) {
        console.error('Attempted to save invalid user data');
        throw new Error('Invalid user data');
      }

      const userString = JSON.stringify(user);
      localStorage.setItem(USER_STORAGE_KEY, userString);
      console.log('Successfully saved user data:', userString);
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
      throw error;
    }
  },
  
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('Successfully removed user data from storage');
    } catch (error) {
      console.error('Error removing user data from localStorage:', error);
      throw error;
    }
  }
};