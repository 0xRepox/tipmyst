// packages/fhevm-sdk/src/react/index.ts

/**
 * React Hooks for FHEVM
 * 
 * @example
 * ```tsx
 * import { useFhevm, useEncrypt, useTipJar } from '@fhevm-sdk/react';
 * 
 * function MyComponent() {
 *   const { instance, isReady } = useFhevm();
 *   const { encrypt } = useFHEEncryption();
 *   const { sendTip, isPending } = useTipJar();
 *   
 *   // Use hooks...
 * }
 * ```
 */

// Core FHEVM hooks
export { useFhevm } from "./useFhevm";
export { useFHEEncryption } from "./useFHEEncryption";
export { useFHEDecrypt } from "./useFHEDecrypt";
export { useInMemoryStorage } from "./useInMemoryStorage";

// TipMyst-specific hooks
export { useTipJar } from "./useTipJar";
export { useCreator } from "./useCreator";
export { useMYSTBalance } from "./useMYSTBalance";

// Re-export types
export type { Creator, Tip, DecryptedTip, CreatorCategory } from "../types";
export { CREATOR_CATEGORIES, DEFAULT_CONTRACTS } from "../types";