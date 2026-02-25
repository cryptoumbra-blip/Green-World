"use client";

import { useRef, useEffect, useCallback } from "react";
import { GRID_WIDTH, GRID_HEIGHT } from "@/lib/config";

const DESERT_FILL = "#c4a35a";
const GREEN_FILL = "#22c55e";
const GREEN_DOT_SIZE = 4;

type MapCanvasProps = {
  greenTiles: Set<string>;
  onTileClick: (x: number, y: number) => void;
  disabled?: boolean;
};

export function MapCanvas({ greenTiles, onTileClick, disabled }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = DESERT_FILL;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = GREEN_FILL;
      const r = Math.floor(GREEN_DOT_SIZE / 2);
      for (const key of Array.from(greenTiles)) {
        const [x, y] = key.split(",").map(Number);
        const x0 = Math.max(0, x - r);
        const y0 = Math.max(0, y - r);
        const sz = GREEN_DOT_SIZE;
        ctx.fillRect(x0, y0, Math.min(sz, width - x0), Math.min(sz, height - y0));
      }
    },
    [greenTiles]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = window.devicePixelRatio ?? 1;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }
    draw(ctx, w, h);
  }, [draw, greenTiles]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      const clampedX = Math.max(0, Math.min(GRID_WIDTH - 1, x));
      const clampedY = Math.max(0, Math.min(GRID_HEIGHT - 1, y));
      onTileClick(clampedX, clampedY);
    },
    [onTileClick, disabled]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      width={GRID_WIDTH}
      height={GRID_HEIGHT}
      style={{
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "8px",
        border: "1px solid #333",
      }}
      title={disabled ? "Connect wallet" : "Click to greenify"}
    />
  );
}
