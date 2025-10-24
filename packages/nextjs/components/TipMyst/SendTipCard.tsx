'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useEncrypt, useContract } from '@fhevm-sdk/core/react';
import { useSigner } from '@/hooks/useSigner';
import { TIP_MYST_ADDRESS, TIP_MYST_ABI } from '@/config/contracts';
import type { EncryptedValue } from '@fhevm-sdk/core';

export default function SendTipCard() {
  const [creatorAddress, setCreatorAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'encrypting' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { address } = useAccount();
  const signer = useSigner();
  const { encrypt, isEncrypting } = useEncrypt();
  const { call, isLoading } = useContract();

  const handleSendTip = async () => {
    if (!creatorAddress || !amount || !signer) return;

    try {
      setStatus('encrypting');
      setErrorMessage('');

      // Encrypt the tip amount
      const encrypted: EncryptedValue = await encrypt.uint64(BigInt(amount));

      setStatus('sending');

      // Send transaction
      const tx = await call(
        TIP_MYST_ADDRESS,
        TIP_MYST_ABI,
        'sendTip',
        [creatorAddress, encrypted.data, encrypted.handles],
        signer
      );

      // Wait for confirmation
      await tx.wait();

      setStatus('success');
      setAmount('');
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Failed to send tip:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send tip');
    }
  };

  const isValidAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const canSend = creatorAddress && 
                  isValidAddress(creatorAddress) && 
                  amount && 
                  Number(amount) > 0 && 
                  creatorAddress !== address &&
                  !isEncrypting && 
                  !isLoading;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-purple-600">💸</span>
        Send Tip
      </h2>

      <div className="space-y-4">
        {/* Creator Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Creator Address
          </label>
          <input
            type="text"
            value={creatorAddress}
            onChange={(e) => setCreatorAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {creatorAddress && !isValidAddress(creatorAddress) && (
            <p className="text-red-500 text-sm mt-1">Invalid address format</p>
          )}
          {creatorAddress === address && (
            <p className="text-red-500 text-sm mt-1">Cannot tip yourself</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (MYST)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendTip}
          disabled={!canSend || status === 'encrypting' || status === 'sending'}
          className={`w-full py-3 px-4 rounded-lg font-medium transition ${
            canSend && status === 'idle'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {status === 'encrypting' && '🔐 Encrypting...'}
          {status === 'sending' && '📤 Sending...'}
          {status === 'success' && '✅ Tip Sent!'}
          {status === 'error' && '❌ Failed'}
          {status === 'idle' && 'Send Encrypted Tip'}
        </button>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Tip sent successfully! The amount is encrypted and private.
            </p>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              ❌ {errorMessage}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-purple-800 text-sm">
            💡 <strong>Privacy:</strong> The tip amount is encrypted using FHE. 
            Only you and the creator can decrypt and view the amount.
          </p>
        </div>
      </div>
    </div>
  );
}