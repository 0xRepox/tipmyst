'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import WalletConnect from '../WalletConnect';

export default function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              TipMyst
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Home
            </Link>
            <Link
              href="/creators"
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Creators
            </Link>
            {isConnected && (
              <Link
                href="/profile"
                className="text-gray-700 hover:text-purple-600 transition"
              >
                Profile
              </Link>
            )}
          </nav>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}