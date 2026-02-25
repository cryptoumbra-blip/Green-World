"use client";

import { useEffect, useRef } from "react";
import { usePublicClient } from "wagmi";
import { greenWorldAbi } from "@/lib/contract";
import { GREEN_WORLD_ADDRESS } from "@/lib/config";

/** Load past TileGreenified events and call onTiles for each (x,y). Runs once on mount. */
export function usePastTileEvents(onTiles: (pairs: [number, number][]) => void) {
  const publicClient = usePublicClient();
  const onTilesRef = useRef(onTiles);
  onTilesRef.current = onTiles;
  useEffect(() => {
    if (!GREEN_WORLD_ADDRESS || !publicClient) return;
    publicClient
      .getContractEvents({
        address: GREEN_WORLD_ADDRESS,
        abi: greenWorldAbi,
        eventName: "TileGreenified",
      })
      .then((logs) => {
        const pairs: [number, number][] = logs
          .map((log) => [Number(log.args.x), Number(log.args.y)] as [number, number])
          .filter(([x, y]) => !Number.isNaN(x) && !Number.isNaN(y));
        if (pairs.length) onTilesRef.current(pairs);
      })
      .catch(() => {});
  }, [publicClient]);
}
