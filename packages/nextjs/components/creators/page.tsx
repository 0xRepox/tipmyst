'use client';

import { useState } from 'react';
import CreatorCard from '@/components/TipMyst/CreatorCard';

export default function CreatorsPage() {
  // Mock creator data - in production, fetch from contract/API
  const mockCreators = [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'Alice Creator',
      description: 'Digital artist creating NFT collections',
      avatar: '🎨',
      tipCount: 42,
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      name: 'Bob Developer',
      description: 'Open source contributor and educator',
      avatar: '💻',
      tipCount: 28,
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      name: 'Carol Writer',
      description: 'Technical writer and blockchain educator',
      avatar: '✍️',
      tipCount: 15,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Creators</h1>
        <p className="text-gray-600">
          Support your favorite creators with confidential tips
        </p>
      </div>

      {/* Search/Filter (placeholder) */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search creators..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCreators.map((creator) => (
          <CreatorCard key={creator.address} creator={creator} />
        ))}
      </div>
    </div>
  );
}