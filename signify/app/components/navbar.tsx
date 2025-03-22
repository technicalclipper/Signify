import Link from "next/link";
import styles from "./navbar.module.css";

export default function Navbar() {
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
        <Link href="/trending">Discover 🔥</Link>
        <Link href="/upload">Upload 📤</Link>
        <Link href="/pay">Pay 💲</Link>
      </div>

      <div className={styles.separator}></div>

      {/* Connect Wallet Button */}
      <div className={styles.walletButtonContainer}>
        <Link href="/connect">
          <button className={styles.walletButton}>Wallet 🔗</button>
        </Link>
      </div>
    </nav>
  );
}
