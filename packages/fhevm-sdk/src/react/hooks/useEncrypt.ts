import { useState, useCallback } from 'react';
import { useFHEVM } from '../FHEVMProvider';
import type { EncryptedInput } from '@zama-fhe/relayer-sdk';

interface EncryptionState {
  isEncrypting: boolean;
  error: Error | null;
}

export interface EncryptedInputHandles {
  handles: bigint[];
  proof: string;
}

export function useEncrypt() {
  const { client, isInitialized } = useFHEVM();
  const [state, setState] = useState<EncryptionState>({
    isEncrypting: false,
    error: null,
  });

  const encrypt = useCallback(async (
    contractAddress: string,
    userAddress: string,
    builderFn: (input: EncryptedInput) => void
  ): Promise<EncryptedInputHandles> => {
    if (!isInitialized || !client) {
      throw new Error('FHEVM not initialized');
    }

    setState({ isEncrypting: true, error: null });

    try {
      const input = client.createEncryptedInput(contractAddress, userAddress);
      builderFn(input);
      const result = await input.encrypt();
      setState({ isEncrypting: false, error: null });
      return {
        handles: result.handles,
        proof: result.inputProof,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Encryption failed');
      setState({ isEncrypting: false, error });
      throw error;
    }
  }, [client, isInitialized]);

  const encryptU64 = useCallback(async (
    contractAddress: string,
    userAddress: string,
    value: bigint
  ): Promise<EncryptedInputHandles> => {
    return encrypt(contractAddress, userAddress, (input) => {
      input.add64(value);
    });
  }, [encrypt]);

  const encryptU32 = useCallback(async (
    contractAddress: string,
    userAddress: string,
    value: bigint
  ): Promise<EncryptedInputHandles> => {
    return encrypt(contractAddress, userAddress, (input) => {
      input.add32(value);
    });
  }, [encrypt]);

  const encryptBool = useCallback(async (
    contractAddress: string,
    userAddress: string,
    value: boolean
  ): Promise<EncryptedInputHandles> => {
    return encrypt(contractAddress, userAddress, (input) => {
      input.addBool(value);
    });
  }, [encrypt]);

  return {
    encrypt,
    encryptU64,
    encryptU32,
    encryptBool,
    isEncrypting: state.isEncrypting,
    error: state.error,
  };
}
