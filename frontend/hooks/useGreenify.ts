"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Attribution } from "ox/erc8021";
import { greenWorldAbi } from "@/lib/contract";
import { GREEN_WORLD_ADDRESS } from "@/lib/config";

/** Base Builder Code – sıralamada çıkmak için (bc_c9erpd2u) */
const BUILDER_CODE_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_c9erpd2u"],
});

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
      dataSuffix: BUILDER_CODE_DATA_SUFFIX,
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
