/**
 * Polyfill file for Angular
 */

// Zone.js is required by Angular
import 'zone.js';

// Fix for SockJS and other libraries expecting Node.js 'global' object
(window as any).global = window;

// Optional: Polyfill process object if needed
(window as any).process = {
  env: { DEBUG: undefined },
  version: ''
};

// Optional: Add Buffer polyfill if you use it
// import { Buffer } from 'buffer';
// (window as any).Buffer = Buffer;