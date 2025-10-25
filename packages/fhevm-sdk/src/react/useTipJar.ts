// packages/fhevm-sdk/src/react/useTipJar.ts

"use client";

import { useState, useCallback } from "react";
import { Contract } from "ethers";
import { useFhevm } from "./useFhevm";
import { useFHEEncryption } from "./useFHEEncryption";
import type { Creator, Tip } from "../types";

const TIPMYST_ABI = [
  "function registerCreator(string memory _name, string memory _bio, string memory _category, string memory _imageUrl)",
  "function sendTip(address to, bytes memory encryptedAmount, bytes calldata inputProof)",
  "function withdrawEarnings()",
  "function getCreator(address creator) view returns (tuple(string name, string bio, string category, string imageUrl, address wallet, uint256 supporterCount, bool exists))",
  "function getAllCreators() view returns (address[])",
  "function isCreator(address creator) view returns (bool)",
];

const TIPMYST_ADDRESS = "0x25E8Bb7e7a4701811b48Fdac0C65a2233A490D9b";

export function useTipJar() {
  const { instance } = useFhevm({
    provider: "http://127.0.0.1:8545",
    chainId: 31337,
  });
  const { encryptWith } = useFHEEncryption({
    instance,
    ethersSigner: undefined,
    contractAddress: TIPMYST_ADDRESS as `0x${string}`,
  });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const registerCreator = useCallback(
    async (
      name: string,
      bio: string,
      category: string,
      imageUrl: string,
      signer: any
    ) => {
      try {
        setIsPending(true);
        setError(null);

        const contract = new Contract(TIPMYST_ADDRESS, TIPMYST_ABI, signer);
        const tx = await contract.registerCreator(name, bio, category, imageUrl);
        const receipt = await tx.wait();

        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const sendTip = useCallback(
    async (to: string, amount: number | bigint, signer: any) => {
      try {
        setIsPending(true);
        setError(null);

        if (!instance) throw new Error("FHEVM not initialized");

        // Encrypt amount
        const encrypted = await encryptWith((builder) => {
          builder.add64(Number(amount));
        });

        if (!encrypted) throw new Error("Encryption failed");

        const contract = new Contract(TIPMYST_ADDRESS, TIPMYST_ABI, signer);
        const tx = await contract.sendTip(
          to,
          encrypted.handles[0],
          encrypted.inputProof
        );
        const receipt = await tx.wait();

        return receipt;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [instance, encryptWith]
  );

  const withdrawEarnings = useCallback(async (signer: any) => {
    try {
      setIsPending(true);
      setError(null);

      const contract = new Contract(TIPMYST_ADDRESS, TIPMYST_ABI, signer);
      const tx = await contract.withdrawEarnings();
      const receipt = await tx.wait();

      return receipt;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    registerCreator,
    sendTip,
    withdrawEarnings,
    isPending,
    error,
  };
}