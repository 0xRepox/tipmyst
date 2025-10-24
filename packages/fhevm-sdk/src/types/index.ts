// packages/fhevm-sdk/src/types/index.ts

import type { FhevmInstance } from 'fhevmjs';
import type { Signer, Provider, ContractTransactionResponse } from 'ethers';

/**
 * Configuration for FHEVM Client
 */
export interface FHEVMConfig {
  chainId: number;
  networkUrl?: string;
  gatewayUrl?: string;
  publicKeyUrl?: string;
  coprocessorUrl?: string;
}

/**
 * Encrypted value result from encryption
 */
export interface EncryptedValue {
  data: Uint8Array;
  handles: string;
}

/**
 * EIP-712 typed data for signing
 */
export interface EIP712Params {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    Reencrypt: Array<{ name: string; type: string }>;
  };
  message: {
    publicKey: string;
  };
}

/**
 * Keypair for reencryption
 */
export interface Keypair {
  publicKey: string;
  privateKey: string;
}

/**
 * Encryption Service Interface
 */
export interface EncryptionServiceInterface {
  uint8: (value: number) => Promise<EncryptedValue>;
  uint16: (value: number) => Promise<EncryptedValue>;
  uint32: (value: number) => Promise<EncryptedValue>;
  uint64: (value: bigint) => Promise<EncryptedValue>;
  uint128: (value: bigint) => Promise<EncryptedValue>;
  uint256: (value: bigint) => Promise<EncryptedValue>;
  address: (value: string) => Promise<EncryptedValue>;
  bool: (value: boolean) => Promise<EncryptedValue>;
  createEncryptedInput: (contractAddress: string, userAddress: string) => any;
}

/**
 * Decryption Service Interface
 */
export interface DecryptionServiceInterface {
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
  reencrypt: (
    encryptedValue: bigint,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddress: string,
    userAddress: string
  ) => Promise<bigint>;
}

/**
 * Contract Service Interface
 */
export interface ContractServiceInterface {
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
}

/**
 * Main FHEVM Client Instance Interface
 */
export interface FHEVMClientInstance {
  instance: FhevmInstance | null;
  config: FHEVMConfig;
  encryption: EncryptionServiceInterface;
  decryption: DecryptionServiceInterface;
  contract: ContractServiceInterface;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  getInstance: () => Promise<FhevmInstance>;
  generateKeypair: () => Keypair;
  createEIP712: (publicKey: string, contractAddress: string) => EIP712Params;
}