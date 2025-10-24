// packages/fhevm-sdk/src/core/TokenService.ts

import { Contract, type Signer } from "ethers";
import type { FhevmInstance } from "fhevmjs";
import type { ITokenService } from "../types";
import { EncryptionService } from "./EncryptionService";
import { DecryptionService } from "./DecryptionService";

// Minimal ABI for MYSTToken contract
const MYST_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, bytes memory encryptedAmount, bytes calldata inputProof) returns (bool)",
  "function approve(address spender, bytes memory encryptedAmount, bytes calldata inputProof) returns (bool)",
  "function claimFaucet() returns (bool)",
  "function canClaimFaucet(address user) view returns (bool)",
  "function timeUntilNextClaim(address user) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
];

/**
 * Token Service - MYST Token Operations
 * 
 * Handles all MYST token operations including transfers, balance checks,
 * approvals, and faucet claims.
 * 
 * @example
 * ```typescript
 * const service = new TokenService(tokenAddress, getInstance, encryption, decryption);
 * const balance = await service.getDecryptedBalance(userAddress, signer);
 * ```
 */
export class TokenService implements ITokenService {
  private contractAddress: string;
  private getInstance: () => Promise<FhevmInstance>;
  private encryption: EncryptionService;
  private decryption: DecryptionService;

  constructor(
    contractAddress: string,
    getInstance: () => Promise<FhevmInstance>,
    encryption: EncryptionService,
    decryption: DecryptionService
  ) {
    this.contractAddress = contractAddress;
    this.getInstance = getInstance;
    this.encryption = encryption;
    this.decryption = decryption;
  }

  /**
   * Get encrypted balance handle
   * 
   * @param address - Address to check balance for
   * @returns Encrypted balance handle
   */
  async getBalance(address: string): Promise<bigint> {
    try {
      await this.getInstance(); // Ensure initialized
      const provider = await this._getProvider();
      const contract = new Contract(this.contractAddress, MYST_TOKEN_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      return BigInt(balance.toString());
    } catch (error) {
      throw new Error(
        `Failed to get balance: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get decrypted balance (readable)
   * 
   * @param address - Address to check
   * @param signer - Signer for decryption signature
   * @returns Decrypted balance as formatted string
   */
  async getDecryptedBalance(address: string, signer: Signer): Promise<string> {
    try {
      const encryptedBalance = await this.getBalance(address);
      
      if (encryptedBalance === 0n) {
        return "0";
      }

      const decrypted = await this.decryption.decrypt(
        this.contractAddress,
        encryptedBalance,
        address,
        signer
      );

      // Format with 18 decimals
      return this.decryption.formatDecrypted(decrypted, 18);
    } catch (error) {
      throw new Error(
        `Failed to decrypt balance: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Transfer MYST tokens
   * 
   * @param to - Recipient address
   * @param amount - Amount to transfer (in wei or as number)
   * @param signer - Signer to send transaction
   * @returns Transaction receipt
   */
  async transfer(to: string, amount: number | bigint, signer: Signer): Promise<any> {
    try {
      // Encrypt amount
      const encrypted = await this.encryption.encryptUint64(amount);
      
      // Get contract instance
      const contract = new Contract(this.contractAddress, MYST_TOKEN_ABI, signer);
      
      // Send transaction
      const tx = await contract.transfer(to, encrypted.handles[0], encrypted.inputProof);
      return await tx.wait();
    } catch (error) {
      throw new Error(
        `Failed to transfer: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Approve spender
   * 
   * @param spender - Spender address (e.g., TipMyst contract)
   * @param amount - Amount to approve
   * @param signer - Signer
   * @returns Transaction receipt
   */
  async approve(spender: string, amount: number | bigint, signer: Signer): Promise<any> {
    try {
      const encrypted = await this.encryption.encryptUint64(amount);
      const contract = new Contract(this.contractAddress, MYST_TOKEN_ABI, signer);
      
      const tx = await contract.approve(spender, encrypted.handles[0], encrypted.inputProof);
      return await tx.wait();
    } catch (error) {
      throw new Error(
        `Failed to approve: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Claim free MYST from faucet
   * 
   * @param signer - Signer
   * @returns Transaction receipt
   */
  async claimFaucet(signer: Signer): Promise<any> {
    try {
      const contract = new Contract(this.contractAddress, MYST_TOKEN_ABI, signer);
      const tx = await contract.claimFaucet();
      return await tx.wait();
    } catch (error) {
      throw new Error(
        `Failed to claim faucet: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if user can claim from faucet
   * 
   * @param address - User address
   * @returns true if can claim
   */
  async canClaimFaucet(address: string): Promise<boolean> {
    try {
      await this.getInstance();
      const provider = await this._getProvider();
      const contract = new Contract(this.contractAddress, MYST_TOKEN_ABI, provider);
      
      return await contract.canClaimFaucet(address);
    } catch (error) {
      throw new Error(
        `Failed to check faucet: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get time until next faucet claim
   * 
   * @param address - User address
   * @returns Seconds until next claim (0 if can claim now)
   */
  async timeUntilNextClaim(address: string): Promise<number> {
    try {
      await this.getInstance();
      const provider = await this._getProvider();
      const contract = new Contract(this.contractAddress, MYST_TOKEN_ABI, provider);
      
      const time = await contract.timeUntilNextClaim(address);
      return Number(time);
    } catch (error) {
      throw new Error(
        `Failed to get claim time: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Helper: Get provider from signer or create one
   */
  private async _getProvider() {
    // In a real implementation, you'd get this from the signer or create one
    // For now, we'll assume the signer has a provider
    return null; // Placeholder
  }
}