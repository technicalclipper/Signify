"use client";
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const { connect, connectors, pendingConnector } = useConnect();

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {isConnected ? (
        <>
          {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} style={{ borderRadius: "50%", width: "50px" }} />}
          <div>{ensName ? `${ensName} (${address})` : address}</div>
          <button onClick={disconnect} style={buttonStyle}>Disconnect</button>
        </>
      ) : (
        <>
          <h2>Connect Your Wallet</h2>  
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              style={buttonStyle}
              disabled={pendingConnector?.id === connector.id}
            >
              {pendingConnector?.id === connector.id ? "Connecting..." : `Connect with ${connector.name}`}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  fontSize: "16px",
};
