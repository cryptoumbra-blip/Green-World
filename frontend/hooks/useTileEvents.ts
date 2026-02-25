"use client";

import { useEffect } from "react";
import { useWatchContractEvent } from "wagmi";
import { greenWorldAbi } from "@/lib/contract";
import { GREEN_WORLD_ADDRESS, BASE_CHAIN_ID } from "@/lib/config";

export function useTileEvents(onTileGreenified: (x: number, y: number) => void) {
  useWatchContractEvent({
    address: GREEN_WORLD_ADDRESS || undefined,
    abi: greenWorldAbi,
    eventName: "TileGreenified",
    chainId: BASE_CHAIN_ID,
    onLogs(logs) {
      for (const log of logs) {
        const x = Number(log.args.x);
        const y = Number(log.args.y);
        if (!Number.isNaN(x) && !Number.isNaN(y)) onTileGreenified(x, y);
      }
    },
  });
}
