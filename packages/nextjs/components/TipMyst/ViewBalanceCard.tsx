'use client';

import { useState, useEffect } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { useDecrypt, useContract } from '@fhevm-sdk/core/react';
import { useSigner } from '@/hooks/useSigner';
import { TIP_MYST_ADDRESS, TIP_MYST_ABI } from '@/config/contracts';

export default function ViewBalanceCard() {
  const [pendingTips, setPendingTips] = useState<string | null>(null);
  const [totalTips, setTotalTips] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const { address } = useAccount();
  const signer = useSigner();
  const provider = useProvider();
  const { userDecrypt, isDecrypting } = useDecrypt();
  const { read } = useContract();

  const fetchAndDecryptBalance = async () => {
    if (!address || !signer || !provider) return;

    try {
      setIsLoadingBalance(true);

      // Fetch encrypted pending tips
      const encryptedPending = await read(
        TIP_MYST_ADDRESS,
        TIP_MYST_ABI,
        'getMyPendingTips',
        [],
        provider
      );

      // Decrypt pending tips
      const decryptedPending = await userDecrypt(
        encryptedPending,
        TIP_MYST_ADDRESS,
        address,
        signer
      );
      setPendingTips(decryptedPending.toString());

      // Fetch encrypted total tips
      const encryptedTotal = await read(
        TIP_MYST_ADDRESS,
        TIP_MYST_ABI,
        'getMyTotalTips',
        [],
        provider
      );

      // Decrypt total tips
      const decryptedTotal = await userDecrypt(
        encryptedTotal,
        TIP_MYST_ADDRESS,
        address,
        signer
      );
      setTotalTips(decryptedTotal.toString());

    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-purple-600">💰</span>
        My Tips (Creator View)
      </h2>

      <div className="space-y-4">
        {/* Balance Display */}
        {pendingTips !== null && totalTips !== null ? (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Pending Tips</p>
              <p className="text-3xl font-bold text-purple-600">
                {pendingTips} MYST
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Lifetime Tips</p>
              <p className="text-2xl font-bold text-gray-700">
                {totalTips} MYST
              </p>
            </div>

            <button
              onClick={fetchAndDecryptBalance}
              disabled={isLoadingBalance}
              className="w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition"
            >
              🔄 Refresh
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={fetchAndDecryptBalance}
              disabled={isLoadingBalance || isDecrypting}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoadingBalance || isDecrypting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Decrypting...
                </span>
              ) : (
                '🔓 View My Tips'
              )}
            </button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>🔐 Privacy Note:</strong> Clicking "View My Tips" will 
                request your signature to decrypt your encrypted tips. Only you 
                can view this information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}