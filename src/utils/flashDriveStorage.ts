import { toast } from 'sonner';
import type { User } from '@/types/auth';

const WALLET_FILE_NAME = 'wallet-data.json';
const SUPPORTED_FILE_TYPES = ['.json'];

interface FlashDriveAPI {
  isSupported: boolean;
  requestAccess: () => Promise<FileSystemDirectoryHandle | null>;
  saveUserData: (user: User) => Promise<boolean>;
  loadUserData: () => Promise<User | null>;
  isFlashDriveConnected: () => Promise<boolean>;
}

class FlashDriveStorage implements FlashDriveAPI {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  
  get isSupported(): boolean {
    // Check if the API exists and we're not in a cross-origin frame
    return 'showDirectoryPicker' in window && window.parent === window;
  }

  async requestAccess(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.isSupported) {
      if (window.parent !== window) {
        toast.error('Flash drive access not available in preview mode. Please open in a new tab.');
      } else {
        toast.error('Flash drive access not supported in this browser');
      }
      return null;
    }

    try {
      // Request access to a directory (flash drive)
      this.directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads'
      });
      
      console.log('Flash drive access granted:', this.directoryHandle.name);
      toast.success(`Connected to ${this.directoryHandle.name}`);
      return this.directoryHandle;
    } catch (error) {
      console.error('Failed to access flash drive:', error);
      if ((error as Error).name === 'SecurityError') {
        toast.error('Flash drive access blocked. Please open in a new tab or use Chrome/Edge.');
      } else if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to access flash drive');
      }
      return null;
    }
  }

  async isFlashDriveConnected(): Promise<boolean> {
    if (!this.directoryHandle) {
      return false;
    }

    try {
      // Try to read the directory name to check if it's still accessible
      const name = this.directoryHandle.name;
      console.log('Flash drive still connected:', name);
      return true;
    } catch (error) {
      console.error('Error checking flash drive connection:', error);
      return false;
    }
  }

  async saveUserData(user: User): Promise<boolean> {
    if (!this.directoryHandle) {
      const result = await this.requestAccess();
      if (!result) return false;
    }

    try {
      // Create or get the wallet file
      const fileHandle = await this.directoryHandle!.getFileHandle(WALLET_FILE_NAME, {
        create: true
      });

      // Create a writable stream
      const writable = await fileHandle.createWritable();
      
      // Prepare data with timestamp
      const dataToSave = {
        ...user,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };

      await writable.write(JSON.stringify(dataToSave, null, 2));
      await writable.close();

      console.log('User data saved to flash drive successfully');
      toast.success('Wallet data saved to flash drive');
      return true;
    } catch (error) {
      console.error('Failed to save user data to flash drive:', error);
      toast.error('Failed to save wallet data to flash drive');
      return false;
    }
  }

  async loadUserData(): Promise<User | null> {
    if (!this.directoryHandle) {
      const result = await this.requestAccess();
      if (!result) return null;
    }

    try {
      // Try to get the wallet file
      const fileHandle = await this.directoryHandle!.getFileHandle(WALLET_FILE_NAME);
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      const data = JSON.parse(content);
      
      // Validate the data structure
      if (!data.id || !data.pin || !Array.isArray(data.wallets)) {
        throw new Error('Invalid wallet data structure');
      }

      console.log('User data loaded from flash drive successfully');
      toast.success('Wallet data loaded from flash drive');
      
      // Return user data without the metadata
      const { lastSaved, version, ...userData } = data;
      return userData as User;
    } catch (error) {
      if ((error as any).name === 'NotFoundError') {
        console.log('No existing wallet file found on flash drive');
        return null;
      }
      
      console.error('Failed to load user data from flash drive:', error);
      toast.error('Failed to load wallet data from flash drive');
      return null;
    }
  }

  async clearUserData(): Promise<boolean> {
    if (!this.directoryHandle) {
      return true; // Already cleared
    }

    try {
      await this.directoryHandle.removeEntry(WALLET_FILE_NAME);
      console.log('User data cleared from flash drive');
      toast.success('Wallet data cleared from flash drive');
      return true;
    } catch (error) {
      if ((error as any).name === 'NotFoundError') {
        return true; // File doesn't exist, consider it cleared
      }
      
      console.error('Failed to clear user data from flash drive:', error);
      toast.error('Failed to clear wallet data from flash drive');
      return false;
    }
  }

  disconnect(): void {
    this.directoryHandle = null;
    console.log('Disconnected from flash drive');
  }
}

export const flashDriveStorage = new FlashDriveStorage();

// Fallback for browsers that don't support File System Access API
export const isFlashDriveSupported = (): boolean => {
  return flashDriveStorage.isSupported;
};

export const requireFlashDrive = async (): Promise<boolean> => {
  if (!isFlashDriveSupported()) {
    toast.error('This wallet requires a browser that supports flash drive access (Chrome/Edge recommended)');
    return false;
  }

  const isConnected = await flashDriveStorage.isFlashDriveConnected();
  if (!isConnected) {
    toast.error('Please connect and select your flash drive to continue');
    return false;
  }

  return true;
};