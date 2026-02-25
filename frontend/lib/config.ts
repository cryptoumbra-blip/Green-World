/**
 * Grid = canvas size in pixels. 1 click = 1 pixel at exact position.
 * Change for different map size (contract accepts any uint256 x, y).
 */
export const GRID_WIDTH = 900;
export const GRID_HEIGHT = 450;

/** Contract address on Base (set after deploy) */
export const GREEN_WORLD_ADDRESS = (process.env.NEXT_PUBLIC_GREEN_WORLD_ADDRESS || "") as `0x${string}`;

export const BASE_CHAIN_ID = 8453;
