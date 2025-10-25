import { useState, useCallback } from 'react';
import { useFHEVM } from '../FHEVMProvider';
import type { BrowserProvider } from 'ethers';

interface DecryptionState {
  isDecrypting: boolean;
  error: Error | null;
}

export function useDecrypt() {
  const { client, isInitialized } = useFHEVM();
  const [state, setState] = useState<DecryptionState>({
    isDecrypting: false,
    error: null,
  });

  const decrypt = useCallback(async (
    handle: bigint,
    contractAddress: string,
    userAddress: string,
    signer: BrowserProvider
  ): Promise<bigint> => {
    if (!isInitialized || !client) {
      throw new Error('FHEVM not initialized');
    }

    setState({ isDecrypting: true, error: null });

    try {
      const result = await client.decrypt(handle, contractAddress, userAddress, signer);
      setState({ isDecrypting: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('User decryption failed');
      setState({ isDecrypting: false, error });
      throw error;
    }
  }, [client, isInitialized]);

  const publicDecrypt = useCallback(async (
    handle: bigint,
    contractAddress: string
  ): Promise<bigint> => {
    if (!isInitialized || !client) {
      throw new Error('FHEVM not initialized');
    }

    setState({ isDecrypting: true, error: null });

    try {
      const result = await client.publicDecrypt(handle, contractAddress);
      setState({ isDecrypting: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Public decryption failed');
      setState({ isDecrypting: false, error });
      throw error;
    }
  }, [client, isInitialized]);

  return {
    decrypt,
    publicDecrypt,
    isDecrypting: state.isDecrypting,
    error: state.error,
  };
}
