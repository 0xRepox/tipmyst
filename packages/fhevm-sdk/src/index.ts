// packages/fhevm-sdk/src/index.ts

// Core exports (framework-agnostic)
export {
  FHEVMClient,
  EncryptionService,
  DecryptionService,
  ContractService,
} from './core';

// Type exports
export type {
  FHEVMConfig,
  FHEVMClientInstance,
  EncryptionServiceInterface,
  DecryptionServiceInterface,
  ContractServiceInterface,
  EncryptedValue,
  Keypair,
  EIP712Params,
} from './types';

// React adapter exports
export {
  FHEVMProvider,
  useFHEVM,
  useEncrypt,
  useDecrypt,
  useContract,
} from './adapters/react';

export type {
  UseFHEVMReturn,
  UseEncryptReturn,
  UseDecryptReturn,
  UseContractReturn,
} from './adapters/react';

// Reusable components
export {
  EncryptedInput,
  DecryptButton,
  EncryptedBalance,
} from './components';