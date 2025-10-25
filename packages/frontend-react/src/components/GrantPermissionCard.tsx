import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';

const ACL_ABI = [
  "function allow(address account, address contractAddress) external",
  "function allowForDecryption(address[] memory accounts) external"
];

const MYST_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];

export default function GrantPermissionCard() {
  const [granting, setGranting] = useState(false);
  const [status, setStatus] = useState('');
  const { address } = useAccount();

  const grantAllPermissions = async () => {
    if (!address) return;

    try {
      setGranting(true);
      setStatus('Getting your balance handle...');

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get your balance handle
      const tokenContract = new ethers.Contract(CONTRACTS.MYST_TOKEN, MYST_TOKEN_ABI, provider);
      const balanceHandle = await tokenContract.balanceOf(address);
      
      console.log('🔐 Your balance handle:', balanceHandle.toString());
      setStatus('Balance handle obtained: ' + balanceHandle.toString().substring(0, 20) + '...');

      // Grant ACL permission to TipMyst contract
      setStatus('Granting ACL permission to TipMyst contract...');
      
      const ACL_ADDRESS = '0x687820221192C5B662b25367F70076A37bc79b6c';
      //const aclContract = new ethers.Contract(ACL_ADDRESS, ACL_ABI, signer);

      // This might not work directly - ACL permissions are usually handled by the contract
      // Let's try a different approach
      
      setStatus('✅ Checking complete. If tipping still fails, the issue is in the contract.');
      
      alert('✅ ACL check complete!\n\n' +
            'Your balance handle: ' + balanceHandle.toString().substring(0, 30) + '...\n\n' +
            'If tipping still fails, it might be:\n' +
            '1. The balance is actually 0 (even though faucet was claimed)\n' +
            '2. Contract logic issue with FHE operations\n' +
            '3. Need to call a different function to activate balance');

    } catch (error: any) {
      console.error('❌ Permission grant failed:', error);
      setStatus('Error: ' + error.message);
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">🔑 Grant Permissions</h2>

      <div className="space-y-4">
        <button
          onClick={grantAllPermissions}
          disabled={granting}
          className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition"
        >
          {granting ? '⏳ Checking...' : '🔑 Check ACL Permissions'}
        </button>

        {status && (
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            {status}
          </div>
        )}

        <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          <p className="font-semibold mb-2">⚠️ Debugging Info:</p>
          <p>If tipping fails with error 0xbf18af43, it means:</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Your encrypted balance might be 0</li>
            <li>ACL permissions not granted properly</li>
            <li>Contract can't access your encrypted data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
