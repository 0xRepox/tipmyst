// packages/fhevm-sdk/src/components/EncryptedBalance.tsx

import React, { useState, useEffect } from 'react';
import { useDecrypt, useContract } from '../adapters/react';
import type { Signer, Provider } from 'ethers';

interface EncryptedBalanceProps {
  contractAddress: string;
  abi: any[];
  functionName: string;
  userAddress: string;
  signer: Signer;
  provider: Provider;
  refreshInterval?: number;
  className?: string;
}

/**
 * EncryptedBalance - Reusable component for displaying decrypted balances
 * 
 * Automatically fetches encrypted balance from contract and provides
 * a button to decrypt and view it.
 * 
 * @example
 * ```tsx
 * <EncryptedBalance
 *   contractAddress={CONTRACT_ADDRESS}
 *   abi={TipMystABI}
 *   functionName="getMyPendingTips"
 *   userAddress={address}
 *   signer={signer}
 *   provider={provider}
 *   refreshInterval={10000}
 * />
 * ```
 */
export function EncryptedBalance({
  contractAddress,
  abi,
  functionName,
  userAddress,
  signer,
  provider,
  refreshInterval,
  className = '',
}: EncryptedBalanceProps) {
  const [encryptedValue, setEncryptedValue] = useState<bigint | null>(null);
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);
  const { read, isLoading } = useContract();
  const { userDecrypt, isDecrypting } = useDecrypt();

  // Fetch encrypted balance
  const fetchBalance = async () => {
    try {
      const encrypted = await read(
        contractAddress,
        abi,
        functionName,
        [],
        provider
      );
      setEncryptedValue(encrypted);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();

    if (refreshInterval) {
      const interval = setInterval(fetchBalance, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [contractAddress, functionName]);

  const handleDecrypt = async () => {
    if (!encryptedValue) return;

    try {
      const decrypted = await userDecrypt(
        encryptedValue,
        contractAddress,
        userAddress,
        signer
      );
      setDecryptedValue(decrypted);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  };

  return (
    <div className={className}>
      {isLoading ? (
        <div>Loading balance...</div>
      ) : decryptedValue !== null ? (
        <div>
          <strong>Balance:</strong> {decryptedValue.toString()}
        </div>
      ) : (
        <button onClick={handleDecrypt} disabled={isDecrypting || !encryptedValue}>
          {isDecrypting ? 'Decrypting...' : 'View Balance'}
        </button>
      )}
    </div>
  );
}