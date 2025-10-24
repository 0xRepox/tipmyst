// packages/fhevm-sdk/src/core/DecryptionService.ts

import type { FhevmInstance } from 'fhevmjs';
import type { Signer } from 'ethers';
import type { DecryptionServiceInterface } from '../types';

/**
 * Decryption Service - Handles all decryption operations
 * 
 * Provides two main decryption flows:
 * 1. userDecrypt: User proves ownership with EIP-712 signature
 * 2. publicDecrypt: For publicly decryptable values
 * 
 * @example
 * ```typescript
 * // User decrypt (private data)
 * const balance = await decryption.userDecrypt(
 *   encryptedBalance,
 *   contractAddress,
 *   userAddress,
 *   signer
 * );
 * 
 * // Public decrypt (public totals)
 * const total = await decryption.publicDecrypt(encryptedTotal, contractAddress);
 * ```
 */
export class DecryptionService implements DecryptionServiceInterface {
  constructor(private getInstance: () => Promise<FhevmInstance>) {}

  /**
   * Decrypt a value using user's signature (EIP-712)
   * 
   * This is the primary decryption method for private user data.
   * Flow:
   * 1. Generate keypair
   * 2. Create EIP-712 message
   * 3. User signs with wallet
   * 4. Reencrypt with user's public key
   * 5. Decrypt with private key
   * 
   * @param encryptedValue - The encrypted value from contract
   * @param contractAddress - Contract that owns the ciphertext
   * @param userAddress - User's wallet address
   * @param signer - Ethers signer to sign EIP-712 message
   * @returns Decrypted value as bigint
   */
  async userDecrypt(
    encryptedValue: bigint,
    contractAddress: string,
    userAddress: string,
    signer: Signer
  ): Promise<bigint> {
    const instance = await this.getInstance();
    
    // Generate keypair for reencryption
    const { publicKey, privateKey } = instance.generateKeypair();
    
    // Create EIP-712 typed data
    const eip712 = instance.createEIP712(publicKey, contractAddress);
    
    // Request user signature
    const signature = await signer.signTypedData(
      eip712.domain,
      eip712.types,
      eip712.message
    );

    // Reencrypt and decrypt
    const decrypted = await instance.reencrypt(
      encryptedValue,
      privateKey,
      publicKey,
      signature,
      contractAddress,
      userAddress
    );

    return BigInt(decrypted);
  }

  /**
   * Decrypt a publicly accessible value
   * 
   * Used for values that are meant to be publicly readable
   * (e.g., total supply, public counters)
   * 
   * @param encryptedValue - The encrypted value from contract
   * @param contractAddress - Contract that owns the ciphertext
   * @returns Decrypted value as bigint
   */
  async publicDecrypt(
    encryptedValue: bigint,
    contractAddress: string
  ): Promise<bigint> {
    const instance = await this.getInstance();
    
    try {
      // For public decrypt, we use empty keys/signature
      const result = await instance.reencrypt(
        encryptedValue,
        '',
        '',
        '',
        contractAddress,
        ''
      );
      return BigInt(result);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Public decryption failed: ${err.message}`);
    }
  }

  /**
   * Low-level reencryption method with custom parameters
   * 
   * Advanced users can call this directly with their own keypairs
   * and signatures for custom decryption flows.
   */
  async reencrypt(
    encryptedValue: bigint,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddress: string,
    userAddress: string
  ): Promise<bigint> {
    const instance = await this.getInstance();
    
    const result = await instance.reencrypt(
      encryptedValue,
      privateKey,
      publicKey,
      signature,
      contractAddress,
      userAddress
    );

    return BigInt(result);
  }
}