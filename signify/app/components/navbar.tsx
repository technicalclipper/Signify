"use client";
import Link from "next/link";
import styles from "./navbar.module.css";
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const { connect, pendingConnector } = useConnect({
    connectors: [injected()],
  });

  return (
    <nav className={styles.navbar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <span className={styles.logo}>🎵 Signify</span>
      </div>

      <div className={styles.separator}></div>

      {/* Navigation Links */}
      <div className={styles.navLinks}>
        <Link href="/">Home 🛖</Link>
        <Link href="/topsongs">Discover 🔥</Link>
        <Link href="/uploadsong">Upload 📤</Link>
        <Link href="/streamingdeals">Pay 💲</Link>
        <Link href="/deallist">Proposals 📧 </Link>
      </div>

      <div className={styles.separator}></div>

      {/* Wallet Section */}
      <div className={styles.walletButtonContainer}>
        {isConnected ? (
          <div className={styles.walletInfo}>
            {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" className={styles.ensAvatar} />}
            <span className={styles.walletAddress}>
              {ensName ? `${ensName} (${address?.slice(0, 6)}...${address?.slice(-4)})` : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </span>
            <button className={styles.disconnectButton} onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <button
            className={styles.walletButton}
            onClick={() => connect({ connector: injected() })}
            disabled={pendingConnector}
          >
            {pendingConnector ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
