export const CONTRACTS = {
  MYST_TOKEN: '0x583E103C00b692b0CDD997C19a4A37163e18442f',
  TIP_JAR: '0x5a3035B7aFB692869D2A7bD2136263a5b7Fb9e1a',
} as const;

export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  GATEWAY: {
    chainId: 55815,
    name: 'Gateway',
  },
} as const;

export const FHEVM_CONTRACTS = {
  ACL: '0x687820221192C5B662b25367F70076A37bc79b6c',
  KMS_VERIFIER: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  INPUT_VERIFIER: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
} as const;

export const GATEWAY_CONTRACTS = {
  DECRYPTION_ADDRESS: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  INPUT_VERIFICATION_ADDRESS: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
} as const;

export const RELAYER = {
  URL: 'https://relayer.testnet.zama.cloud',
} as const;

export type ContractAddress = typeof CONTRACTS[keyof typeof CONTRACTS];
export type NetworkName = keyof typeof NETWORKS;
