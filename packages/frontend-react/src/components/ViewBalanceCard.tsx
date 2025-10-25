import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDecrypt } from 'fhevm-sdk/react';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';
import { Coins, Eye, RefreshCw, Droplet, Lock } from 'lucide-react';

const MYST_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function claimFaucet() external",
  "function canClaimFaucet(address user) external view returns (bool)"
];

const formatMYST = (rawAmount: string) => {
  const num = Number(rawAmount) / 1_000_000;
  return num.toFixed(2);
};

export default function ViewBalanceCard() {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const { address } = useAccount();
  const { decrypt, isDecrypting } = useDecrypt();

  const handleCheckBalance = async () => {
    if (!address) return;

    try {
      setLoading(true);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACTS.MYST_TOKEN, MYST_TOKEN_ABI, signer);

      const encryptedBalance = await contract.balanceOf(address);
      
      console.log('🔐 Encrypted balance handle:', encryptedBalance.toString());

      const decryptedBalance = await decrypt(
        BigInt(encryptedBalance),
        CONTRACTS.MYST_TOKEN,
        address,
        signer
      );

      console.log('✅ Decrypted balance:', decryptedBalance.toString());
      setBalance(decryptedBalance.toString());
    } catch (error: any) {
      console.error('❌ Balance check failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFaucet = async () => {
    if (!address) return;

    try {
      setClaiming(true);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACTS.MYST_TOKEN, MYST_TOKEN_ABI, signer);

      const canClaim = await contract.canClaimFaucet(address);
      if (!canClaim) {
        alert('⏰ Faucet is on cooldown. Wait 24 hours between claims.');
        setClaiming(false);
        return;
      }

      const tx = await contract.claimFaucet();
      await tx.wait();

      alert('🎉 Successfully claimed 10 MYST tokens!');
      
      setTimeout(() => handleCheckBalance(), 2000);
    } catch (error: any) {
      console.error('❌ Faucet claim failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="premium-card h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center">
          <Coins className="w-6 h-6 text-[#FED10A]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">My MYST Balance</h2>
          <p className="text-xs text-gray-500">View your encrypted tokens</p>
        </div>
      </div>

      {balance ? (
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FED10A]/10 to-transparent border border-[#FED10A]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FED10A]/5 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Available Balance
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black gold-gradient-text">
                  {formatMYST(balance)}
                </p>
                <span className="text-lg text-gray-400 font-semibold">MYST</span>
              </div>
      
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCheckBalance}
              disabled={loading || isDecrypting}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 bg-[#FED10A]/10 hover:bg-[#FED10A]/20 border border-[#FED10A]/20 hover:border-[#FED10A]/40 text-[#FED10A] disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || isDecrypting) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleClaimFaucet}
              disabled={claiming}
              className="blue-button flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Droplet className="w-4 h-4" />
              {claiming ? 'Claiming...' : 'Faucet'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* CTA Buttons */}
          <button
            onClick={handleCheckBalance}
            disabled={loading || isDecrypting}
            className="w-full gold-button flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading || isDecrypting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Decrypting...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                View Balance
              </>
            )}
          </button>
          
          <button
            onClick={handleClaimFaucet}
            disabled={claiming}
            className="w-full blue-button flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {claiming ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Claiming...
              </>
            ) : (
              <>
                <Droplet className="w-5 h-5" />
                Claim 10 MYST (Faucet)
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="alert-info flex items-start gap-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Encrypted Balance</p>
              <p className="text-xs opacity-80">
                Click "View Balance" to decrypt and view your encrypted MYST tokens
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}