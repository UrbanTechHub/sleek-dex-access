import type { User } from '@/types/auth';

const USER_DATA_KEY = 'secure_dex_user_data';

interface StoredData {
  users: Record<string, User>;
}

const initialData: StoredData = {
  users: {}
};

export const fileStorage = {
  init: () => {
    try {
      const existingData = localStorage.getItem(USER_DATA_KEY);
      if (!existingData) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(initialData));
        console.log('Initialized empty user data storage');
      } else {
        console.log('Existing storage found:', JSON.parse(existingData));
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  },

  getAllData: (): StoredData => {
    try {
      const data = localStorage.getItem(USER_DATA_KEY);
      if (!data) {
        console.log('No data found, initializing storage');
        fileStorage.init();
        return initialData;
      }
      const parsedData = JSON.parse(data) as StoredData;
      console.log('Retrieved storage data:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error getting data:', error);
      return initialData;
    }
  },

  saveUser: (userData: User): boolean => {
    try {
      console.log('Attempting to save user:', userData);
      
      // Initialize storage if needed
      if (!localStorage.getItem(USER_DATA_KEY)) {
        fileStorage.init();
      }
      
      const currentData = fileStorage.getAllData();
      currentData.users[userData.id] = userData;
      
      // Save the updated data
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentData));
      
      // Verify the save was successful
      const savedData = localStorage.getItem(USER_DATA_KEY);
      console.log('Verification - Saved data:', JSON.parse(savedData || '{}'));
      
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  getUser: (userId: string): User | null => {
    try {
      const data = fileStorage.getAllData();
      return data.users[userId] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

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

  deleteUser: (userId: string): boolean => {
    try {
      console.log('Deleting user:', userId);
      const currentData = fileStorage.getAllData();
      delete currentData.users[userId];
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(currentData));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem(USER_DATA_KEY);
      fileStorage.init();
      console.log('Cleared all user data');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
};