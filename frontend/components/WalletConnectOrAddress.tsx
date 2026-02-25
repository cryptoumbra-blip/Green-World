"use client";

import { useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import { useMiniapp } from "@/contexts/MiniappContext";

const BASESCAN_URL = "https://basescan.org/address";

function formatAddress(addr: string) {
  if (!addr || addr.length < 10) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Miniapp açıldığında cüzdanı otomatik bağla (Farcaster dokümantasyonu) */
function useMiniappAutoConnect() {
  const { isMiniApp } = useMiniapp();
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const triedRef = useRef(false);

  useEffect(() => {
    if (isMiniApp !== true || isConnected || isConnecting || triedRef.current) return;
    const connector = connectors[0];
    if (!connector) return;
    triedRef.current = true;
    connect({ connector });
  }, [isMiniApp, isConnected, isConnecting, connectors, connect]);
}

export function WalletConnectOrAddress() {
  const { isMiniApp } = useMiniapp();
  const { address, isConnected, isConnecting } = useAccount();

  useMiniappAutoConnect();

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
          <span className="corner-wallet-miniapp-label">
            {isConnecting ? "Connecting…" : "Connect"}
          </span>
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
