# Universal FHEVM SDK

<div align="center">

![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![FHEVM](https://img.shields.io/badge/FHEVM-Powered-purple.svg)

**A framework-agnostic SDK for building confidential dApps with Zama's FHEVM**

[Live Demo](https://your-demo.vercel.app) • [Documentation](#documentation) • [Examples](#examples) • [Video Walkthrough](#video-walkthrough)

Built for the [Zama Bounty Program](https://www.zama.ai/bounty-program)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
  - [React](#react-usage)
  - [Node.js](#nodejs-usage)
- [API Reference](#api-reference)
- [TipMyst Showcase](#tipmyst-showcase)
- [Deployment](#deployment)
- [Examples](#examples)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **Universal FHEVM SDK** is a comprehensive, framework-agnostic toolkit that makes building confidential dApps simple and intuitive. It wraps all required FHEVM packages (fhevmjs, ethers, etc.) into a single, easy-to-use SDK with a wagmi-like API structure.

### What Makes It Universal?

- **🔓 Framework Agnostic**: Core SDK works everywhere (React, Vue, Node.js, vanilla JS)
- **⚛️ Wagmi-like API**: Familiar hooks pattern for React developers
- **🔐 Complete FHE Flows**: userDecrypt (EIP-712) + publicDecrypt + encryption
- **🎨 Reusable Components**: Pre-built components for common scenarios
- **📦 Single Package**: All dependencies wrapped in one SDK
- **🚀 Easy Setup**: < 10 lines of code to get started
- **💪 TypeScript First**: Full type safety out of the box

---

## ✨ Features

### Core SDK (Framework-Agnostic)

```typescript
✅ FHEVMClient - Main client that works in any JavaScript environment
✅ EncryptionService - Encrypt uint8-256, address, bool
✅ DecryptionService - userDecrypt with EIP-712 + publicDecrypt
✅ ContractService - Simple contract interactions
✅ Full TypeScript support
```

### React Adapter

```typescript
✅ FHEVMProvider - Context provider for React apps
✅ useFHEVM() - Access client instance
✅ useEncrypt() - Encryption hook with loading states
✅ useDecrypt() - Decryption hook (user + public)
✅ useContract() - Contract interaction hook
```

### Reusable Components

```typescript
✅ <EncryptedInput /> - Input with automatic encryption
✅ <DecryptButton /> - Button handling decryption flow
✅ <EncryptedBalance /> - Complete balance display
```

### TipMyst Showcase

```typescript
✅ TipMyst.sol - Confidential tipping smart contract
✅ MYSTToken.sol - Encrypted ERC20-like token
✅ Complete Next.js frontend demonstrating all SDK features
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask or compatible wallet
- Sepolia ETH ([get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository (forked from zama-ai/fhevm-react-template)
git clone https://github.com/YOUR_USERNAME/tipmyst.git
cd tipmyst

# Install all dependencies
pnpm install

# Build the SDK
cd packages/fhevm-sdk
pnpm build
```

### Run Locally (with Hardhat)

```bash
# Terminal 1: Start local blockchain
cd packages/hardhat
pnpm chain

# Terminal 2: Deploy contracts
pnpm deploy:localhost

# Terminal 3: Start frontend
cd packages/nextjs
pnpm dev
```

### Deploy to Sepolia

```bash
# Configure environment
cd packages/hardhat
cp .env.example .env
# Edit .env with your SEPOLIA_RPC_URL and PRIVATE_KEY

# Deploy contracts
pnpm deploy:sepolia

# Update frontend .env.local with deployed contract addresses
cd ../nextjs
cp .env.example .env.local
# Edit .env.local

# Start frontend
pnpm dev
```

---

## 🏗️ Architecture

### Project Structure

```
tipmyst/
├── packages/
│   ├── fhevm-sdk/                 # 🎯 Main SDK Package
│   │   ├── src/
│   │   │   ├── core/              # Framework-agnostic core
│   │   │   │   ├── FHEVMClient.ts
│   │   │   │   ├── EncryptionService.ts
│   │   │   │   ├── DecryptionService.ts
│   │   │   │   └── ContractService.ts
│   │   │   ├── adapters/
│   │   │   │   └── react/         # React hooks & provider
│   │   │   │       ├── FHEVMProvider.tsx
│   │   │   │       └── hooks/
│   │   │   │           ├── useFHEVM.ts
│   │   │   │           ├── useEncrypt.ts
│   │   │   │           ├── useDecrypt.ts
│   │   │   │           └── useContract.ts
│   │   │   ├── components/        # Reusable UI components
│   │   │   │   ├── EncryptedInput.tsx
│   │   │   │   ├── DecryptButton.tsx
│   │   │   │   └── EncryptedBalance.tsx
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── hardhat/                   # Smart Contracts (Hardhat)
│   │   ├── contracts/
│   │   │   ├── TipMyst.sol       # Showcase dApp contract
│   │   │   └── MYSTToken.sol     # Encrypted token
│   │   ├── deploy/
│   │   │   ├── 01_deploy_myst_token.ts
│   │   │   └── 02_deploy_tipmyst.ts
│   │   ├── test/
│   │   ├── hardhat.config.ts
│   │   └── package.json
│   │
│   └── nextjs/                    # Example Frontend
│       ├── app/
│       ├── components/
│       └── config/
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### SDK Architecture

```
┌─────────────────────────────────────────┐
│         Your dApp (Frontend)            │
├─────────────────────────────────────────┤
│                                         │
│  React Hooks (Optional)                 │
│  ├── useFHEVM()                         │
│  ├── useEncrypt()                       │
│  ├── useDecrypt()                       │
│  └── useContract()                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Core SDK (Framework-Agnostic)          │
│  ├── FHEVMClient                        │
│  ├── EncryptionService                  │
│  ├── DecryptionService                  │
│  └── ContractService                    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Dependencies                           │
│  ├── fhevmjs (WASM)                     │
│  ├── ethers.js                          │
│  └── Your wallet provider               │
│                                         │
└─────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  Sepolia Network (Smart Contracts)      │
├─────────────────────────────────────────┤
│  ├── TipMyst.sol                        │
│  └── MYSTToken.sol                      │
└─────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  Zama Infrastructure                    │
├─────────────────────────────────────────┤
│  ├── Gateway (API)                      │
│  ├── Coprocessor (FHE Computation)      │
│  └── KMS (Key Management Service)       │
└─────────────────────────────────────────┘
```

---

## 📦 Installation

### Install from npm (Coming Soon)

```bash
npm install @fhevm-sdk/core
# or
pnpm add @fhevm-sdk/core
# or
yarn add @fhevm-sdk/core
```

```bash
# Install from Source

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/tipmyst.git
cd tipmyst
pnpm install

# Build SDK
cd packages/fhevm-sdk
pnpm build

# Use locally in your project
cd your-project
pnpm add ../path/to/tipmyst/packages/fhevm-sdk
```

---

## 💻 Usage

### React Usage

#### 1. Setup Provider

```tsx
// app/layout.tsx
import { FHEVMProvider } from '@fhevm-sdk/core/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FHEVMProvider config={{ chainId: 11155111 }}>
          {children}
        </FHEVMProvider>
      </body>
    </html>
  );
}
```

#### 2. Use Encryption

```tsx
// components/SendTip.tsx
import { useEncrypt } from '@fhevm-sdk/core/react';

function SendTip() {
  const { encrypt, isEncrypting } = useEncrypt();
  
  const handleSend = async (amount: string) => {
    // Encrypt the amount
    const encrypted = await encrypt.uint64(BigInt(amount));
    
    // Use encrypted.data and encrypted.handles with your contract
    await contract.sendTip(creatorAddress, encrypted.data, encrypted.handles);
  };
  
  return (
    <button onClick={() => handleSend('1000')} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Send Tip'}
    </button>
  );
}
```

#### 3. Use Decryption

```tsx
// components/ViewBalance.tsx
import { useDecrypt } from '@fhevm-sdk/core/react';
import { useSigner, useAccount } from 'wagmi';

function ViewBalance() {
  const { userDecrypt, isDecrypting } = useDecrypt();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  
  const handleDecrypt = async (encryptedBalance: bigint) => {
    // Decrypt with EIP-712 signature
    const balance = await userDecrypt(
      encryptedBalance,
      CONTRACT_ADDRESS,
      address!,
      signer!
    );
    
    console.log('Balance:', balance.toString());
  };
  
  return (
    <button onClick={handleDecrypt} disabled={isDecrypting}>
      {isDecrypting ? 'Decrypting...' : 'View Balance'}
    </button>
  );
}
```

#### 4. Use Reusable Components

```tsx
// Using pre-built components
import { 
  EncryptedInput, 
  DecryptButton, 
  EncryptedBalance 
} from '@fhevm-sdk/core/components';

function TipApp() {
  return (
    <div>
      {/* Input with automatic encryption */}
      <EncryptedInput
        type="uint64"
        placeholder="Enter amount"
        onEncrypt={(encrypted) => handleSendTip(encrypted)}
      />
      
      {/* Button with EIP-712 decryption flow */}
      <DecryptButton
        encryptedValue={encryptedBalance}
        contractAddress={CONTRACT_ADDRESS}
        userAddress={address}
        signer={signer}
        onDecrypted={(value) => setBalance(value.toString())}
      >
        View My Balance
      </DecryptButton>
      
      {/* Complete balance display with auto-refresh */}
      <EncryptedBalance
        contractAddress={CONTRACT_ADDRESS}
        abi={TipMystABI}
        functionName="getMyPendingTips"
        userAddress={address}
        signer={signer}
        provider={provider}
        refreshInterval={10000}
      />
    </div>
  );
}
```

### Node.js Usage

```typescript
// server.ts
import { FHEVMClient } from '@fhevm-sdk/core';
import { ethers } from 'ethers';

async function main() {
  // Initialize client
  const client = await FHEVMClient.create({
    chainId: 11155111,
    networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    gatewayUrl: 'https://gateway.sepolia.zama.ai',
  });

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

  // Encrypt a value
  const encrypted = await client.encryption.uint64(BigInt(1000));
  console.log('Encrypted:', encrypted);

  // Call contract
  const tx = await client.contract.call(
    CONTRACT_ADDRESS,
    ABI,
    'sendTip',
    [creatorAddress, encrypted.data, encrypted.handles],
    signer
  );
  
  await tx.wait();
  console.log('Transaction confirmed:', tx.hash);

  // Decrypt a value (with signature)
  const encryptedBalance = await client.contract.read(
    CONTRACT_ADDRESS,
    ABI,
    'getMyPendingTips',
    [],
    provider
  );

  const balance = await client.decryption.userDecrypt(
    encryptedBalance,
    CONTRACT_ADDRESS,
    await signer.getAddress(),
    signer
  );
  
  console.log('Balance:', balance.toString());
}

main().catch(console.error);
```

---

## 📚 API Reference

### Core Client

#### `FHEVMClient.create(config)`

Creates and initializes a new FHEVM client instance.

```typescript
const client = await FHEVMClient.create({
  chainId: 11155111,              // Network chain ID
  networkUrl: 'https://...',      // Optional: RPC URL
  gatewayUrl: 'https://...',      // Optional: Gateway URL
  coprocessorUrl: 'https://...',  // Optional: Coprocessor URL
});
```

**Default configurations:**
- Sepolia (11155111): Zama gateway pre-configured
- Localhost (31337): Local gateway
- Zama Devnet (8009): Devnet gateway

---

### EncryptionService

Encrypt values for use in FHE contracts.

```typescript
// Encrypt different types
await client.encryption.uint8(255);
await client.encryption.uint16(65535);
await client.encryption.uint32(1000000);
await client.encryption.uint64(1000000n);
await client.encryption.uint128(BigInt('1000000000'));
await client.encryption.uint256(BigInt('1000000000'));
await client.encryption.address('0x...');
await client.encryption.bool(true);

// All methods return: { data: Uint8Array, handles: string }
```

---

### DecryptionService

Decrypt encrypted values using two methods:

#### `userDecrypt()` - Private Data (EIP-712)

For private user data. Requires user signature to prove ownership.

```typescript
const decrypted = await client.decryption.userDecrypt(
  encryptedValue,    // bigint
  contractAddress,   // string
  userAddress,       // string
  signer            // ethers.Signer
);
```

**Flow:**
1. Generates temporary keypair
2. Creates EIP-712 typed data
3. User signs with wallet (MetaMask popup)
4. Reencrypts value with user's public key
5. Decrypts with private key

#### `publicDecrypt()` - Public Data

For publicly accessible encrypted data (e.g., total supply).

```typescript
const decrypted = await client.decryption.publicDecrypt(
  encryptedValue,    // bigint
  contractAddress    // string
);
```

---

### ContractService

Interact with smart contracts.

#### `call()` - Write Operations

```typescript
const tx = await client.contract.call(
  contractAddress,   // string
  abi,              // any[]
  functionName,     // string
  args,            // any[]
  signer           // ethers.Signer
);

await tx.wait(); // Wait for confirmation
```

#### `read()` - View Functions

```typescript
const value = await client.contract.read(
  contractAddress,   // string
  abi,              // any[]
  functionName,     // string
  args,            // any[]
  provider         // ethers.Provider
);
```

---

### React Hooks

#### `useFHEVM()`

Access the FHEVM client and utilities.

```typescript
const { 
  client,           // FHEVMClient instance
  isInitialized,    // boolean
  isLoading,        // boolean
  error,           // Error | null
  generateKeypair, // () => Keypair
  createEIP712     // (publicKey, contract) => EIP712Params
} = useFHEVM();
```

#### `useEncrypt()`

Encrypt values with loading states.

```typescript
const { 
  encrypt: {
    uint8, uint16, uint32, uint64, 
    uint128, uint256, address, bool
  },
  isEncrypting,    // boolean
  error           // Error | null
} = useEncrypt();
```

#### `useDecrypt()`

Decrypt values with loading states.

```typescript
const { 
  userDecrypt,     // (encrypted, contract, user, signer) => Promise<bigint>
  publicDecrypt,   // (encrypted, contract) => Promise<bigint>
  isDecrypting,    // boolean
  error           // Error | null
} = useDecrypt();
```

#### `useContract()`

Contract interactions with loading states.

```typescript
const { 
  call,           // (contract, abi, fn, args, signer) => Promise<tx>
  read,           // (contract, abi, fn, args, provider) => Promise<value>
  isLoading,      // boolean
  error          // Error | null
} = useContract();
```

---

## 🎮 TipMyst Showcase

TipMyst is a confidential tipping platform that demonstrates all SDK features in action.

### Features

- **💸 Send Encrypted Tips**: Tip amounts are fully encrypted
- **🔐 Private Balances**: Only creators can decrypt their tips
- **📊 Tip History**: Track your tipping activity
- **👤 Creator Profiles**: Browse and support creators
- **🔓 EIP-712 Decryption**: Secure user authentication

### Smart Contracts

#### TipMyst.sol

Main contract for confidential tipping.

```solidity
// Send encrypted tip
function sendTip(
    address creator,
    einput encryptedAmount,
    bytes calldata inputProof
) external;

// View encrypted tips (only creator)
function getMyPendingTips() external view returns (euint64);

// Request withdrawal (gateway callback)
function requestWithdrawal() external returns (uint256);
```

**Key Features:**
- Encrypted tip amounts using `euint64`
- ACL permissions for data access
- Gateway integration for decryption
- Event emissions for indexing

#### MYSTToken.sol

Encrypted ERC20-like token for tipping.

```solidity
// Transfer encrypted amount
function transfer(
    address to,
    einput encryptedAmount,
    bytes calldata inputProof
) external returns (bool);

// View encrypted balance
function balanceOf(address account) external view returns (euint64);
```

### Deployed Contracts

**Sepolia Testnet:**
- TipMyst: `0x...` ([Etherscan](https://sepolia.etherscan.io/address/0x...))
- MYSTToken: `0x...` ([Etherscan](https://sepolia.etherscan.io/address/0x...))

---

## 🚀 Deployment

### Deploy to Sepolia

#### 1. Setup Environment

```bash
cd packages/hardhat
cp .env.example .env
```

Edit `.env`:
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### 2. Get Sepolia ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) and get at least 0.5 ETH.

#### 3. Deploy Contracts

```bash
cd packages/hardhat
npx hardhat run deploy/02_deploy_tipmyst.ts --network sepolia
```

**Output:**
```
✅ MYSTToken deployed to: 0x1234...
✅ TipMyst deployed to: 0x5678...
```

#### 4. Verify Contracts

```bash
npx hardhat verify --network sepolia <MYST_TOKEN_ADDRESS> 1000000
npx hardhat verify --network sepolia <TIP_MYST_ADDRESS>
```

#### 5. Update Frontend Config

Edit `packages/nextjs/.env.local`:
```bash
NEXT_PUBLIC_TIP_MYST_ADDRESS=0x5678...
NEXT_PUBLIC_MYST_TOKEN_ADDRESS=0x1234...
```

#### 6. Deploy Frontend

```bash
cd packages/nextjs

# Build
pnpm build

# Deploy to Vercel
vercel --prod

# Or deploy to any static hosting
```

---

## 📖 Examples

### Example 1: Basic Encryption/Decryption

```typescript
import { FHEVMClient } from '@fhevm-sdk/core';

// Initialize
const client = await FHEVMClient.create({ chainId: 11155111 });

// Encrypt
const encrypted = await client.encryption.uint64(1000n);

// Use in contract
await contract.someFunction(encrypted.data, encrypted.handles);

// Decrypt (with signature)
const decrypted = await client.decryption.userDecrypt(
  encryptedValue,
  contractAddress,
  userAddress,
  signer
);
```

### Example 2: React Component

```tsx
import { useEncrypt, useDecrypt } from '@fhevm-sdk/core/react';

function ConfidentialTransfer() {
  const { encrypt } = useEncrypt();
  const { userDecrypt } = useDecrypt();
  const [balance, setBalance] = useState<string | null>(null);

  const handleTransfer = async (amount: string) => {
    const encrypted = await encrypt.uint64(BigInt(amount));
    await contract.transfer(recipient, encrypted.data, encrypted.handles);
  };

  const handleViewBalance = async () => {
    const encrypted = await contract.balanceOf(address);
    const decrypted = await userDecrypt(encrypted, CONTRACT, address, signer);
    setBalance(decrypted.toString());
  };

  return (
    <div>
      <button onClick={() => handleTransfer('100')}>Transfer</button>
      <button onClick={handleViewBalance}>View Balance</button>
      {balance && <p>Balance: {balance}</p>}
    </div>
  );
}
```

### Example 3: Node.js Script

```typescript
import { FHEVMClient } from '@fhevm-sdk/core';
import { ethers } from 'ethers';

async function automatedTipping() {
  const client = await FHEVMClient.create({
    chainId: 11155111,
    networkUrl: process.env.RPC_URL,
  });

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Tip multiple creators
  const creators = ['0xabc...', '0xdef...', '0x123...'];
  
  for (const creator of creators) {
    const encrypted = await client.encryption.uint64(100n);
    const tx = await client.contract.call(
      TIP_MYST_ADDRESS,
      ABI,
      'sendTip',
      [creator, encrypted.data, encrypted.handles],
      signer
    );
    await tx.wait();
    console.log(`Tipped ${creator}: ${tx.hash}`);
  }
}
```

---

## 📹 Video Walkthrough

### Watch the Demo

[![TipMyst Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtube.com/watch?v=YOUR_VIDEO_ID)

**Timestamps:**
- 0:00 - Introduction & SDK Overview
- 2:00 - Architecture Explanation
- 4:00 - Code Walkthrough
- 7:00 - Live Demo on Sepolia
- 10:00 - Encryption Flow
- 12:00 - Decryption with EIP-712
- 15:00 - Conclusion

---

## 🧪 Testing

### Run Tests

```bash
# Test SDK
cd packages/fhevm-sdk
pnpm test

# Test contracts
cd packages/hardhat
pnpm test

# Test frontend
cd packages/nextjs
pnpm test
```

### Manual Testing Checklist

- [ ] SDK builds successfully
- [ ] Contracts compile without errors
- [ ] Contracts deploy to Sepolia
- [ ] Frontend connects to wallet
- [ ] Encryption works correctly
- [ ] Decryption requires signature
- [ ] Transactions confirm on-chain
- [ ] Balance updates correctly
- [ ] UI is responsive
- [ ] Error handling works

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues

- Use GitHub Issues
- Provide detailed reproduction steps
- Include error messages and screenshots

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

```
Copyright (c) 2024, Zama
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of Zama nor the names of its contributors may be used
  to endorse or promote products derived from this software without specific
  prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY
THIS LICENSE.
```

See [LICENSE](./LICENSE) for full details.

---

## 🔗 Links

- **Live Demo**: [https://tipmyst.vercel.app](https://your-demo.vercel.app)
- **GitHub**: [https://github.com/YOUR_USERNAME/tipmyst](https://github.com/YOUR_USERNAME/tipmyst)
- **Zama Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama Website**: [https://www.zama.ai](https://www.zama.ai)
- **Bounty Program**: [https://www.zama.ai/bounty-program](https://www.zama.ai/bounty-program)

---

## 🙏 Acknowledgments

- **Zama Team** - For the amazing FHEVM technology and bounty program
- **Ethereum Foundation** - For the blockchain infrastructure
- **fhevmjs Contributors** - For the JavaScript library
- **Community** - For feedback and support

---

## 📞 Support

- **Discord**: [Zama Community](https://discord.com/invite/zama)
- **GitHub Issues**: [Report a bug](https://github.com/YOUR_USERNAME/tipmyst/issues)
- **Email**: hello@zama.ai
- **Twitter**: [@zama_fhe](https://twitter.com/zama_fhe)

---

<div align="center">

**Built with ❤️ for the Zama Bounty Program**

⭐ Star this repo if you find it helpful!

[Documentation](https://docs.zama.ai/fhevm) • [Examples](#examples) • [Contributing](#contributing)

</div>