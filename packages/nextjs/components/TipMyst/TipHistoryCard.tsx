'use client';

import { useState, useEffect } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { useDecrypt, useContract } from '@fhevm-sdk/core/react';
import { useSigner } from '@/hooks/useSigner';
import { TIP_MYST_ADDRESS, TIP_MYST_ABI } from '@/config/contracts';

interface TipHistoryItem {
  creator: string;
  amount: string | null;
  isDecrypted: boolean;
}

export default function TipHistoryCard() {
  const [history, setHistory] = useState<TipHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useAccount();
  const signer = useSigner();
  const provider = useProvider();
  const { userDecrypt } = useDecrypt();
  const { read } = useContract();

  // Mock data for demonstration
  // In production, you'd fetch actual tip events from the blockchain
  const mockCreators = [
    '0x1234567890123456789012345678901234567890',
    '0x2345678901234567890123456789012345678901',
  ];

  const decryptTipAmount = async (creator: string) => {
    if (!address || !signer || !provider) return;

    try {
      const encryptedAmount = await read(
        TIP_MYST_ADDRESS,
        TIP_MYST_ABI,
        'getMyTipToCreator',
        [creator],
        provider
      );

      const decrypted = await userDecrypt(
        encryptedAmount,
        TIP_MYST_ADDRESS,
        address,
        signer
      );

      // Update history
      setHistory(prev =>
        prev.map(item =>
          item.creator === creator
            ? { ...item, amount: decrypted.toString(), isDecrypted: true }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to decrypt tip amount:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-purple-600">📜</span>
        My Tipping History
      </h2>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">📭</p>
            <p>No tips sent yet</p>
            <p className="text-sm">Send your first tip to support a creator!</p>
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Creator</p>
                  <p className="font-mono text-sm">
                    {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                  </p>
                </div>

                <div className="flex-1 text-right">
                  {item.isDecrypted ? (
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-bold text-purple-600">
                        {item.amount} MYST
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => decryptTipAmount(item.creator)}
                      className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm transition"
                    >
                      🔓 Decrypt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}