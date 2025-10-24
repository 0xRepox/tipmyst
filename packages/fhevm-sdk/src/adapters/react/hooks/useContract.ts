// packages/fhevm-sdk/src/adapters/react/hooks/useContract.ts

import { useState, useCallback } from 'react';
import { useFHEVMContext } from '../FHEVMProvider';
import type { Signer, Provider, ContractTransactionResponse } from 'ethers';

export interface UseContractReturn {
  call: (
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    signer: Signer
  ) => Promise<ContractTransactionResponse>;
  read: (
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    provider: Provider
  ) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * useContract - Hook for contract interactions
 * 
 * Provides methods for calling (write) and reading (view) contract functions.
 * Similar to wagmi's useWriteContract() and useReadContract().
 * 
 * @example
 * ```tsx
 * function SendTip() {
 *   const { call, isLoading } = useContract();
 *   const { data: signer } = useSigner();
 *   
 *   const handleSend = async (encrypted: EncryptedValue) => {
 *     const tx = await call(
 *       CONTRACT_ADDRESS,
 *       TipMystABI,
 *       'sendTip',
 *       [creatorAddress, encrypted.data, encrypted.handles],
 *       signer!
 *     );
 *     await tx.wait();
 *   };
 *   
 *   return <button onClick={handleSend} disabled={isLoading}>Send</button>;
 * }
 * ```
 */
export function useContract(): UseContractReturn {
  const { client, isInitialized } = useFHEVMContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(
    async (
      contractAddress: string,
      abi: any[],
      functionName: string,
      args: any[],
      signer: Signer
    ): Promise<ContractTransactionResponse> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await client.contract.call(
          contractAddress,
          abi,
          functionName,
          args,
          signer
        );
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isInitialized]
  );

  const read = useCallback(
    async (
      contractAddress: string,
      abi: any[],
      functionName: string,
      args: any[],
      provider: Provider
    ): Promise<any> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await client.contract.read(
          contractAddress,
          abi,
          functionName,
          args,
          provider
        );
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isInitialized]
  );

  return {
    call,
    read,
    isLoading,
    error,
  };
}