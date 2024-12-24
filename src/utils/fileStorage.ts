// This utility handles file-based storage operations for user data
const USER_DATA_KEY = 'secure_dex_user_data';

interface StoredData {
  users: Record<string, {
    id: string;
    pin: string;
    wallets: Array<{
      id: string;
      network: string;
      address: string;
      balance: string;
    }>;
    transactions: Array<{
      id: string;
      type: 'send' | 'receive';
      amount: string;
      currency: string;
      address: string;
      timestamp: string;
      status: 'pending' | 'completed' | 'failed';
    }>;
  }>;
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
  saveUser: (userData: StoredData['users'][string]) => {
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
  getUser: (userId: string) => {
    const data = fileStorage.getAllData();
    return data.users[userId] || null;
  },

  // Get user by PIN
  getUserByPin: (pin: string) => {
    const data = fileStorage.getAllData();
    return Object.values(data.users).find(user => user.pin === pin) || null;
  },

  // Delete user
  deleteUser: (userId: string) => {
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