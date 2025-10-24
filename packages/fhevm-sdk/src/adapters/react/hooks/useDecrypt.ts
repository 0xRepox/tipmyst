// packages/fhevm-sdk/src/adapters/react/hooks/useDecrypt.ts

import { useState, useCallback } from 'react';
import { useFHEVMContext } from '../FHEVMProvider';
import type { Signer } from 'ethers';

export interface UseDecryptReturn {
  userDecrypt: (
    encryptedValue: bigint,
    contractAddress: string,
    userAddress: string,
    signer: Signer
  ) => Promise<bigint>;
  publicDecrypt: (
    encryptedValue: bigint,
    contractAddress: string
  ) => Promise<bigint>;
  isDecrypting: boolean;
  error: Error | null;
}

/**
 * useDecrypt - Hook for decrypting values
 * 
 * Provides two decryption methods:
 * - userDecrypt: For private user data (requires EIP-712 signature)
 * - publicDecrypt: For publicly accessible data
 * 
 * @example
 * ```tsx
 * function ViewBalance() {
 *   const { userDecrypt, isDecrypting } = useDecrypt();
 *   const { data: signer } = useSigner();
 *   const { address } = useAccount();
 *   
 *   const [balance, setBalance] = useState<string | null>(null);
 *   
 *   const handleDecrypt = async (encryptedBalance: bigint) => {
 *     const decrypted = await userDecrypt(
 *       encryptedBalance,
 *       CONTRACT_ADDRESS,
 *       address!,
 *       signer!
 *     );
 *     setBalance(decrypted.toString());
 *   };
 *   
 *   return <div>Balance: {balance}</div>;
 * }
 * ```
 */
export function useDecrypt(): UseDecryptReturn {
  const { client, isInitialized } = useFHEVMContext();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const userDecrypt = useCallback(
    async (
      encryptedValue: bigint,
      contractAddress: string,
      userAddress: string,
      signer: Signer
    ): Promise<bigint> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await client.decryption.userDecrypt(
          encryptedValue,
          contractAddress,
          userAddress,
          signer
        );
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isInitialized]
  );

  const publicDecrypt = useCallback(
    async (
      encryptedValue: bigint,
      contractAddress: string
    ): Promise<bigint> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await client.decryption.publicDecrypt(
          encryptedValue,
          contractAddress
        );
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client, isInitialized]
  );

  return {
    userDecrypt,
    publicDecrypt,
    isDecrypting,
    error,
  };
}