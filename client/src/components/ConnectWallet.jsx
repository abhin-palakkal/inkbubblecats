import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { X, Wallet, AlertCircle, LogOut } from 'lucide-react';
import './ConnectWallet.css';

function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const { address, isConnected } = useAccount();

  const { connectors, connectAsync, isPending } = useConnect();

  const { disconnect } = useDisconnect();

  const openModal = () => {
    setConnectionError('');
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isPending) return;

    setIsOpen(false);
    setConnectionError('');
  };

  // Close popup using Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = event => {
      if (event.key === 'Escape' && !isPending) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isPending]);

  // Connect wallet
  const handleConnect = async connector => {
    setConnectionError('');

    try {
      await connectAsync({ connector });
      setIsOpen(false);
    } catch (error) {
      console.error('Wallet connection error:', error);

      if (error?.name === 'UserRejectedRequestError' || error?.code === 4001) {
        setConnectionError('You rejected the wallet connection request.');
      } else if (error?.message?.toLowerCase().includes('provider not found')) {
        setConnectionError(
          'No browser wallet detected. Please install MetaMask or another compatible wallet.'
        );
      } else {
        setConnectionError(
          error?.shortMessage ||
            error?.cause?.shortMessage ||
            error?.message ||
            'Unable to connect wallet. Please try again.'
        );
      }
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  const modal = isOpen ? (
    <div
      className="wallet-modal-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isPending) {
          closeModal();
        }
      }}
    >
      <div
        className="wallet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
      >
        <button
          type="button"
          className="wallet-modal-close"
          onClick={closeModal}
          disabled={isPending}
          aria-label="Close wallet popup"
        >
          <X size={20} />
        </button>

        {isConnected ? (
          <>
            <div className="wallet-modal-icon">
              <Wallet size={25} />
            </div>

            <h2 id="wallet-modal-title">WALLET CONNECTED</h2>

            <p className="wallet-modal-description">
              Your wallet is successfully connected.
            </p>

            <div className="wallet-address">
              <span>CONNECTED ADDRESS</span>
              <strong>{address}</strong>
            </div>

            <button
              type="button"
              className="wallet-option wallet-disconnect"
              onClick={handleDisconnect}
            >
              <LogOut size={17} />
              DISCONNECT WALLET
            </button>
          </>
        ) : (
          <>
            <div className="wallet-modal-icon">
              <Wallet size={25} />
            </div>

            <h2 id="wallet-modal-title">CONNECT WALLET</h2>

            <p className="wallet-modal-description">
              Choose your preferred wallet to continue.
            </p>

            {connectionError && (
              <div className="wallet-error" role="alert">
                <AlertCircle size={18} />
                <span>{connectionError}</span>
              </div>
            )}

            <div className="wallet-options">
              {connectors.length > 0 ? (
                connectors.map(connector => (
                  <button
                    type="button"
                    className="wallet-option"
                    key={connector.uid}
                    disabled={isPending}
                    onClick={() => handleConnect(connector)}
                  >
                    <Wallet size={19} />

                    <span>
                      {isPending
                        ? 'CONNECTING...'
                        : connector.name === 'Injected'
                          ? 'BROWSER WALLET'
                          : connector.name.toUpperCase()}
                    </span>
                  </button>
                ))
              ) : (
                <div className="wallet-no-connectors">
                  No compatible wallet connector found.
                </div>
              )}
            </div>

            <p className="wallet-modal-footer">
              Make sure your wallet extension is installed and unlocked.
            </p>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="wallet-connect">
      <button
        type="button"
        className="wallet-connect-button"
        onClick={openModal}
      >
        {isConnected
          ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
          : 'CONNECT WALLET'}
      </button>

      {modal && createPortal(modal, document.body)}
    </div>
  );
}

export default ConnectWallet;
