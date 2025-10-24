// packages/fhevm-sdk/src/core/FHEVMClient.ts

import { createInstance, initFhevm, FhevmInstance } from 'fhevmjs';
import { EncryptionService } from './EncryptionService';
import { DecryptionService } from './DecryptionService';
import { ContractService } from './ContractService';
import type {
  FHEVMConfig,
  FHEVMClientInstance,
  Keypair,
  EIP712Params,
} from '../types';

/**
 * Main FHEVM Client - Framework-agnostic core
 * 
 * This is the heart of the Universal SDK. It can be used in any JavaScript environment:
 * - Browser (React, Vue, vanilla JS)
 * - Node.js server
 * - Mobile apps (React Native)
 * 
 * @example
 * ```typescript
 * const client = await FHEVMClient.create({
 *   chainId: 11155111,
 *   gatewayUrl: 'https://gateway.sepolia.zama.ai'
 * });
 * 
 * const encrypted = await client.encryption.uint64(1000n);
 * ```
 */
export class FHEVMClient implements FHEVMClientInstance {
  public instance: FhevmInstance | null = null;
  public config: FHEVMConfig;
  public encryption: EncryptionService;
  public decryption: DecryptionService;
  public contract: ContractService;
  public isInitialized: boolean = false;

  private constructor(config: FHEVMConfig) {
    this.config = this.normalizeConfig(config);
    this.encryption = new EncryptionService(() => this.getInstance());
    this.decryption = new DecryptionService(() => this.getInstance());
    this.contract = new ContractService(() => this.getInstance());
  }

  /**
   * Create and initialize a new FHEVM client
   * 
   * @param config - FHEVM configuration
   * @returns Initialized FHEVM client instance
   */
  public static async create(config: FHEVMConfig): Promise<FHEVMClient> {
    const client = new FHEVMClient(config);
    await client.initialize();
    return client;
  }

  /**
   * Initialize the FHEVM instance
   * This loads the WASM files and sets up the client
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize FHEVM library (loads WASM)
      await initFhevm();

      // Create instance with configuration
      this.instance = await createInstance({
        chainId: this.config.chainId,
        networkUrl: this.config.networkUrl,
        gatewayUrl: this.config.gatewayUrl,
        publicKeyUrl: this.config.publicKeyUrl,
        coprocessorUrl: this.config.coprocessorUrl,
      });

      this.isInitialized = true;
    } catch (error) {
      const err = error as Error;
      console.error('FHEVM initialization failed:', err);
      throw new Error(`FHEVM initialization failed: ${err.message}`);
    }
  }

  /**
   * Get the FHEVM instance, initializing if necessary
   */
  public async getInstance(): Promise<FhevmInstance> {
    if (!this.isInitialized || !this.instance) {
      await this.initialize();
    }

    if (!this.instance) {
      throw new Error('FHEVM instance is not initialized');
    }

    return this.instance;
  }

  /**
   * Generate a keypair for reencryption
   * Used in userDecrypt flow with EIP-712 signing
   */
  public generateKeypair(): Keypair {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized');
    }
    return this.instance.generateKeypair();
  }

  /**
   * Create EIP-712 typed data for user signature
   * Required for userDecrypt to prove ownership
   */
  public createEIP712(publicKey: string, contractAddress: string): EIP712Params {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized');
    }
    return this.instance.createEIP712(publicKey, contractAddress);
  }

  /**
   * Normalize configuration with sensible defaults
   */
  private normalizeConfig(config: FHEVMConfig): FHEVMConfig {
    const defaults = this.getDefaultConfig(config.chainId);
    
    return {
      chainId: config.chainId,
      networkUrl: config.networkUrl || defaults.networkUrl,
      gatewayUrl: config.gatewayUrl || defaults.gatewayUrl,
      publicKeyUrl: config.publicKeyUrl || defaults.publicKeyUrl,
      coprocessorUrl: config.coprocessorUrl || defaults.coprocessorUrl,
    };
  }

  /**
   * Get default configuration for common networks
   */
  private getDefaultConfig(chainId: number): Partial<FHEVMConfig> {
    const configs: Record<number, Partial<FHEVMConfig>> = {
      // Localhost
      31337: {
        networkUrl: 'http://127.0.0.1:8545',
        gatewayUrl: 'http://localhost:8547',
      },
      // Sepolia
      11155111: {
        networkUrl: 'https://sepolia.infura.io/v3/811e922b67ea459fbca1e3f7e57ffb28',
        gatewayUrl: 'https://gateway.sepolia.zama.ai',
        coprocessorUrl: 'https://coprocessor.sepolia.zama.ai',
      },
      // Zama Devnet
      8009: {
        networkUrl: 'https://devnet.zama.ai',
        gatewayUrl: 'https://gateway.zama.ai',
      },
    };

    return configs[chainId] || {};
  }
}