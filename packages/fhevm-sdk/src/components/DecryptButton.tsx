// packages/fhevm-sdk/src/components/DecryptButton.tsx

import React, { useState } from 'react';
import { useDecrypt } from '../adapters/react';
import type { Signer } from 'ethers';

interface DecryptButtonProps {
  encryptedValue: bigint;
  contractAddress: string;
  userAddress: string;
  signer: Signer;
  onDecrypted: (value: bigint) => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * DecryptButton - Reusable button for decrypting values
 * 
 * Handles EIP-712 signature flow and decryption with loading state.
 * 
 * @example
 * ```tsx
 * <DecryptButton
 *   encryptedValue={encryptedBalance}
 *   contractAddress={CONTRACT_ADDRESS}
 *   userAddress={address}
 *   signer={signer}
 *   onDecrypted={(value) => setBalance(value.toString())}
 * >
 *   View My Balance
 * </DecryptButton>
 * ```
 */
export function DecryptButton({
  encryptedValue,
  contractAddress,
  userAddress,
  signer,
  onDecrypted,
  className = '',
  children = 'Decrypt',
}: DecryptButtonProps) {
  const { userDecrypt, isDecrypting, error } = useDecrypt();
  const [hasDecrypted, setHasDecrypted] = useState(false);

  const handleDecrypt = async () => {
    try {
      const decrypted = await userDecrypt(
        encryptedValue,
        contractAddress,
        userAddress,
        signer
      );
      onDecrypted(decrypted);
      setHasDecrypted(true);
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  };

  return (
    <div>
      <button
        onClick={handleDecrypt}
        disabled={isDecrypting || hasDecrypted}
        className={className}
      >
        {isDecrypting ? 'Decrypting...' : hasDecrypted ? 'Decrypted ✓' : children}
      </button>
      {error && <div className="error">{error.message}</div>}
    </div>
  );
}