"use client";

import { useReadContract } from "wagmi";
import { greenWorldAbi } from "@/lib/contract";
import { GREEN_WORLD_ADDRESS } from "@/lib/config";

export function useContractPrice() {
  const { data: price, ...rest } = useReadContract({
    address: GREEN_WORLD_ADDRESS || undefined,
    abi: greenWorldAbi,
    functionName: "price",
  });
  return { price: price ?? BigInt(0), ...rest };
}
