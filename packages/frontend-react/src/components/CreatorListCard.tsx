import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEncrypt } from 'fhevm-sdk/react';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';
import { Users, ArrowLeft, Send, Info, Lock, Search, Share2, Check } from 'lucide-react';

const TIP_MYST_ABI = [
  "function getAllCreators() external view returns (address[])",
  "function getCreator(address creator) external view returns (tuple(string name, string bio, string category, string imageUrl, address wallet, uint256 supporterCount, bool exists))",
  "function sendTip(address creator, uint64 amount) external",
  "function recordTip(address creator, uint64 amount) external"
];

const MYST_TOKEN_ABI = [
  "function transfer(address to, bytes32 inputHandle, bytes calldata inputProof) external returns (bool)"
];

interface Creator {
  address: string;
  name: string;
  bio: string;
  category: string;
  imageUrl: string;
  supporterCount: string;
}

interface CreatorListCardProps {
  preSelectedCreator?: string;
  onClearPreSelected?: () => void;
}

// Helper function to get safe image URL with fallback
const getSafeImageUrl = (url: string, name: string): string => {
  if (!url || url.trim() === '' || url === 'placeholder.jpg') {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=FED10A&fontSize=40`;
  }
  return url;
};

// Avatar component with error handling
const CreatorAvatar = ({ src, name, className = '' }: { src: string; name: string; className?: string }) => {
  const [imgSrc, setImgSrc] = useState(getSafeImageUrl(src, name));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback to avatar generator
      setImgSrc(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=FED10A&fontSize=40`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={name}
      className={className}
      onError={handleError}
      crossOrigin="anonymous"
      loading="lazy"
    />
  );
};

