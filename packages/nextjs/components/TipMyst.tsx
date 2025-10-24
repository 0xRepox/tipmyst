import { useState } from 'react';
import {
  useEncrypt,
  useDecrypt,
  useContract,
  EncryptedInput,
  DecryptButton,
  EncryptedBalance,
} from '@fhevm-sdk/core/react';
import { useSigner, useAccount, useProvider } from 'wagmi';
import TipMystABI from '../contracts/TipMyst.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIP_MYST_ADDRESS!;

export function TipMystApp() {
  const [selectedCreator, setSelectedCreator] = useState('');
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const provider = useProvider();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">TipMyst</h1>
      <p className="text-gray-600 mb-8">
        Send confidential tips to your favorite creators
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Tip */}
        <SendTipCard
          selectedCreator={selectedCreator}
          onCreatorChange={setSelectedCreator}
          signer={signer}
        />

        {/* View Balance */}
        {address && signer && provider && (
          <ViewBalanceCard
            userAddress={address}
            signer={signer}
            provider={provider}
          />
        )}
      </div>

      {/* My Tips History */}
      {address && signer && provider && (
        <TipHistoryCard
          userAddress={address}
          signer={signer}
          provider={provider}
        />
      )}
    </div>
  );
}

function SendTipCard({ selectedCreator, onCreatorChange, signer }: any) {
  const { call, isLoading } = useContract();
  const [success, setSuccess] = useState(false);

  const handleSendTip = async (encrypted: any) => {
    try {
      const tx = await call(
        CONTRACT_ADDRESS,
        TipMystABI,
        'sendTip',
        [selectedCreator, encrypted.data, encrypted.handles],
        signer!
      );
      await tx.wait();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send tip:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Send Tip</h2>
      
      <input
        type="text"
        placeholder="Creator address (0x...)"
        value={selectedCreator}
        onChange={(e) => onCreatorChange(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <EncryptedInput
        type="uint64"
        placeholder="Amount (MYST)"
        onEncrypt={handleSendTip}
        disabled={!selectedCreator || isLoading}
        className="w-full"
      />

      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          ✅ Tip sent successfully!
        </div>
      )}
    </div>
  );
}

function ViewBalanceCard({ userAddress, signer, provider }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">My Tips</h2>
      
      <EncryptedBalance
        contractAddress={CONTRACT_ADDRESS}
        abi={TipMystABI}
        functionName="getMyPendingTips"
        userAddress={userAddress}
        signer={signer}
        provider={provider}
        refreshInterval={10000}
        className="mb-4"
      />

      <EncryptedBalance
        contractAddress={CONTRACT_ADDRESS}
        abi={TipMystABI}
        functionName="getMyTotalTips"
        userAddress={userAddress}
        signer={signer}
        provider={provider}
        className="text-gray-600"
      />
    </div>
  );
}

function TipHistoryCard({ userAddress, signer, provider }: any) {
  // Implementation for showing tip history
  // This would fetch and decrypt tips sent to various creators
  return (
    <div className="mt-6 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">My Tip History</h2>
      <p className="text-gray-600">
        View your tipping history across all creators
      </p>
      {/* Add implementation */}
    </div>
  );
}