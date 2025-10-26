import { useEffect, useState } from 'react';
import { useFHEVM } from 'fhevm-sdk/react';
import { useAccount, useChainId } from 'wagmi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { sepolia } from 'wagmi/chains';
import ViewBalanceCard from '../components/ViewBalanceCard';
import ConnectWallet from '../components/ConnectWallet';
import RegisterCreatorCard from '../components/RegisterCreatorCard';
import CreatorListCard from '../components/CreatorListCard';
import MyTipsCard from '../components/MyTipsCard';
import { Lock, AlertTriangle, Users, Sparkles, ArrowLeftRight } from 'lucide-react';
import { CONTRACTS } from '../constants';

type UserRole = 'supporter' | 'creator' | null;

export default function DApp() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { init, isInitialized, isInitializing, error } = useFHEVM();
  const [initError, setInitError] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [preSelectedCreator, setPreSelectedCreator] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  useEffect(() => {
    const creatorParam = searchParams.get('creator');
    
    if (creatorParam && isConnected) {
      if (/^0x[a-fA-F0-9]{40}$/.test(creatorParam)) {
        setPreSelectedCreator(creatorParam);
        setUserRole('supporter');
        console.log('🔗 Shared creator link detected:', creatorParam);
      }
    }
  }, [searchParams, isConnected]);

  useEffect(() => {
    const initFHEVM = async () => {
      if (isConnected && !isWrongNetwork && !isInitialized && !isInitializing && !initError) {
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
  }, [isConnected, isWrongNetwork, isInitialized, isInitializing, init, initError]);

  const handleClearPreSelected = () => {
    setPreSelectedCreator('');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#080808]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FED10A] opacity-10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6BA292] opacity-10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <header className="relative z-10 bg-[#080808]/80 backdrop-blur-xl border-b border-[#FED10A]/20">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <img src="/tipmyst.png" alt="TipMyst" className="w-12 h-12 rounded-xl" />
              <div>
                <h1 className="text-3xl font-bold gold-gradient-text">TipMyst</h1>
                <p className="text-sm text-gray-600">Confidential Tipping on FHEVM</p>
              </div>
            </div>
            <ConnectWallet />
          </div>
        </header>

        <div className="relative z-10 flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center max-w-2xl px-4">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#FED10A] to-[#FFC700] rounded-full flex items-center justify-center shadow-2xl float-animation">
              <Lock className="w-16 h-16 text-black" />
            </div>
            
            <h2 className="text-5xl font-black mb-6">
              <span className="gold-gradient-text">Connect Your Wallet</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              To start sending confidential tips, connect your Ethereum wallet
            </p>
            
            <div className="flex justify-center">
              <ConnectWallet />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <Lock className="w-8 h-8 mx-auto mb-3 text-[#FED10A]" />
                <p className="text-sm text-gray-400">Encrypted Tips</p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <Lock className="w-8 h-8 mx-auto mb-3 text-[#6BA292]" />
                <p className="text-sm text-gray-400">Private Balances</p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <Lock className="w-8 h-8 mx-auto mb-3 text-[#FED10A]" />
                <p className="text-sm text-gray-400">Secure Transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="premium-card max-w-md w-full text-center border-red-500/30">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-red-400">Wrong Network</h2>
          <p className="text-gray-400 mb-6">
            Please switch to <span className="text-[#6BA292] font-semibold">Sepolia Testnet</span> to use TipMyst
          </p>
          
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left text-sm mb-6">
            <p className="font-semibold mb-2">How to switch:</p>
            <ol className="list-decimal ml-4 space-y-1 text-gray-400">
              <li>Open MetaMask</li>
              <li>Click the network dropdown</li>
              <li>Select "Sepolia"</li>
            </ol>
          </div>

          <ConnectWallet />
        </div>
      </div>
    );
  }

  if (initError || error) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="premium-card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">⚠️ Initialization Error</h2>
          <p className="text-gray-600 mb-6">{initError || error?.message}</p>
          <button
            onClick={() => {
              setInitError('');
              window.location.reload();
            }}
            className="gold-button w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isInitializing || !isInitialized) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
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
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-[#080808]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FED10A] opacity-5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6BA292] opacity-5 rounded-full blur-[120px]"></div>
        </div>

        <header className="relative z-10 bg-[#080808]/80 backdrop-blur-xl border-b border-[#FED10A]/20">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <img src="/tipmyst.png" alt="TipMyst" className="w-12 h-12 rounded-xl" />
              <div>
                <h1 className="text-3xl font-bold gold-gradient-text">TipMyst</h1>
                <p className="text-sm text-gray-600">Confidential Tipping on FHEVM</p>
              </div>
            </div>
            <ConnectWallet />
          </div>
        </header>

        <div className="relative z-10 flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="max-w-4xl w-full px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black mb-4 gold-gradient-text">
                Choose Your Role
              </h2>
              <p className="text-xl text-gray-400">
                How would you like to use TipMyst today?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={() => setUserRole('supporter')}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-[#FED10A]/10 to-transparent border-2 border-[#FED10A]/20 hover:border-[#FED10A]/60 transition-all duration-300 hover:scale-105 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FED10A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative">
                  <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-[#FED10A] to-[#FFC700] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-3 text-white group-hover:text-[#FED10A] transition-colors">
                    I'm a Supporter
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    Browse creators and send confidential tips to support their work
                  </p>
                  
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FED10A] mt-1">✓</span>
                      <span className="text-gray-400">Browse all registered creators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FED10A] mt-1">✓</span>
                      <span className="text-gray-400">Send encrypted tips privately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FED10A] mt-1">✓</span>
                      <span className="text-gray-400">View your MYST balance</span>
                    </li>
                  </ul>
                </div>
              </button>

              <button
                onClick={() => setUserRole('creator')}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-[#6BA292]/10 to-transparent border-2 border-[#6BA292]/20 hover:border-[#6BA292]/60 transition-all duration-300 hover:scale-105 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#6BA292]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                
                <div className="relative">
                  <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-br from-[#6BA292] to-[#5A9282] flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-3 text-white group-hover:text-[#6BA292] transition-colors">
                    I'm a Creator
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    Register your profile and receive confidential tips from supporters
                  </p>
                  
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#6BA292] mt-1">✓</span>
                      <span className="text-gray-400">Register as a creator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6BA292] mt-1">✓</span>
                      <span className="text-gray-400">View encrypted tips received</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6BA292] mt-1">✓</span>
                      <span className="text-gray-400">Share your creator link</span>
                    </li>
                  </ul>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FED10A] opacity-5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6BA292] opacity-5 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 bg-[#080808]/80 backdrop-blur-xl border-b border-[#FED10A]/20">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <img src="/tipmyst.png" alt="TipMyst" className="w-12 h-12 rounded-xl" />
            <div>
              <h1 className="text-3xl font-bold gold-gradient-text">TipMyst</h1>
              <p className="text-sm text-gray-600">
                {userRole === 'supporter' ? 'Support Creators' : 'Creator Dashboard'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUserRole(userRole === 'supporter' ? 'creator' : 'supporter')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#FED10A]/40 text-sm text-white hover:text-[#FED10A] transition-all"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Switch to {userRole === 'supporter' ? 'Creator' : 'Supporter'}
            </button>
            <ConnectWallet />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {userRole === 'supporter' ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-5xl font-black mb-4">
                <span className="gold-gradient-text">Support Creators</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Send confidential tips using Fully Homomorphic Encryption. Your generosity, their privacy.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stagger-1">
              <div className="premium-card border-[#FED10A]/20 hover:border-[#FED10A]/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FED10A] to-[#FFC700] flex items-center justify-center">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Privacy</p>
                    <p className="text-lg font-bold text-white">100% Encrypted</p>
                  </div>
                </div>
              </div>

              <div className="premium-card border-[#6BA292]/20 hover:border-[#6BA292]/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6BA292] to-[#5A9282] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Creators</p>
                    <p className="text-lg font-bold text-white">Browse Now</p>
                  </div>
                </div>
              </div>

              <div className="premium-card border-[#FED10A]/20 hover:border-[#FED10A]/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FED10A] to-[#FFC700] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Network</p>
                    <p className="text-lg font-bold text-white">Sepolia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="mb-8 stagger-2">
              <ViewBalanceCard />
            </div>

            {/* Browse Creators */}
            <div className="stagger-3">
              <div className="premium-card border-[#6BA292]/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6BA292] to-[#5A9282] flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Browse Creators</h3>
                      <p className="text-sm text-gray-500">Support your favorite creators</p>
                    </div>
                  </div>
                </div>

                <CreatorListCard 
                  preSelectedCreator={preSelectedCreator}
                  onClearPreSelected={handleClearPreSelected}
                />
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mt-12 premium-card border-[#FED10A]/20 stagger-4">
              <h3 className="text-xl font-bold mb-6 text-center gold-gradient-text">
                How TipMyst Works
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FED10A]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FED10A]">1</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">Get MYST Tokens</h4>
                  <p className="text-sm text-gray-400">Claim free tokens from the faucet</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6BA292]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#6BA292]">2</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">Browse Creators</h4>
                  <p className="text-sm text-gray-400">Find creators you want to support</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FED10A]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FED10A]">3</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">Send Tips</h4>
                  <p className="text-sm text-gray-400">Tip creators with encrypted amounts</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6BA292]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#6BA292]">4</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">Stay Private</h4>
                  <p className="text-sm text-gray-400">All amounts remain encrypted on-chain</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-3">Creator Dashboard</h2>
              <p className="text-gray-400">Manage your profile and view encrypted tips</p>
            </div>

            <div className="mb-8 stagger-1">
              <ViewBalanceCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="stagger-2">
                <RegisterCreatorCard />
              </div>
              <div className="stagger-3">
                <MyTipsCard />
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="relative z-10 mt-12 py-6 text-center text-gray-600 text-sm border-t border-[#FED10A]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FED10A]" />
              <span className="text-sm text-gray-400">
                Powered by <span className="text-[#FED10A] font-semibold">Zama FHEVM</span>
                {' '}• Deployed on <span className="text-[#6BA292] font-semibold">Sepolia</span>
              </span>
            </div>
            
            <div className="flex gap-4 text-xs">
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
  );
}