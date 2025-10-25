/**
 * FHEVM Core Client - Framework-agnostic
 * Uses CDN-loaded RelayerSDK
 */

import type { BrowserProvider, Eip1193Provider } from 'ethers';
import { initializeFheInstance, getFheInstance, resetFheInstance } from './fhevmInstance';

type FhevmInstance = any;

export interface FHEVMConfig {
  aclContractAddress: string;
  kmsContractAddress: string;
  inputVerifierContractAddress: string;
  verifyingContractAddressDecryption: string;
  verifyingContractAddressInputVerification: string;
  chainId: number;
  gatewayChainId: number;
  network: string | Eip1193Provider | BrowserProvider;
  relayerUrl: string;
}

export const SepoliaConfig: Omit<FHEVMConfig, 'network'> = {
  aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
  verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
  chainId: 11155111,
  gatewayChainId: 55815,
  network: 'https://eth-sepolia.public.blastapi.io',
  relayerUrl: 'https://relayer.testnet.zama.cloud',
};

export class FHEVMClient {
  private instance: FhevmInstance | null = null;
  private config: Partial<FHEVMConfig>;

  constructor(config: Partial<FHEVMConfig> = {}) {
    this.config = { ...SepoliaConfig, ...config };
  }

  async init(provider?: Eip1193Provider | BrowserProvider): Promise<void> {
    if (this.instance) {
      console.warn('⚠️ FHEVM instance already initialized');
      return;
    }

    try {
      console.log('🔄 Initializing FHEVM instance...');
      this.instance = await initializeFheInstance();
      console.log('✅ FHEVM instance initialized successfully');
      
      // Verify the instance works
      try {
        const publicKey = this.instance.getPublicKey();
        const pkStr = typeof publicKey === 'string' ? publicKey : JSON.stringify(publicKey);
        console.log('✅ Public key retrieved:', pkStr.substring(0, 30) + '...');
      } catch (pkError) {
        console.log('ℹ️ Public key verification skipped');
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize FHEVM:', error);
      throw error;
    }
  }

  getInstance(): FhevmInstance {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized. Call init() first.');
    }
    return this.instance;
  }

  isInitialized(): boolean {
    return this.instance !== null;
  }

  createEncryptedInput(contractAddress: string, userAddress: string): any {
    const instance = this.getInstance();
    return instance.createEncryptedInput(contractAddress, userAddress);
  }

  /**
   * User decryption - decrypt data that belongs to the user
   * Follows Zama's user decryption process with EIP-712 signing
   */
  async decrypt(
    handle: bigint,
    contractAddress: string,
    userAddress: string,
    signer: any
  ): Promise<bigint> {
    const instance = this.getInstance();
    
    try {
      console.log('🔓 Starting user decryption for handle:', handle.toString());
      
      // Step 1: Generate keypair
      const keypair = instance.generateKeypair();
      console.log('✅ Keypair generated');
      
      // Step 2: Prepare handle-contract pairs
      const handleContractPairs = [{
        handle: '0x' + handle.toString(16).padStart(64, '0'),
        contractAddress: contractAddress,
      }];
      
      // Step 3: Create EIP-712 message
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10'; // 10 days validity
      const contractAddresses = [contractAddress];
      
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays,
      );
      
      console.log('✅ EIP-712 message created');
      
      // Step 4: Sign the EIP-712 message
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );
      
      console.log('✅ EIP-712 signature obtained');
      
      // Step 5: Perform user decryption
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        userAddress,
        startTimeStamp,
        durationDays,
      );
      
      console.log('✅ User decryption successful');
      
      // Extract the decrypted value
      const handleKey = handleContractPairs[0].handle;
      const decryptedValue = result[handleKey];
      
      console.log('✅ Decrypted value:', decryptedValue);
      
      return BigInt(decryptedValue);
    } catch (error: any) {
      console.error('❌ User decryption failed:', error);
      throw new Error(`Decryption failed: ${error.message || error}`);
    }
  }

  /**
   * Public decryption - decrypt data that's meant to be public
   */
  async publicDecrypt(handles: bigint[]): Promise<Record<string, bigint>> {
    const instance = this.getInstance();
    
    try {
      console.log('🔓 Starting public decryption for handles:', handles);
      
      const handleStrings = handles.map(h => '0x' + h.toString(16).padStart(64, '0'));
      const values = await instance.publicDecrypt(handleStrings);
      
      console.log('✅ Public decryption successful:', values);
      
      return values;
    } catch (error: any) {
      console.error('❌ Public decryption failed:', error);
      throw new Error(`Public decryption failed: ${error.message || error}`);
    }
  }

  getPublicKey(): any {
    const instance = this.getInstance();
    return instance.getPublicKey();
  }
}

let globalClient: FHEVMClient | null = null;

export function getFHEVMClient(config?: Partial<FHEVMConfig>): FHEVMClient {
  if (!globalClient) {
    globalClient = new FHEVMClient(config);
  }
  return globalClient;
}

export function resetFHEVMClient(): void {
  globalClient = null;
  resetFheInstance();
}

export { initializeFheInstance as initFHEVM };
