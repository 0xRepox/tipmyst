declare module 'fhevm-sdk/react' {
  import { ReactNode } from 'react';
  
  export interface EncryptedInput {
    add64(value: bigint): EncryptedInput;
  }
  
  export interface EncryptResult {
    handles: string[];
    proof: string;
  }
  
  export interface FHEVMContextValue {
    init: (provider: any) => Promise<void>;
    isInitialized: boolean;
    isInitializing: boolean;
    error: Error | null;
  }
  
  export function FHEVMProvider({ children }: { children: ReactNode }): JSX.Element;
  export function useFHEVM(): FHEVMContextValue;
  export function useEncrypt(): {
    encrypt: (contractAddress: string, userAddress: string, inputBuilder: (input: EncryptedInput) => EncryptedInput) => Promise<EncryptResult>;
    isEncrypting: boolean;
  };
  export function useDecrypt(): {
    decrypt: (handle: bigint, contractAddress: string, userAddress: string, signer: any) => Promise<bigint>;
    isDecrypting: boolean;
  };
}
