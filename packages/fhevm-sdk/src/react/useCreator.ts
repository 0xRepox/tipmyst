// packages/fhevm-sdk/src/react/useCreator.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import type { Creator } from "../types";

const TIPMYST_ABI = [
  "function getCreator(address creator) view returns (tuple(string name, string bio, string category, string imageUrl, address wallet, uint256 supporterCount, bool exists))",
  "function getAllCreators() view returns (address[])",
  "function isCreator(address creator) view returns (bool)",
  "function getCreatorCount() view returns (uint256)",
];

const TIPMYST_ADDRESS = "0x25E8Bb7e7a4701811b48Fdac0C65a2233A490D9b";
const RPC_URL = "http://127.0.0.1:8545"; // Localhost

export function useCreator(address?: string) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const provider = new JsonRpcProvider(RPC_URL);

  const getCreator = useCallback(
    async (creatorAddress: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const contract = new Contract(TIPMYST_ADDRESS, TIPMYST_ABI, provider);
        const data = await contract.getCreator(creatorAddress);

        const creatorData: Creator = {
          id: creatorAddress,
          address: data.wallet,
          username: data.name,
          displayName: data.name,
          bio: data.bio,
          category: data.category as any,
          avatar: data.imageUrl,
          totalTips: 0n,
          tipCount: Number(data.supporterCount),
          createdAt: Date.now(),
        };

        setCreator(creatorData);
        return creatorData;
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

  const getAllCreators = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const contract = new Contract(TIPMYST_ADDRESS, TIPMYST_ABI, provider);
      const addresses: string[] = await contract.getAllCreators();

      // Fetch all creator details
      const creatorPromises = addresses.map(async (addr) => {
        const data = await contract.getCreator(addr);
        return {
          id: addr,
          address: data.wallet,
          username: data.name,
          displayName: data.name,
          bio: data.bio,
          category: data.category as any,
          avatar: data.imageUrl,
          totalTips: 0n,
          tipCount: Number(data.supporterCount),
          createdAt: Date.now(),
        };
      });

      const creatorsData = await Promise.all(creatorPromises);
      setCreators(creatorsData);
      return creatorsData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const isCreatorAddress = useCallback(
    async (checkAddress: string): Promise<boolean> => {
      try {
        const contract = new Contract(TIPMYST_ADDRESS, TIPMYST_ABI, provider);
        return await contract.isCreator(checkAddress);
      } catch (err) {
        console.error("Failed to check if creator:", err);
        return false;
      }
    },
    [provider]
  );

  // Auto-load creator if address provided
  useEffect(() => {
    if (address) {
      getCreator(address);
    }
  }, [address, getCreator]);

  return {
    creator,
    creators,
    isLoading,
    error,
    getCreator,
    getAllCreators,
    isCreatorAddress,
    refetch: address ? () => getCreator(address) : getAllCreators,
  };
}