"use client";

import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData, concat } from "viem";
import { Attribution } from "ox/erc8021";
import { greenWorldAbi } from "@/lib/contract";
import { GREEN_WORLD_ADDRESS } from "@/lib/config";

/** Base Builder Code – sıralamada çıkmak için (bc_c9erpd2u) */
const BUILDER_CODE_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_c9erpd2u"],
});

export function useGreenify() {
  const { sendTransaction, data: hash, error: writeError, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const greenify = (x: number, y: number, priceWei: bigint) => {
    if (!GREEN_WORLD_ADDRESS) {
      console.error("NEXT_PUBLIC_GREEN_WORLD_ADDRESS not set");
      return;
    }
    const calldata = encodeFunctionData({
      abi: greenWorldAbi,
      functionName: "greenify",
      args: [BigInt(x), BigInt(y)],
    });
    const dataWithSuffix = concat([calldata as `0x${string}`, BUILDER_CODE_DATA_SUFFIX]);
    sendTransaction({
      to: GREEN_WORLD_ADDRESS,
      data: dataWithSuffix,
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
