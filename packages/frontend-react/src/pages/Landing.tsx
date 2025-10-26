import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Zap, Eye, Gift, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useFHEVM } from 'fhevm-sdk/react';

export default function Landing() {
  const navigate = useNavigate();
  const { init, isInitialized } = useFHEVM();

  // Preload SDK in background
  useEffect(() => {
    const preloadSDK = async () => {
      if (!isInitialized && window.ethereum) {
        console.log('🔄 Preloading FHEVM SDK in background...');
        try {
          await init(window.ethereum);
          console.log('✅ SDK preloaded successfully');
        } catch (error) {
          console.log('⚠️ SDK preload failed (user will init on app page):', error);
        }
      }
    };

    preloadSDK();
  }, [init, isInitialized]);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FED10A] opacity-10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6BA292] opacity-10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-[#FED10A]/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/tipmyst.png" alt="TipMyst" className="w-12 h-12 rounded-xl" />
              <div>
                <h1 className="text-2xl font-black gold-gradient-text">TipMyst</h1>
                <p className="text-xs text-gray-500">Confidential Tipping</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/app')}
              className="gold-button flex items-center gap-2"
            >
              Launch App
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FED10A]/10 border border-[#FED10A]/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#FED10A]" />
            <span className="text-sm font-medium text-[#FED10A]">Powered by Zama FHEVM</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 animate-slide-in-up">
            <span className="gold-gradient-text">Receive Tips</span>
            <br />
            <span className="text-white">From Your Supporters</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            A confidential tipping platform for creators. Share your unique link and receive encrypted donations from supporters—keeping amounts completely private.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/app')}
              className="gold-button text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Launch App
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <a
              href="https://github.com/0xRepox/tipmyst"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-bold transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FED10A]/40 flex items-center justify-center gap-2"
            >
              View on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FED10A]/10 to-transparent border border-[#FED10A]/20">
              <Lock className="w-10 h-10 text-[#FED10A] mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-2">100%</h3>
              <p className="text-gray-400">Encrypted</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6BA292]/10 to-transparent border border-[#6BA292]/20">
              <Shield className="w-10 h-10 text-[#6BA292] mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-2">Private</h3>
              <p className="text-gray-400">No one knows</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FED10A]/10 to-transparent border border-[#FED10A]/20">
              <Zap className="w-10 h-10 text-[#FED10A] mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-2">Instant</h3>
              <p className="text-gray-400">On Sepolia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#FED10A]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gold-gradient-text">Why TipMyst?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The first confidential tipping platform where creators control their privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="premium-card group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-[#FED10A]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">For Creators</h3>
              <p className="text-gray-400">
                Register as a creator, get your unique link, and share it with supporters. Receive encrypted tips privately.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="premium-card group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6BA292]/20 to-[#6BA292]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-[#6BA292]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Free to Start (MVP)</h3>
              <p className="text-gray-400">
                Supporters can claim free MYST tokens from our faucet. In production, they'll purchase tokens to tip creators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="premium-card group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-[#FED10A]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Complete Privacy</h3>
              <p className="text-gray-400">
                Tip amounts are encrypted on-chain. No one can see how much supporters sent—not even the blockchain.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="premium-card group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6BA292]/20 to-[#6BA292]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-[#6BA292]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">FHE Technology</h3>
              <p className="text-gray-400">
                Powered by Zama's FHEVM, enabling computation on encrypted data without ever decrypting it.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="premium-card group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-[#FED10A]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Shareable Links</h3>
              <p className="text-gray-400">
                Each creator gets a unique profile. Share your link on social media and start receiving donations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="premium-card group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6BA292]/20 to-[#6BA292]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-[#6BA292]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Built on Ethereum</h3>
              <p className="text-gray-400">
                Deployed on Sepolia testnet with plans for mainnet. Fully decentralized and trustless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="gold-gradient-text">How It Works</span>
            </h2>
            <p className="text-xl text-gray-400">
              Simple, private, and secure in 3 steps
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="premium-card flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#FED10A] to-[#FFC700] flex items-center justify-center text-black text-2xl font-black">
                1
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Register as Creator</h3>
                <p className="text-gray-400">
                  Create your profile with a name, bio, and image. Get your unique creator address to share with supporters.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="premium-card flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#FED10A] to-[#FFC700] flex items-center justify-center text-black text-2xl font-black">
                2
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Share Your Link</h3>
                <p className="text-gray-400">
                  Share your creator address on social media, websites, or directly with supporters who want to tip you.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="premium-card flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#FED10A] to-[#FFC700] flex items-center justify-center text-black text-2xl font-black">
                3
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Receive Encrypted Tips</h3>
                <p className="text-gray-400">
                  Supporters claim free MYST (or purchase in production) and send you encrypted donations. Only you can see your earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="premium-card bg-gradient-to-br from-[#FED10A]/10 to-transparent border-[#FED10A]/30">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="gold-gradient-text">Ready to Receive Tips?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join TipMyst as a creator. Share your link, receive encrypted donations, and keep your earnings completely private.
            </p>
            <button
              onClick={() => navigate('/app')}
              className="gold-button text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Launch TipMyst
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#FED10A]/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FED10A]" />
              <span className="text-sm text-gray-400">
                Powered by <span className="text-[#FED10A] font-semibold">Zama FHEVM</span>
                {' '}• Deployed on <span className="text-[#6BA292] font-semibold">Sepolia</span>
              </span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="https://github.com/0xRepox/tipmyst" target="_blank" rel="noopener noreferrer" className="hover:text-[#FED10A] transition-colors">
                GitHub
              </a>
              <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noopener noreferrer" className="hover:text-[#FED10A] transition-colors">
                Zama Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}