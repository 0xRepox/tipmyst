'use client';

import { useAccount } from 'wagmi';
import { useFHEVM } from '@fhevm-sdk/core/react';
import Link from 'next/link';
import SendTipCard from '@/components/TipMyst/SendTipCard';
import ViewBalanceCard from '@/components/TipMyst/ViewBalanceCard';
import TipHistoryCard from '@/components/TipMyst/TipHistoryCard';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { isInitialized, isLoading } = useFHEVM();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to TipMyst
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Send confidential tips to your favorite creators using fully homomorphic encryption
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-700 mb-6">
              Connect your wallet to start tipping creators privately
            </p>
            {/* WalletConnect component will show connect button */}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing FHEVM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">TipMyst Dashboard</h1>
        <p className="text-gray-600">
          Your confidential tipping platform powered by FHEVM
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Send Tip */}
        <SendTipCard />

        {/* View Balance (if creator) */}
        <ViewBalanceCard />
      </div>

      {/* Tip History */}
      <TipHistoryCard />

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/creators"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <h3 className="font-bold text-lg mb-2">Browse Creators</h3>
          <p className="text-gray-600 text-sm">
            Discover creators to support
          </p>
        </Link>

        <Link
          href="/profile"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <h3 className="font-bold text-lg mb-2">My Profile</h3>
          <p className="text-gray-600 text-sm">
            View your creator stats
          </p>
        </Link>

        <a
          href="https://docs.zama.ai/fhevm"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <h3 className="font-bold text-lg mb-2">Learn More</h3>
          <p className="text-gray-600 text-sm">
            About FHEVM technology
          </p>
        </a>
      </div>
    </div>
  );
}