import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useEncrypt } from 'fhevm-sdk/react';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TIP_MYST_ABI = [
  "function sendTip(address creator, uint64 amount) external",
  "function isCreator(address creator) external view returns (bool)"
];

const MYST_TOKEN_ABI = [
  "function transfer(address to, bytes32 inputHandle, bytes calldata inputProof) external returns (bool)"
];
export default function SendTipCard() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'encrypting' | 'approving' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { address } = useAccount();
  const { encrypt, isEncrypting } = useEncrypt();

  const handleSend = async () => {
  if (!recipient || !amount || !address) return;

  try {
    setStatus('encrypting');
    setMessage('Validating recipient...');

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tipContract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, signer);
    
    const isCreator = await tipContract.isCreator(recipient);
    if (!isCreator) {
      throw new Error('Recipient is not a registered creator');
    }

    const rawAmount = BigInt(Math.floor(Number(amount) * 1_000_000));

    // Step 1: Encrypt
    setMessage('Encrypting tip amount...');
    const encrypted = await encrypt(
      CONTRACTS.MYST_TOKEN,
      address,
      (input) => input.add64(rawAmount)
    );

    // Step 2: Transfer tokens (like CreatorListCard)
    setStatus('approving');
    setMessage('Transferring tokens... (1/2)');

    const tokenContract = new ethers.Contract(CONTRACTS.MYST_TOKEN, MYST_TOKEN_ABI, signer);
    const transferTx = await tokenContract.transfer(
      CONTRACTS.TIP_JAR,
      encrypted.handles[0],
      encrypted.proof
    );
    await transferTx.wait(1);

    // Step 3: Record tip (like CreatorListCard)
    setStatus('sending');
    setMessage('Recording tip... (2/2)');

    const tipTx = await tipContract.sendTip(recipient, rawAmount);
    await tipTx.wait(1);

    setStatus('success');
    setMessage('Tip sent successfully!');
    setRecipient('');
    setAmount('');

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 3000);
  } catch (error: any) {
    console.error('Tip failed:', error);
    setStatus('error');
    setMessage(error.message || 'Failed to send tip');
    
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  }
};

  const getStatusIcon = () => {
    switch (status) {
      case 'encrypting':
      case 'approving':
      case 'sending':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Send className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-[#6BA292]';
      case 'error':
        return 'text-red-400';
      case 'encrypting':
      case 'approving':
      case 'sending':
        return 'text-[#FED10A]';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="premium-card h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center">
          <Send className="w-6 h-6 text-[#FED10A]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Send Confidential Tip</h2>
          <p className="text-xs text-gray-500">Tip any creator directly</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Creator Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Creator Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="premium-input font-mono text-sm"
            disabled={status !== 'idle'}
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter the Ethereum address of a registered creator
          </p>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (MYST)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.00"
            className="premium-input"
            disabled={status !== 'idle'}
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter amount in MYST (e.g., 1.00 = 1 MYST, 0.5 = 0.5 MYST)
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!recipient || !amount || status !== 'idle'}
          className="w-full gold-button flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {getStatusIcon()}
          {status === 'encrypting' && 'Encrypting...'}
          {status === 'approving' && 'Approving (1/2)...'}
          {status === 'sending' && 'Sending (2/2)...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Failed - Try Again'}
          {status === 'idle' && 'Send Encrypted Tip'}
        </button>

        {/* Progress Bar */}
        {['encrypting', 'approving', 'sending'].includes(status) && (
          <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FED10A] to-[#FFC700] transition-all duration-500 ease-out"
              style={{
                width: status === 'encrypting' ? '33%' : status === 'approving' ? '66%' : '100%'
              }}
            />
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`
            p-4 rounded-xl flex items-start gap-3 transition-all
            ${status === 'success' ? 'alert-success' : ''}
            ${status === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : ''}
            ${['encrypting', 'approving', 'sending'].includes(status) ? 'alert-info' : ''}
          `}>
            <span className={getStatusColor()}>{getStatusIcon()}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
              {['approving', 'sending'].includes(status) && (
                <p className="text-xs opacity-70 mt-1">Please confirm in MetaMask</p>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        {status === 'idle' && (
          <div className="alert-info flex items-start gap-3">
            <Send className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">💡 Tip: Use Creator List</p>
              <p className="opacity-80">
                Browse creators in the card to the left for easier tipping with a better UI!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}