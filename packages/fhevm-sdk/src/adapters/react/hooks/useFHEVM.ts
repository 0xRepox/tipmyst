// packages/fhevm-sdk/src/adapters/react/hooks/useFHEVM.ts

import { useFHEVMContext } from '../FHEVMProvider';
import type { FHEVMClientInstance, Keypair, EIP712Params } from '../../../types';

export interface UseFHEVMReturn {
  client: FHEVMClientInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  generateKeypair: () => Keypair | null;
  createEIP712: (publicKey: string, contractAddress: string) => EIP712Params | null;
}

/**
 * useFHEVM - Main hook to access FHEVM client
 * 
 * Provides access to the FHEVM client instance and utility functions.
 * Similar to wagmi's useClient().
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isInitialized, generateKeypair } = useFHEVM();
 *   
 *   if (!isInitialized) return <div>Loading FHEVM...</div>;
 *   
 *   return <div>FHEVM Ready!</div>;
 * }
 * ```
 */
export function useFHEVM(): UseFHEVMReturn {
  const { client, isInitialized, isLoading, error } = useFHEVMContext();

  const generateKeypair = () => {
    if (!client || !isInitialized) {
      console.warn('FHEVM client not initialized');
      return null;
    }
    return client.generateKeypair();
  };

  const createEIP712 = (publicKey: string, contractAddress: string) => {
    if (!client || !isInitialized) {
      console.warn('FHEVM client not initialized');
      return null;
    }
    return client.createEIP712(publicKey, contractAddress);
  };

  return {
    client,
    isInitialized,
    isLoading,
    error,
    generateKeypair,
    createEIP712,
  };
}