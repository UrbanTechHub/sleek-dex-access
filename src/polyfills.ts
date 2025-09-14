import { Buffer } from 'buffer';

// Global type declarations
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: any;
    require: any;
  }
}

// Add Buffer to the global scope
window.Buffer = Buffer;

// Add process to the global scope if needed by dependencies
window.process = {
  ...window.process,
  env: { ...window.process?.env }
};

// Add require polyfill for crypto libraries (only for specific modules that need it)
(window as any).require = (window as any).require || function(id: string) {
  if (id === 'buffer') {
    return { Buffer };
  }
  if (id === 'crypto') {
    return window.crypto;
  }
  console.warn(`Module '${id}' requested via require() - consider using ES6 imports instead`);
  throw new Error(`Module '${id}' not found in browser environment`);
};