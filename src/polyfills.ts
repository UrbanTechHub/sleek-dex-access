import { Buffer } from 'buffer';

// Add Buffer to the global scope
window.Buffer = Buffer;

// Add process to the global scope if needed by dependencies
window.process = {
  ...window.process,
  env: { ...window.process?.env }
};