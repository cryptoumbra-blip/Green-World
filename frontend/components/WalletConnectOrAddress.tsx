"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useMiniapp } from "@/contexts/MiniappContext";

const BASESCAN_URL = "https://basescan.org/address";

function formatAddress(addr: string) {
  if (!addr || addr.length < 10) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletConnectOrAddress() {
  const { isMiniApp } = useMiniapp();
  const { address, isConnected } = useAccount();

  if (isMiniApp === true) {
    return (
      <div className="corner-wallet-miniapp">
        {isConnected && address ? (
          <a
            href={`${BASESCAN_URL}/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="corner-wallet-miniapp-link"
            title={address}
          >
            <span className="corner-wallet-miniapp-label">Connected</span>
            <span className="corner-wallet-miniapp-address">{formatAddress(address)}</span>
          </a>
        ) : (
          <span className="corner-wallet-miniapp-label">Connecting…</span>
        )}
      </div>
    );
  }

  return (
    <div className="corner-wallet">
      <ConnectButton />
    </div>
  );
}
