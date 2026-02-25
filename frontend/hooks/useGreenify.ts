"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { greenWorldAbi } from "@/lib/contract";
import { GREEN_WORLD_ADDRESS } from "@/lib/config";

export function useGreenify() {
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const greenify = (x: number, y: number, priceWei: bigint) => {
    if (!GREEN_WORLD_ADDRESS) {
      console.error("NEXT_PUBLIC_GREEN_WORLD_ADDRESS not set");
      return;
    }
    writeContract({
      address: GREEN_WORLD_ADDRESS,
      abi: greenWorldAbi,
      functionName: "greenify",
      args: [BigInt(x), BigInt(y)],
      value: priceWei,
    });
  };

  return {
    greenify,
    hash,
    writeError,
    isPending: isPending || isConfirming,
    isSuccess,
  };
}
