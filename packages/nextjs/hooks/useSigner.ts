import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { providers } from 'ethers';
import type { WalletClient } from 'viem';
import type { Signer } from 'ethers';

export function walletClientToSigner(walletClient: WalletClient): Signer {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

export function useSigner() {
  const { data: walletClient } = useWalletClient();
  
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}