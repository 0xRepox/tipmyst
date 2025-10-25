// src/components/ConnectWallet.tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FED10A]/10 border border-[#FED10A]/20">
          <div className="w-2 h-2 bg-[#6BA292] rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-gray-300">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        
        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="gold-button flex items-center gap-2"
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
}