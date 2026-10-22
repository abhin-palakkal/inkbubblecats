import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import './ConnectWallet.css';

function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="wallet-connect">
      {isConnected ? (
        <button
          className="wallet-connect-button"
          onClick={() => setIsOpen(true)}
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
      ) : (
        <button
          className="wallet-connect-button"
          onClick={() => setIsOpen(true)}
        >
          CONNECT WALLET
        </button>
      )}

      {isOpen && (
        <div className="wallet-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="wallet-modal"
            onClick={event => event.stopPropagation()}
          >
            <button
              className="wallet-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close wallet popup"
            >
              ×
            </button>

            {isConnected ? (
              <>
                <h2>WALLET CONNECTED</h2>
                <p className="wallet-address">{address}</p>
                <button
                  className="wallet-option"
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                >
                  DISCONNECT WALLET
                </button>
              </>
            ) : (
              <>
                <h2>CONNECT WALLET</h2>
                <p>Choose your preferred wallet to continue.</p>

                <div className="wallet-options">
                  {connectors.map(connector => (
                    <button
                      className="wallet-option"
                      key={connector.uid}
                      disabled={isPending}
                      onClick={() => {
                        connect(
                          { connector },
                          {
                            onSuccess: () => setIsOpen(false),
                          }
                        );
                      }}
                    >
                      {isPending
                        ? 'CONNECTING...'
                        : connector.name === 'Injected'
                          ? 'BROWSER WALLET'
                          : connector.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;
