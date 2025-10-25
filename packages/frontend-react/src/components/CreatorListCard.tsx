import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEncrypt } from 'fhevm-sdk/react';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';
import { Users, ArrowLeft, Send, Info, Lock } from 'lucide-react';

const TIP_MYST_ABI = [
  "function getAllCreators() external view returns (address[])",
  "function getCreator(address creator) external view returns (tuple(string name, string bio, string category, string imageUrl, address wallet, uint256 supporterCount, bool exists))",
  "function sendTip(address creator, uint64 amount) external"
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

export default function CreatorListCard() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [tipping, setTipping] = useState(false);

  const { address } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt();

  useEffect(() => {
    loadCreators();
  }, []);

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

  const handleSendTip = async () => {
    if (!selectedCreator || !tipAmount || !address) return;

    try {
      setTipping(true);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const rawAmount = BigInt(Number(tipAmount) * 1_000_000);

      console.log('💸 Tipping:', tipAmount, 'MYST =', rawAmount.toString(), 'raw units');

      console.log('🔐 Encrypting amount for transfer...');
      const encrypted = await encrypt(
        CONTRACTS.MYST_TOKEN,
        address,
        (input) => input.add64(rawAmount)
      );

      console.log('✅ Encrypted:', encrypted.handles[0].toString().substring(0, 20) + '...');

      console.log('📤 Transferring encrypted tokens to TipMyst...');
      const tokenContract = new ethers.Contract(CONTRACTS.MYST_TOKEN, MYST_TOKEN_ABI, signer);
      const transferTx = await tokenContract.transfer(
        CONTRACTS.TIP_JAR,
        encrypted.handles[0],
        encrypted.proof
      );
      
      console.log('⏳ Waiting for transfer...');
      await transferTx.wait();
      console.log('✅ Tokens transferred!');

      console.log('📝 Recording tip with plaintext amount...');
      const tipContract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, signer);
      const tipTx = await tipContract.sendTip(
        selectedCreator.address,
        rawAmount
      );
      
      console.log('⏳ Waiting for tip record...');
      await tipTx.wait();
      console.log('✅ Tip recorded!');

      alert(`🎉 Successfully tipped ${selectedCreator.name} ${tipAmount} MYST!`);
      setSelectedCreator(null);
      setTipAmount('');
      loadCreators();
    } catch (error: any) {
      console.error('❌ Tip failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setTipping(false);
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
          onClick={() => setSelectedCreator(null)}
          className="mb-6 flex items-center gap-2 text-[#FED10A] hover:text-[#FFC700] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to creators</span>
        </button>

        <div className="space-y-6">
          {/* Creator Profile */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FED10A]/10 to-transparent border border-[#FED10A]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FED10A]/5 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <img
                src={selectedCreator.imageUrl}
                alt={selectedCreator.name}
                className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover ring-2 ring-[#FED10A]/30"
              />
              <h2 className="text-3xl font-bold mb-2 gold-gradient-text">
                {selectedCreator.name}
              </h2>
              <p className="text-gray-400 mb-4">{selectedCreator.bio}</p>
              <div className="flex justify-center gap-3">
                <span className="gold-badge">
                  {selectedCreator.category}
                </span>
                <span className="blue-badge">
                  <Users className="w-3 h-3" />
                  {selectedCreator.supporterCount} supporters
                </span>
              </div>
            </div>
          </div>

          {/* Tip Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tip Amount (MYST)
              </label>
              <input
                type="number"
                step="0.01"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="1.00"
                className="premium-input"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter amount in MYST (e.g., 1.00 = 1 MYST)
              </p>
            </div>

            <button
              onClick={handleSendTip}
              disabled={!tipAmount || Number(tipAmount) <= 0 || tipping || isEncrypting}
              className="w-full gold-button flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {tipping || isEncrypting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Sending Tip...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send {tipAmount || '0'} MYST
                </>
              )}
            </button>

            <div className="alert-info flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-2">🔐 How it works:</p>
                <ol className="list-decimal ml-4 space-y-1 opacity-80">
                  <p>Transfer encrypted tokens to TipMyst</p>
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
          <p className="text-xs text-gray-500">Support your favorite creators</p>
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
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {creators.map((creator, index) => (
            <div
              key={creator.address}
              className="group relative p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#FED10A]/40 transition-all duration-300 cursor-pointer hover:translate-x-1"
              onClick={() => setSelectedCreator(creator)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FED10A]/0 via-[#FED10A]/5 to-[#FED10A]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              
              <div className="relative flex items-center gap-4">
                <img
                  src={creator.imageUrl}
                  alt={creator.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-[#FED10A]/30 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white group-hover:text-[#FED10A] transition-colors truncate">
                    {creator.name}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                    {creator.bio}
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#FED10A]/10 text-[#FED10A] border border-[#FED10A]/20">
                      {creator.category}
                    </span>
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