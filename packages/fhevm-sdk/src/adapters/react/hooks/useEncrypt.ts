// packages/fhevm-sdk/src/adapters/react/hooks/useEncrypt.ts

import { useState, useCallback } from 'react';
import { useFHEVMContext } from '../FHEVMProvider';
import type { EncryptedValue } from '../../../types';

export interface UseEncryptReturn {
  encrypt: {
    uint8: (value: number) => Promise<EncryptedValue>;
    uint16: (value: number) => Promise<EncryptedValue>;
    uint32: (value: number) => Promise<EncryptedValue>;
    uint64: (value: bigint) => Promise<EncryptedValue>;
    uint128: (value: bigint) => Promise<EncryptedValue>;
    uint256: (value: bigint) => Promise<EncryptedValue>;
    address: (value: string) => Promise<EncryptedValue>;
    bool: (value: boolean) => Promise<EncryptedValue>;
  };
  isEncrypting: boolean;
  error: Error | null;
}

/**
 * useEncrypt - Hook for encrypting values
 * 
 * Provides encryption methods for all FHE types with loading and error states.
 * Similar to wagmi's useWriteContract() pattern.
 * 
 * @example
 * ```tsx
 * function TipForm() {
 *   const { encrypt, isEncrypting } = useEncrypt();
 *   
 *   const handleSubmit = async (amount: string) => {
 *     const encrypted = await encrypt.uint64(BigInt(amount));
 *     // Use encrypted.data and encrypted.handles with contract
 *   };
 *   
 *   return (
 *     <button onClick={() => handleSubmit('1000')} disabled={isEncrypting}>
 *       {isEncrypting ? 'Encrypting...' : 'Send Tip'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useEncrypt(): UseEncryptReturn {
  const { client, isInitialized } = useFHEVMContext();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createEncryptFunction = useCallback(
    (encryptFn: Function) => async (...args: any[]) => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptFn(...args);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isInitialized]
  );

  const encrypt = {
    uint8: createEncryptFunction((value: number) => client!.encryption.uint8(value)),
    uint16: createEncryptFunction((value: number) => client!.encryption.uint16(value)),
    uint32: createEncryptFunction((value: number) => client!.encryption.uint32(value)),
    uint64: createEncryptFunction((value: bigint) => client!.encryption.uint64(value)),
    uint128: createEncryptFunction((value: bigint) => client!.encryption.uint128(value)),
    uint256: createEncryptFunction((value: bigint) => client!.encryption.uint256(value)),
    address: createEncryptFunction((value: string) => client!.encryption.address(value)),
    bool: createEncryptFunction((value: boolean) => client!.encryption.bool(value)),
  };

  return {
    encrypt,
    isEncrypting,
    error,
  };
}