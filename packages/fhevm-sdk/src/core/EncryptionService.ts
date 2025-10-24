// packages/fhevm-sdk/src/core/EncryptionService.ts

import type { FhevmInstance } from 'fhevmjs';
import type { EncryptionServiceInterface, EncryptedValue } from '../types';

/**
 * Encryption Service - Handles all encryption operations
 * 
 * Provides methods for encrypting different data types that can be used
 * in FHE smart contracts. All methods return encrypted data and handles
 * that can be sent to contracts.
 * 
 * @example
 * ```typescript
 * const encrypted = await encryption.uint64(1000n);
 * await contract.sendTip(creatorAddress, encrypted.data, encrypted.handles);
 * ```
 */
export class EncryptionService implements EncryptionServiceInterface {
  constructor(private getInstance: () => Promise<FhevmInstance>) {}

  /**
   * Encrypt an 8-bit unsigned integer (0-255)
   */
  async uint8(value: number): Promise<EncryptedValue> {
    this.validateUint(value, 8);
    return this.encryptValue((input) => input.add8(value));
  }

  /**
   * Encrypt a 16-bit unsigned integer (0-65535)
   */
  async uint16(value: number): Promise<EncryptedValue> {
    this.validateUint(value, 16);
    return this.encryptValue((input) => input.add16(value));
  }

  /**
   * Encrypt a 32-bit unsigned integer
   */
  async uint32(value: number): Promise<EncryptedValue> {
    this.validateUint(value, 32);
    return this.encryptValue((input) => input.add32(value));
  }

  /**
   * Encrypt a 64-bit unsigned integer
   * Most commonly used for token amounts, balances, etc.
   */
  async uint64(value: bigint): Promise<EncryptedValue> {
    this.validateBigInt(value, 64);
    return this.encryptValue((input) => input.add64(value));
  }

  /**
   * Encrypt a 128-bit unsigned integer
   */
  async uint128(value: bigint): Promise<EncryptedValue> {
    this.validateBigInt(value, 128);
    return this.encryptValue((input) => input.add128(value));
  }

  /**
   * Encrypt a 256-bit unsigned integer
   */
  async uint256(value: bigint): Promise<EncryptedValue> {
    this.validateBigInt(value, 256);
    return this.encryptValue((input) => input.add256(value));
  }

  /**
   * Encrypt an Ethereum address
   */
  async address(value: string): Promise<EncryptedValue> {
    this.validateAddress(value);
    return this.encryptValue((input) => input.addAddress(value));
  }

  /**
   * Encrypt a boolean value
   */
  async bool(value: boolean): Promise<EncryptedValue> {
    return this.encryptValue((input) => input.addBool(value));
  }

  /**
   * Create an encrypted input builder for multiple values
   * 
   * @example
   * ```typescript
   * const input = await encryption.createEncryptedInput(contractAddr, userAddr);
   * input.add64(1000n);
   * input.add32(500);
   * const encrypted = input.encrypt();
   * ```
   */
  async createEncryptedInput(contractAddress: string, userAddress: string) {
    const instance = await this.getInstance();
    return instance.createEncryptedInput(contractAddress, userAddress);
  }

  /**
   * Internal helper to encrypt a single value
   */
  private async encryptValue(
    addFn: (input: any) => void
  ): Promise<EncryptedValue> {
    const instance = await this.getInstance();
    const encryptedInput = instance.createEncryptedInput('', '');
    addFn(encryptedInput);
    return encryptedInput.encrypt();
  }

  /**
   * Validate unsigned integer bounds
   */
  private validateUint(value: number, bits: number): void {
    const max = 2 ** bits - 1;
    if (value < 0 || value > max) {
      throw new Error(`Value ${value} out of bounds for uint${bits} (0-${max})`);
    }
  }

  /**
   * Validate bigint bounds
   */
  private validateBigInt(value: bigint, bits: number): void {
    const max = (2n ** BigInt(bits)) - 1n;
    if (value < 0n || value > max) {
      throw new Error(`Value ${value} out of bounds for uint${bits} (0-${max})`);
    }
  }

  /**
   * Validate Ethereum address format
   */
  private validateAddress(value: string): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      throw new Error(`Invalid Ethereum address: ${value}`);
    }
  }
}