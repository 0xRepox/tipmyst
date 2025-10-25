import { useEffect, useState } from 'react';
import { FHEVMProvider, useFHEVM } from 'fhevm-sdk/react';
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { Lock, Sparkles, Shield, Zap } from 'lucide-react';
import SendTipCard from './components/SendTipCard';
import ViewBalanceCard from './components/ViewBalanceCard';
import ConnectWallet from './components/ConnectWallet';
import RegisterCreatorCard from './components/RegisterCreatorCard';
import CreatorListCard from './components/CreatorListCard';
import MyTipsCard from './components/MyTipsCard';
import { CONTRACTS } from './constants';

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [injected()],
});

const queryClient = new QueryClient();

function FHEVMInitializer({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { init, isInitialized, isInitializing, error } = useFHEVM();
  const [initError, setInitError] = useState<string>('');

  useEffect(() => {
    const initFHEVM = async () => {
      if (isConnected && !isInitialized && !isInitializing && !initError) {
        console.log('🚀 Starting FHEVM initialization...');
        
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!window.ethereum) {
            throw new Error('No ethereum provider found. Please install MetaMask.');
          }

          console.log('📡 Calling init with provider...');
          await init(window.ethereum);
          console.log('✅ FHEVM initialized successfully!');
        } catch (error: any) {
          console.error('❌ Failed to initialize FHEVM:', error);
          setInitError(error.message || 'Failed to initialize encryption');
        }
      }
    };

    initFHEVM();
  }, [isConnected, isInitialized, isInitializing, init, initError]);

  // 🎭 CONNECT WALLET SPLASH
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FED10A] opacity-10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6BA292] opacity-10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="premium-card max-w-lg w-full text-center relative z-10 stagger-1">
          <div className="float-animation mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FED10A] to-[#FFC700] rounded-3xl flex items-center justify-center shadow-2xl">
              <Lock className="w-12 h-12 text-black" />
            </div>
          </div>
          
          <h1 className="text-6xl font-black mb-4 gold-gradient-text">
            TipMyst
          </h1>
          
          <p className="text-xl text-gray-400 mb-2">Confidential Tipping Platform</p>
          <p className="text-sm text-gray-500 mb-8 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#6BA292]" />
            Powered by Fully Homomorphic Encryption
          </p>
          
          <ConnectWallet />
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 glass-card">
              <Lock className="w-5 h-5 mx-auto mb-2 text-[#FED10A]" />
              <p className="text-gray-400">Encrypted</p>
            </div>
            <div className="p-3 glass-card">
              <Shield className="w-5 h-5 mx-auto mb-2 text-[#6BA292]" />
              <p className="text-gray-400">Private</p>
            </div>
            <div className="p-3 glass-card">
              <Zap className="w-5 h-5 mx-auto mb-2 text-[#FED10A]" />
              <p className="text-gray-400">Instant</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ ERROR STATE
  if (initError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="premium-card max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-red-400">Initialization Error</h2>
          <p className="text-gray-400 mb-6">{initError || error?.message}</p>
          
          <button
            onClick={() => {
              setInitError('');
              window.location.reload();
            }}
            className="gold-button w-full"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ⏳ LOADING STATE
  if (isInitializing || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="gold-spinner mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#FED10A] animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 gold-gradient-text">
            Initializing Encryption
          </h2>
          <p className="text-gray-400 mb-2">Loading cryptographic modules...</p>
          <p className="text-sm text-gray-500">This may take 10-30 seconds</p>
          
          <div className="mt-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FED10A] animate-pulse" />
            <span className="text-xs text-gray-500">Check console for progress</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <FHEVMInitializer>
      <div className="min-h-screen">
        {/* 🎨 PREMIUM HEADER */}
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#FED10A]/20">
          <div className="absolute inset-0 bg-[#080808]/80"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FED10A] to-[#FFC700] rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-black gold-gradient-text">TipMyst</h1>
                  <p className="text-xs text-gray-500">Confidential Tipping on FHEVM</p>
                </div>
              </div>
              
              <ConnectWallet />
            </div>
          </div>
        </header>

        {/* 🌟 HERO SECTION */}
        <section className="relative py-12 sm:py-16 hero-gradient overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FED10A] opacity-5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6BA292] opacity-5 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FED10A]/10 border border-[#FED10A]/20 mb-6">
              <Shield className="w-4 h-4 text-[#FED10A]" />
              <span className="text-sm font-medium text-[#FED10A]">Powered by Zama FHEVM</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
              <span className="gold-gradient-text">Support Creators</span>
              <br />
              <span className="text-white">Privately</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Send encrypted tips using{' '}
              <span className="text-[#6BA292] font-semibold">Fully Homomorphic Encryption</span>
              {' '}— your transactions stay completely confidential
            </p>
          </div>
        </section>

        {/* 📊 MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* TOP 3 CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="stagger-1">
              <ViewBalanceCard />
            </div>
            <div className="stagger-2">
              <RegisterCreatorCard />
            </div>
            <div className="stagger-3">
              <MyTipsCard />
            </div>
          </div>

          {/* BOTTOM 2 CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="stagger-4">
              <CreatorListCard />
            </div>
            <div className="stagger-5">
              <SendTipCard />
            </div>
          </div>
        </main>

        {/* 🏆 PREMIUM FOOTER */}
        <footer className="mt-16 py-8 border-t border-[#FED10A]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#FED10A]" />
                <span className="text-sm text-gray-400">
                  Powered by <span className="text-[#FED10A] font-semibold">Zama FHEVM</span>
                  {' '}• Deployed on <span className="text-[#6BA292] font-semibold">Sepolia</span>
                </span>
              </div>
              
              <div className="flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">MYST:</span>
                  <code className="text-[#FED10A]">{CONTRACTS.MYST_TOKEN.substring(0, 10)}...</code>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">TipMyst:</span>
                  <code className="text-[#6BA292]">{CONTRACTS.TIP_JAR.substring(0, 10)}...</code>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </FHEVMInitializer>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FHEVMProvider>
          <AppContent />
        </FHEVMProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;