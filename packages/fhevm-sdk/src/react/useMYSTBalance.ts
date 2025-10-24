// packages/fhevm-sdk/src/react/useMYSTBalance.ts

"use client";

import { useState, useCallback, useEffect } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { useFhevm } from "./useFhevm";
import { useFHEDecrypt } from "./useFHEDecrypt";

const MYST_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function claimFaucet()",
  "function canClaimFaucet(address user) view returns (bool)",
  "function timeUntilNextClaim(address user) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
];

const MYST_TOKEN_ADDRESS = "0x87dfBF3A3356b567A6290DBD365b4554770B0704";
const RPC_URL = "http://127.0.0.1:8545";

export function useMYSTBalance(address?: string) {
  const { instance } = useFhevm();
  const { decrypt } = useFHEDecrypt();
  const [balance, setBalance] = useState<string | null>(null);
  const [encryptedBalance, setEncryptedBalance] = useState<bigint | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const provider = new JsonRpcProvider(RPC_URL);

  const getBalance = useCallback(
    async (userAddress: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = new Contract(MYST_TOKEN_ADDRESS, MYST_TOKEN_ABI, provider);
        const bal = await contract.balanceOf(userAddress);
        
        setEncryptedBalance(BigInt(bal.toString()));
        return BigInt(bal.toString());
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  const decryptBalance = useCallback(
    async (userAddress: string, signer: any) => {
      try {
        if (!encryptedBalance) {
          await getBalance(userAddress);
        }

        if (!encryptedBalance || encryptedBalance === 0n) {
          setBalance("0");
          return "0";
        }

        if (!instance) throw new Error("FHEVM not initialized");

        const decrypted = await decrypt(
          MYST_TOKEN_ADDRESS,
          encryptedBalance,
          userAddress,
          signer
        );

        // Format with 18 decimals
        const formatted = formatBalance(decrypted);
        setBalance(formatted);
        return formatted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [instance, encryptedBalance, decrypt, getBalance]
  );

  const claimFaucet = useCallback(
    async (signer: any) => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = new Contract(MYST_TOKEN_ADDRESS, MYST_TOKEN_ABI, signer);
        const tx = await contract.claimFaucet();
        const receipt = await tx.wait();

        // Refresh balance after claim
        if (address) {
          await getBalance(address);
        }

        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, getBalance]
  );

  const checkCanClaim = useCallback(
    async (userAddress: string) => {
      try {
        const contract = new Contract(MYST_TOKEN_ADDRESS, MYST_TOKEN_ABI, provider);
        const canClaimNow = await contract.canClaimFaucet(userAddress);
        const timeLeft = await contract.timeUntilNextClaim(userAddress);

        setCanClaim(canClaimNow);
        setTimeUntilClaim(Number(timeLeft));

        return { canClaim: canClaimNow, timeLeft: Number(timeLeft) };
      } catch (err) {
        console.error("Failed to check faucet:", err);
        return { canClaim: false, timeLeft: 0 };
      }
    },
    [provider]
  );

  // Auto-load balance if address provided
  useEffect(() => {
    if (address) {
      getBalance(address);
      checkCanClaim(address);
    }
  }, [address, getBalance, checkCanClaim]);

  return {
    balance,
    encryptedBalance,
    canClaim,
    timeUntilClaim,
    isLoading,
    error,
    getBalance,
    decryptBalance,
    claimFaucet,
    checkCanClaim,
    refetch: address ? () => getBalance(address) : async () => {},
  };
}

// Helper function to format balance
function formatBalance(value: string, decimals: number = 18): string {
  const bigIntValue = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  const whole = bigIntValue / divisor;
  const fraction = bigIntValue % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, "0");
  // Remove trailing zeros
  const trimmed = fractionStr.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}