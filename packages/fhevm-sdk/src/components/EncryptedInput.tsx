// packages/fhevm-sdk/src/components/EncryptedInput.tsx

import React, { useState } from 'react';
import { useEncrypt } from '../adapters/react';
import type { EncryptedValue } from '../types';

interface EncryptedInputProps {
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256';
  onEncrypt: (encrypted: EncryptedValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * EncryptedInput - Reusable input component with automatic encryption
 * 
 * Handles user input, validation, and encryption in one component.
 * 
 * @example
 * ```tsx
 * <EncryptedInput
 *   type="uint64"
 *   placeholder="Enter amount"
 *   onEncrypt={(encrypted) => handleSendTip(encrypted)}
 * />
 * ```
 */
export function EncryptedInput({
  type,
  onEncrypt,
  placeholder = 'Enter value',
  disabled = false,
  className = '',
}: EncryptedInputProps) {
  const [value, setValue] = useState('');
  const { encrypt, isEncrypting, error } = useEncrypt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value) return;

    try {
      let encrypted: EncryptedValue;

      if (type === 'uint64' || type === 'uint128' || type === 'uint256') {
        // For 64-bit and larger, convert to bigint
        const bigValue = BigInt(value);
        encrypted = await encrypt[type](bigValue);
      } else {
        // For uint8, uint16, uint32 use number
        const numValue = Number(value);
        encrypted = await encrypt[type](numValue);
      }

      onEncrypt(encrypted);
      setValue('');
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isEncrypting}
        min="0"
      />
      <button type="submit" disabled={disabled || isEncrypting || !value}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt & Submit'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}