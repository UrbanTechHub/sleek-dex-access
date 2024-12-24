import type { User } from '@/types/auth';

// This utility handles file-based storage operations for user data
const USER_DATA_KEY = 'secure_dex_user_data';

interface StoredData {
  users: Record<string, User>;
}

const initialData: StoredData = {
  users: {}
};

export const fileStorage = {
  // Initialize storage if it doesn't exist
  init: () => {
    if (!localStorage.getItem(USER_DATA_KEY)) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(initialData));
      console.log('Initialized empty user data storage');
    }
  },

  // Get all stored data
  getAllData: (): StoredData => {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) {
      fileStorage.init();
      return initialData;
    }
    return JSON.parse(data);
  },

  // Save user data
  saveUser: (userData: User): boolean => {
    try {
      const currentData = fileStorage.getAllData();
      currentData.users[userData.id] = userData;
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentData));
      console.log('Saved user data:', userData);
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  // Get user by ID
  getUser: (userId: string): User | null => {
    const data = fileStorage.getAllData();
    return data.users[userId] || null;
  },

  // Get user by PIN
  getUserByPin: (pin: string): User | null => {
    try {
      const data = fileStorage.getAllData();
      console.log('Looking for user with PIN:', pin);
      console.log('Current stored users:', data.users);
      
      const foundUser = Object.values(data.users).find(user => user.pin === pin);
      console.log('Found user:', foundUser);
      
      return foundUser || null;
    } catch (error) {
      console.error('Error finding user by PIN:', error);
      return null;
    }
  },

  // Delete user
  deleteUser: (userId: string): boolean => {
    try {
      const currentData = fileStorage.getAllData();
      delete currentData.users[userId];
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentData));
      console.log('Deleted user:', userId);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // Clear all data (useful for testing)
  clearAll: () => {
    localStorage.removeItem(USER_DATA_KEY);
    fileStorage.init();
    console.log('Cleared all user data');
  }
};