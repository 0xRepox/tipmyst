'use client';

import { useAccount } from 'wagmi';
import { useFHEVM } from '@fhevm-sdk/core/react';
import ViewBalanceCard from '@/components/TipMyst/ViewBalanceCard';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { isInitialized } = useFHEVM();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">My Profile</h1>
        <p className="text-gray-600">Connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600 font-mono text-sm">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Creator Status</p>
            <p className="text-2xl font-bold text-purple-600">Active</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Network</p>
            <p className="text-2xl font-bold text-blue-600">Sepolia</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Privacy</p>
            <p className="text-2xl font-bold text-green-600">Encrypted</p>
          </div>
        </div>
      </div>

      {/* Creator Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewBalanceCard />

        {/* Share Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Share Your Profile</h2>
          <p className="text-gray-600 mb-4">
            Share your address with supporters so they can send you tips
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Creator Address:</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(address || '')}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            📋 Copy Address
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-2">🔐 Privacy & Security</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✅ All tip amounts are encrypted using FHE</li>
          <li>✅ Only you can decrypt and view your tips</li>
          <li>✅ Tippers remain anonymous unless they choose to reveal themselves</li>
          <li>✅ Transaction data is secured by Zama's KMS</li>
        </ul>
      </div>
    </div>
  );
}