export default function CreatorListCard({ preSelectedCreator, onClearPreSelected }: CreatorListCardProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [tipping, setTipping] = useState(false);
  const [tipStep, setTipStep] = useState<'encrypting' | 'transferring' | 'recording' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const { address } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt();

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (preSelectedCreator && creators.length > 0 && !selectedCreator && !hasAutoSelected) {
      const creator = creators.find(
        c => c.address.toLowerCase() === preSelectedCreator.toLowerCase()
      );
      if (creator) {
        setSelectedCreator(creator);
        setHasAutoSelected(true);
        console.log('✅ Auto-selected creator from shared link:', creator.name);
      }
    }
  }, [preSelectedCreator, creators, selectedCreator, hasAutoSelected]);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, provider);

      const creatorAddresses = await contract.getAllCreators();
      
      const creatorData = await Promise.all(
        creatorAddresses.map(async (addr: string) => {
          const info = await contract.getCreator(addr);
          return {
            address: addr,
            name: info[0],
            bio: info[1],
            category: info[2],
            imageUrl: info[3],
            supporterCount: info[5].toString()
          };
        })
      );

      setCreators(creatorData.filter((c: Creator) => c.address.toLowerCase() !== address?.toLowerCase()));
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCreatorData = async (creatorAddress: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, provider);
      
      const info = await contract.getCreator(creatorAddress);
      const updatedCreator: Creator = {
        address: creatorAddress,
        name: info[0],
        bio: info[1],
        category: info[2],
        imageUrl: info[3],
        supporterCount: info[5].toString()
      };

      setCreators(prev => prev.map(c => 
        c.address.toLowerCase() === creatorAddress.toLowerCase() 
          ? updatedCreator 
          : c
      ));

      if (selectedCreator?.address.toLowerCase() === creatorAddress.toLowerCase()) {
        setSelectedCreator(updatedCreator);
      }

      console.log('🔄 Refreshed creator data:', updatedCreator.name, 'Supporters:', updatedCreator.supporterCount);
      return updatedCreator;
    } catch (error) {
      console.error('Failed to refresh creator:', error);
      return null;
    }
  };

  const copyCreatorLink = async (creatorAddress: string) => {
    const link = `${window.location.origin}${window.location.pathname}?creator=${creatorAddress}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const filteredCreators = creators.filter(creator => 
    creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendTip = async () => {
    if (!selectedCreator || !tipAmount || !address) return;

    try {
      setTipping(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const rawAmount = BigInt(Number(tipAmount) * 1_000_000);

      console.log('🚀 Starting tip flow...');

      setTipStep('encrypting');
      console.log('🔐 Step 1/3: Encrypting amount...');
      const encrypted = await encrypt(
        CONTRACTS.MYST_TOKEN,
        address,
        (input) => input.add64(rawAmount)
      );
      console.log('✅ Encryption complete');

      setTipStep('transferring');
      console.log('📤 Step 2/3: Transferring tokens...');
      const tokenContract = new ethers.Contract(CONTRACTS.MYST_TOKEN, MYST_TOKEN_ABI, signer);
      const transferTx = await tokenContract.transfer(CONTRACTS.TIP_JAR, encrypted.handles[0], encrypted.proof);
      const transferReceipt = await transferTx.wait(1);
      console.log('✅ Transfer confirmed:', transferReceipt.hash);

      setTipStep('recording');
      console.log('📝 Step 3/3: Recording tip...');
      const tipContract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, signer);
      const tipTx = await tipContract.sendTip(selectedCreator.address, rawAmount, { gasLimit: 500000 });
      const tipReceipt = await tipTx.wait(1);
      console.log('✅ Recording confirmed:', tipReceipt.hash);

      console.log('🔄 Refreshing creator data...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      const refreshedCreator = await refreshCreatorData(selectedCreator.address);

      if (refreshedCreator) {
        alert(`🎉 Successfully tipped ${refreshedCreator.name} ${tipAmount} MYST!\n\nSupporters: ${refreshedCreator.supporterCount}`);
      } else {
        alert(`🎉 Successfully tipped ${selectedCreator.name} ${tipAmount} MYST!`);
      }

      setSelectedCreator(null);
      setTipAmount('');
      setTimeout(() => loadCreators(), 1000);

    } catch (error: any) {
      console.error('❌ Tip failed:', error);
      let errorMsg = error.code === 'ACTION_REJECTED' ? 'Transaction rejected' : (error.message || 'Transaction failed');
      alert(`❌ Failed: ${errorMsg}`);
    } finally {
      setTipping(false);
      setTipStep(null);
    }
  };

  if (loading) {
    return (
      <div className="premium-card h-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-[#FED10A]" />
          Browse Creators
        </h2>
        <div className="text-center py-12">
          <div className="gold-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading creators...</p>
        </div>
      </div>
    );
  }

  if (selectedCreator) {
    return (
      <div className="premium-card h-full">
        <button
          onClick={() => {
            setSelectedCreator(null);
            window.history.replaceState({}, '', window.location.pathname);
            if (onClearPreSelected) onClearPreSelected();
            setHasAutoSelected(false);
          }}
          className="mb-6 flex items-center gap-2 text-[#FED10A] hover:text-[#FFC700] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to creators</span>
        </button>

        <div className="space-y-6">
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FED10A]/10 to-transparent border border-[#FED10A]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FED10A]/5 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <CreatorAvatar 
                src={selectedCreator.imageUrl}
                name={selectedCreator.name}
                className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover ring-2 ring-[#FED10A]/30"
              />
              <h2 className="text-3xl font-bold mb-2 gold-gradient-text">{selectedCreator.name}</h2>
              <p className="text-gray-400 mb-4">{selectedCreator.bio}</p>
              <div className="flex justify-center gap-3 mb-4">
                <span className="gold-badge">{selectedCreator.category}</span>
                <span className="blue-badge">
                  <Users className="w-3 h-3" />
                  {selectedCreator.supporterCount} supporters
                </span>
              </div>

              <button
                onClick={() => copyCreatorLink(selectedCreator.address)}
                className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#FED10A]/40 text-sm text-white hover:text-[#FED10A] transition-all flex items-center gap-2 mx-auto"
              >
                {linkCopied ? (<><Check className="w-4 h-4" />Link Copied!</>) : (<><Share2 className="w-4 h-4" />Copy Creator Link</>)}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tip Amount (MYST)</label>
              <input
                type="number"
                step="0.01"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="1.00"
                className="premium-input"
                disabled={tipping}
              />
              <p className="text-xs text-gray-500 mt-2">Enter amount in MYST (e.g., 1.00 = 1 MYST)</p>
            </div>

            <button
              onClick={handleSendTip}
              disabled={!tipAmount || Number(tipAmount) <= 0 || tipping || isEncrypting}
              className={`w-full gold-button flex items-center justify-center gap-2 ${tipping || isEncrypting ? 'opacity-80 cursor-not-allowed' : 'disabled:opacity-40'}`}
            >
              {tipping || isEncrypting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-white font-medium ml-2">
                    {tipStep === 'encrypting' && 'Encrypting (1/3)...'}
                    {tipStep === 'transferring' && 'Transferring (2/3)...'}
                    {tipStep === 'recording' && 'Recording (3/3)...'}
                    {!tipStep && 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="text-white font-medium">Send {tipAmount || '0'} MYST</span>
                </>
              )}
            </button>

            {tipping && (
              <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FED10A] to-[#FFC700] transition-all duration-500"
                  style={{width: tipStep === 'encrypting' ? '33%' : tipStep === 'transferring' ? '66%' : '100%'}}
                />
              </div>
            )}

            <div className="alert-info flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-2">🔐 How it works:</p>
                <ol className="list-decimal ml-4 space-y-1 opacity-80">
                  <li>Encrypt tip amount</li>
                  <li>Transfer tokens</li>
                  <li>Record & update count</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center">
          <Users className="w-6 h-6 text-[#FED10A]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Browse Creators</h2>
          <p className="text-xs text-gray-500">
            {filteredCreators.length > 0 && searchQuery 
              ? `Found ${filteredCreators.length} creator${filteredCreators.length !== 1 ? 's' : ''}`
              : 'Support your favorite creators'}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, bio, category, or address..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FED10A]/40 transition-colors"
          />
        </div>
      </div>

      {creators.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FED10A]/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-[#FED10A]/50" />
          </div>
          <p className="text-gray-400 mb-2">No other creators found</p>
          <p className="text-sm text-gray-500">Register as a creator or invite others!</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FED10A]/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-[#FED10A]/50" />
          </div>
          <p className="text-gray-400 mb-2">No creators match your search</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredCreators.map((creator, index) => (
            <div
              key={creator.address}
              className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#FED10A]/40 transition-all cursor-pointer hover:translate-x-1"
              onClick={() => setSelectedCreator(creator)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FED10A]/0 via-[#FED10A]/5 to-[#FED10A]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              
              <div className="relative flex items-center gap-4">
                <CreatorAvatar 
                  src={creator.imageUrl}
                  name={creator.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-[#FED10A]/30 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white group-hover:text-[#FED10A] transition-colors truncate">{creator.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-1 mb-2">{creator.bio}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#FED10A]/10 text-[#FED10A] border border-[#FED10A]/20">{creator.category}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#6BA292]/10 text-[#6BA292] border border-[#6BA292]/20 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {creator.supporterCount}
                    </span>
                  </div>
                </div>
                <Lock className="w-5 h-5 text-[#FED10A]/50 group-hover:text-[#FED10A] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}