import { User } from '@/types/auth';
import { flashDriveStorage, requireFlashDrive } from './flashDriveStorage';

interface StorageService {
  getUser: () => User | null;
  setUser: (user: User) => boolean;
  removeUser: () => boolean;
  isAvailable: () => Promise<boolean>;
  loadUserFromFlashDrive: () => Promise<User | null>;
  saveUserToFlashDrive: () => Promise<boolean>;
}

class FlashDriveStorageService implements StorageService {
  private cachedUser: User | null = null;

  async isAvailable(): Promise<boolean> {
    // In cross-origin iframe (like Lovable preview), flash drive isn't available
    if (window.parent !== window) {
      return false;
    }
    return await requireFlashDrive();
  }

  getUser(): User | null {
    // Return cached user if available
    return this.cachedUser;
  }

  async loadUserFromFlashDrive(): Promise<User | null> {
    try {
      const user = await flashDriveStorage.loadUserData();
      this.cachedUser = user;
      console.log('Loaded user from flash drive:', user ? 'Success' : 'No data found');
      return user;
    } catch (error) {
      console.error('Failed to load user from flash drive:', error);
      return null;
    }
  }

  setUser(user: User): boolean {
    try {
      this.cachedUser = user;
      
      // Save to flash drive asynchronously
      flashDriveStorage.saveUserData(user).catch(error => {
        console.error('Background save to flash drive failed:', error);
      });
      
      console.log('User data cached and queued for flash drive save');
      return true;
    } catch (error) {
      console.error('Failed to cache user data:', error);
      return false;
    }
  }

  async saveUserToFlashDrive(): Promise<boolean> {
    if (!this.cachedUser) {
      console.log('No cached user data to save');
      return false;
    }

    return await flashDriveStorage.saveUserData(this.cachedUser);
  }

  removeUser(): boolean {
    try {
      this.cachedUser = null;
      
      // Clear from flash drive asynchronously
      flashDriveStorage.clearUserData().catch(error => {
        console.error('Background clear from flash drive failed:', error);
      });
      
      console.log('User data cleared from cache and flash drive');
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }
}

// Legacy localStorage service for fallback
class LocalStorageService implements StorageService {
  private readonly STORAGE_KEY = 'wallet_user_data';

  async isAvailable(): Promise<boolean> {
    return typeof localStorage !== 'undefined';
  }

  getUser(): User | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      console.log('Loaded user from localStorage');
      return parsed;
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
      return null;
    }
  }

  async loadUserFromFlashDrive(): Promise<User | null> {
    // Fallback to localStorage
    return this.getUser();
  }

  setUser(user: User): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      console.log('Successfully saved user data to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
      return false;
    }
  }

  async saveUserToFlashDrive(): Promise<boolean> {
    // Fallback to localStorage
    const user = this.getUser();
    if (!user) return false;
    return this.setUser(user);
  }

  removeUser(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('User data removed from localStorage');
      return true;
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
      return false;
    }
  }
}

// Export the appropriate storage service based on environment
const createStorageService = () => {
  // In cross-origin iframe (like Lovable preview), use localStorage
  if (window.parent !== window) {
    console.log('Using localStorage service (preview mode)');
    return new LocalStorageService();
  }
  
  // In normal browser context, use flash drive service
  console.log('Using flash drive service (normal mode)');
  return new FlashDriveStorageService();
};

export const storage = createStorageService();

// Keep both services available for manual use
export const flashDriveService = new FlashDriveStorageService();
export const localStorageService = new LocalStorageService();

// Helper to ensure flash drive is connected
export const ensureFlashDriveAccess = async (): Promise<boolean> => {
  return await storage.isAvailable();
};
