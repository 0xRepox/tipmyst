import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDecrypt } from 'fhevm-sdk/react';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';
import { Gift, Eye, RefreshCw, TrendingUp, Lock } from 'lucide-react';

const TIP_MYST_ABI = [
  "function getMyPendingTips() external view returns (uint256)",
  "function isCreator(address creator) external view returns (bool)"
];

export default function MyTipsCard() {
  const [pendingTips, setPendingTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const { address } = useAccount();
  const { decrypt, isDecrypting } = useDecrypt();

  const checkAndViewTips = async () => {
    if (!address) return;

    try {
      setLoading(true);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, signer);

      const creator = await contract.isCreator(address);
      setIsCreator(creator);

      if (!creator) {
        alert('❌ You must be a registered creator to view tips!');
        setLoading(false);
        return;
      }

      const encryptedTips = await contract.getMyPendingTips();
      console.log('🔐 Encrypted tips handle:', encryptedTips.toString());

      const decryptedTips = await decrypt(
        BigInt(encryptedTips),
        CONTRACTS.TIP_JAR,
        address,
        signer
      );

      console.log('✅ Decrypted tips:', decryptedTips.toString());
      setPendingTips(decryptedTips.toString());
    } catch (error: any) {
      console.error('❌ View tips failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6BA292]/20 to-[#6BA292]/5 flex items-center justify-center">
          <Gift className="w-6 h-6 text-[#6BA292]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">My Tips Received</h2>
          <p className="text-xs text-gray-500">View your encrypted earnings</p>
        </div>
      </div>

      {pendingTips ? (
        <div className="space-y-4">
          {/* Tips Display */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#6BA292]/10 to-transparent border border-[#6BA292]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6BA292]/5 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Pending Tips
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-5xl font-black text-[#6BA292]">
                  {(Number(pendingTips) / 1_000_000).toFixed(2)}
                </p>
                <span className="text-lg text-gray-400 font-semibold">MYST</span>
              </div>
          
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={checkAndViewTips}
            disabled={loading || isDecrypting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 bg-[#6BA292]/10 hover:bg-[#6BA292]/20 border border-[#6BA292]/20 hover:border-[#6BA292]/40 text-[#6BA292] disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || isDecrypting) ? 'animate-spin' : ''}`} />
            Refresh Tips
          </button>

          {/* Withdraw Info */}
          <div className="alert-success flex items-start gap-3">
            <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">💡 Withdraw Tips</p>
              <p className="opacity-80">
                You can withdraw your earnings by calling the contract directly!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* View Tips Button */}
          <button
            onClick={checkAndViewTips}
            disabled={loading || isDecrypting}
            className="w-full blue-button flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading || isDecrypting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Decrypting...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                View My Tips
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="alert-info flex items-start gap-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Encrypted Tips</p>
              <p className="opacity-80">
                Click to decrypt your encrypted tips received
              </p>
              {isCreator === false && (
                <p className="mt-2 text-xs flex items-center gap-1">
                  <span>⚠️</span> You must register as a creator first
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}