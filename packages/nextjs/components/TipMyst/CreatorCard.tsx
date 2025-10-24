'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Creator {
  address: string;
  name: string;
  description: string;
  avatar: string;
  tipCount: number;
}

interface CreatorCardProps {
  creator: Creator;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleTip = () => {
    // Navigate to home with creator address in state
    router.push(`/?creator=${creator.address}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="text-center mb-4">
        <div className="text-6xl mb-2">{creator.avatar}</div>
        <h3 className="text-xl font-bold">{creator.name}</h3>
        <p className="text-sm text-gray-500 font-mono">
          {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 text-center">
        {creator.description}
      </p>

      {/* Stats */}
      <div className="flex justify-center gap-4 mb-4 text-sm text-gray-600">
        <div className="text-center">
          <p className="font-bold text-purple-600">{creator.tipCount}</p>
          <p>Tips Received</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleTip}
        className={`w-full py-2 px-4 rounded-lg font-medium transition ${
          isHovered
            ? 'bg-purple-600 text-white'
            : 'bg-purple-100 text-purple-700'
        }`}
      >
        💸 Send Tip
      </button>
    </div>
  );
}