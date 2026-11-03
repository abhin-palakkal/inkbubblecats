import { useCallback, useEffect, useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  Ticket,
  ArrowUpRight,
  RefreshCw,
  Trophy,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  Image as ImageIcon,
} from 'lucide-react';
import './Raffle.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

const shortAddress = address => {
  if (typeof address !== 'string' || address.length < 12) {
    return address || 'Unknown wallet';
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Keep completed raffles out of the live raffle page.
function isCompletedRaffle(raffle) {
  const status = String(raffle?.status || raffle?.state || '').toLowerCase();
  return (
    ['completed', 'complete', 'finished', 'drawn'].includes(status) ||
    Boolean(raffle?.completedAt) ||
    Boolean(raffle?.drawnAt) ||
    Boolean(raffle?.winnerSelectedAt)
  );
}

const formatDate = date =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Parse API responses safely, including unexpected server errors.
async function readResponse(response) {
  const text = await response.text();
  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Something went wrong.');
  }

  return result;
}

function mergeCompletedRaffles(primary, fallback) {
  const map = new Map();
  [
    ...(Array.isArray(primary) ? primary : []),
    ...(Array.isArray(fallback) ? fallback : []),
  ]
    .filter(isCompletedRaffle)
    .forEach(raffle => {
      const id = String(raffle?._id || raffle?.id || '');
      if (id) map.set(id, { ...(map.get(id) || {}), ...raffle });
    });
  return [...map.values()].sort((a, b) => {
    const aDate = new Date(
      a.completedAt || a.drawnAt || a.endAt || 0
    ).getTime();
    const bDate = new Date(
      b.completedAt || b.drawnAt || b.endAt || 0
    ).getTime();
    return bDate - aDate;
  });
}

const Raffle = () => {
  const [raffles, setRaffles] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [enteredRaffles, setEnteredRaffles] = useState({});
  const [raffleMessages, setRaffleMessages] = useState({});

  const [loadingRaffles, setLoadingRaffles] = useState(true);
  const [loading, setLoading] = useState(false);
  const [busyRaffleId, setBusyRaffleId] = useState('');

  const [status, setStatus] = useState(
    'Connect your wallet to participate in a raffle.'
  );
  const [error, setError] = useState('');

  // Fetch the raffle list. This callback stays stable,
  // so the initial loading effect won't repeatedly run.
  const fetchRaffles = useCallback(async () => {
    setLoadingRaffles(true);
    setError('');

    try {
      const response = await fetch(`${API}/raffles`);
      const result = await readResponse(response);
      const allRaffles = Array.isArray(result.data) ? result.data : [];

      // Completed raffles belong in Past Winners, not Explore Raffles.
      setRaffles(allRaffles.filter(raffle => !isCompletedRaffle(raffle)));
    } catch (err) {
      setError(err.message || 'Could not load raffles.');
    } finally {
      setLoadingRaffles(false);
    }
  }, []);

  // Load live and upcoming raffles when the page mounts.
  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  // Recheck entries when the wallet or loaded raffle list changes.
  // This does not fetch the raffle list, so it cannot create a fetch loop.
  useEffect(() => {
    let cancelled = false;

    const checkEntries = async () => {
      if (!walletAddress || raffles.length === 0) {
        setEnteredRaffles({});
        return;
      }

      const results = await Promise.all(
        raffles.map(async raffle => {
          try {
            const params = new URLSearchParams({
              raffleId: raffle._id,
              walletAddress,
            });

            const response = await fetch(
              `${API}/raffles/entry-status?${params.toString()}`
            );

            const result = await readResponse(response);

            return [raffle._id, Boolean(result.hasEntered)];
          } catch (err) {
            console.error(
              `Could not check entry for raffle ${raffle._id}:`,
              err
            );

            return [raffle._id, null];
          }
        })
      );

      if (!cancelled) {
        setEnteredRaffles(Object.fromEntries(results));
      }
    };

    checkEntries();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, raffles]);

  // Track MetaMask account changes.
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = accounts => {
      const address = accounts?.[0] || '';

      setWalletAddress(address);
      setVerificationToken('');
      setEnteredRaffles({});
      setRaffleMessages({}); // Clear messages belonging to the previous wallet.

      setStatus(
        address
          ? 'Wallet changed. Verify your wallet to continue.'
          : 'Wallet disconnected. Connect your wallet to participate.'
      );
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener?.(
        'accountsChanged',
        handleAccountsChanged
      );
    };
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue.');
      }

      setLoading(true);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts?.length) {
        throw new Error('No wallet account was returned.');
      }

      const address = accounts[0];

      setWalletAddress(address);
      setVerificationToken('');
      setEnteredRaffles({});
      setRaffleMessages({}); // Clear stale errors when reconnecting.
      setStatus('Wallet connected. Checking your raffle entries...');
    } catch (err) {
      setStatus(
        err.code === 4001
          ? 'Wallet connection was cancelled.'
          : err.message || 'Could not connect wallet.'
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyWallet = async () => {
    try {
      if (!window.ethereum || !walletAddress) {
        throw new Error('Connect your wallet first.');
      }

      setLoading(true);
      setVerificationToken('');
      setStatus('Requesting a verification message...');

      const nonceResponse = await fetch(`${API}/raffles/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      const nonceResult = await readResponse(nonceResponse);
      const message = nonceResult.data.message;

      setStatus('Please approve the signature request in MetaMask.');

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      setStatus('Verifying your wallet...');

      const verifyResponse = await fetch(`${API}/raffles/verify-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          message,
          signature,
        }),
      });

      const verifyResult = await readResponse(verifyResponse);

      setVerificationToken(verifyResult.data.verificationToken);
      setStatus('Wallet verified. You can enter an eligible active raffle.');
    } catch (err) {
      setStatus(
        err.code === 4001
          ? 'You rejected the signature request.'
          : err.message || 'Wallet verification failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const enterRaffle = async raffle => {
    if (busyRaffleId) return;

    try {
      if (!walletAddress) {
        const message = 'Connect your wallet first to enter this raffle.';
        setRaffleMessages(previous => ({ ...previous, [raffle._id]: message }));
        setStatus(message);
        return;
      }

      if (!verificationToken) {
        const message = 'Verify your wallet before entering this raffle.';
        setRaffleMessages(previous => ({ ...previous, [raffle._id]: message }));
        setStatus(message);
        return;
      }

      if (getRaffleStatus(raffle) !== 'active') {
        const message = 'This raffle is not currently open for entries.';
        setRaffleMessages(previous => ({ ...previous, [raffle._id]: message }));
        setStatus(message);
        return;
      }

      if (enteredRaffles[raffle._id] === true) {
        const message = `You have already entered "${raffle.title}".`;
        setRaffleMessages(previous => ({ ...previous, [raffle._id]: message }));
        setStatus(message);
        return;
      }

      setBusyRaffleId(raffle._id);
      setRaffleMessages(previous => ({ ...previous, [raffle._id]: '' }));
      setStatus(`Checking your entry for "${raffle.title}"...`);

      // Check whether this wallet has already entered.
      const params = new URLSearchParams({
        raffleId: raffle._id,
        walletAddress,
      });

      const statusResponse = await fetch(
        `${API}/raffles/entry-status?${params.toString()}`
      );
      const statusResult = await readResponse(statusResponse);

      if (statusResult.hasEntered) {
        setEnteredRaffles(previous => ({
          ...previous,
          [raffle._id]: true,
        }));
        setVerificationToken('');
        setStatus(`You have already entered "${raffle.title}".`);
        return;
      }

      // The backend checks the NFT balance and decides eligibility.
      setStatus('Checking your Ink Bubble Cats NFT balance...');

      const response = await fetch(`${API}/raffles/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verificationToken}`,
        },
        body: JSON.stringify({
          raffleId: raffle._id,
          walletAddress,
        }),
      });

      const result = await readResponse(response);

      setEnteredRaffles(previous => ({
        ...previous,
        [raffle._id]: true,
      }));
      // Update the visible count only after the backend confirms a successful entry.
      // The backend remains the source of truth and computes unique wallets.
      setRaffles(previous =>
        previous.map(item =>
          item._id === raffle._id
            ? {
                ...item,
                participantCount: Number(item.participantCount || 0) + 1,
              }
            : item
        )
      );
      setVerificationToken('');
      const successMessage =
        result.message || `Successfully entered "${raffle.title}".`;
      // The entered button already communicates success. Remove any old error.
      setRaffleMessages(previous => ({ ...previous, [raffle._id]: '' }));
      setStatus(successMessage);
    } catch (err) {
      const message = err.message || 'Could not enter this raffle.';

      if (message.toLowerCase().includes('already entered')) {
        setEnteredRaffles(previous => ({
          ...previous,
          [raffle._id]: true,
        }));
        setVerificationToken('');
      }

      // Show the backend's eligibility/error message both on the raffle card and page.
      setRaffleMessages(previous => ({ ...previous, [raffle._id]: message }));
      setStatus(message);
      // Eligibility failures are expected for wallets without an eligible NFT.
      // Keep unexpected errors visible in the console for debugging.
      if (
        !message
          .toLowerCase()
          .includes('you must hold at least 1 ink bubble cat to enter')
      ) {
        console.error('Enter raffle error:', err);
      }
    } finally {
      setBusyRaffleId('');
    }
  };

  const getRaffleStatus = raffle => {
    if (raffle.status === 'completed') return 'completed';

    const now = Date.now();

    if (now < new Date(raffle.startAt).getTime()) return 'upcoming';
    if (now >= new Date(raffle.endAt).getTime()) return 'ended';

    return 'active';
  };

  const getStatusLabel = value => {
    const labels = {
      active: 'ACTIVE',
      upcoming: 'UPCOMING',
      ended: 'ENDED',
      completed: 'COMPLETED',
    };

    return labels[value] || value?.toUpperCase() || 'UNKNOWN';
  };

  return (
    <section
      className="raffle-section section-wrap"
      id="raffle"
      aria-labelledby="raffle-section-title"
    >
      <div className="raffle-container">
        <header className="raffle-heading">
          <div className="raffle-eyebrow">
            <span className="raffle-live-dot" />
            INK BUBBLE CATS COMMUNITY
          </div>

          <div className="raffle-heading-row">
            <div>
              <h2 id="raffle-section-title">
                Community <span>Raffles.</span>
              </h2>

              <p className="raffle-description">
                Discover community events, verify your wallet, and enter the
                raffles you're eligible for.
              </p>
            </div>

            <button
              className="raffle-button raffle-button-secondary raffle-refresh"
              type="button"
              onClick={fetchRaffles}
              disabled={loadingRaffles || loading || Boolean(busyRaffleId)}
            >
              <RefreshCw
                size={16}
                className={loadingRaffles ? 'raffle-spin-icon' : ''}
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="raffle-participation">
          <div className="raffle-participation-info">
            <div className="raffle-step">
              <Wallet size={17} />
              <span>Connect your wallet</span>
            </div>

            <div className="raffle-step">
              <ShieldCheck size={17} />
              <span>Sign to verify ownership</span>
            </div>

            <div className="raffle-step">
              <Ticket size={17} />
              <span>Enter each raffle separately</span>
            </div>
          </div>

          <div className="raffle-wallet-actions">
            <button
              className="raffle-button raffle-button-primary"
              type="button"
              onClick={connectWallet}
              disabled={loading || Boolean(busyRaffleId)}
            >
              <Wallet size={16} />
              {walletAddress ? 'Reconnect wallet' : 'Connect wallet'}
            </button>

            <button
              className="raffle-button raffle-button-secondary"
              type="button"
              onClick={verifyWallet}
              disabled={
                loading ||
                !walletAddress ||
                Boolean(verificationToken) ||
                Boolean(busyRaffleId)
              }
            >
              <ShieldCheck size={16} />
              {verificationToken ? 'Wallet verified' : 'Verify wallet'}
            </button>
          </div>

          {walletAddress && (
            <div className="raffle-connected-wallet">
              <span className="raffle-wallet-indicator" />

              <div>
                <small>CONNECTED WALLET</small>
                <strong>{shortAddress(walletAddress)}</strong>
              </div>

              {verificationToken && (
                <span className="raffle-verified-chip">
                  <CheckCircle2 size={14} />
                  Verified
                </span>
              )}
            </div>
          )}
        </div>

        <div className="raffle-results-heading">
          <div>
            <h3>Explore raffles</h3>
            <p>Choose an event to see its details and entry status.</p>
          </div>

          {!loadingRaffles && (
            <span className="raffle-count">
              {raffles.length} {raffles.length === 1 ? 'raffle' : 'raffles'}
            </span>
          )}
        </div>

        {error && (
          <div className="raffle-message raffle-message-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={fetchRaffles}>
              Try again
            </button>
          </div>
        )}

        {loadingRaffles ? (
          <div className="raffle-empty-state">
            <RefreshCw size={22} className="raffle-spin-icon" />
            <p>Loading community raffles...</p>
          </div>
        ) : raffles.length === 0 ? (
          <div className="raffle-empty-state">
            <Ticket size={28} />
            <h3>No raffles yet</h3>
            <p>Check back soon for upcoming community events.</p>
          </div>
        ) : (
          <div className="raffle-list">
            {raffles.map(raffle => {
              const raffleStatus = getRaffleStatus(raffle);
              const hasEntered = enteredRaffles[raffle._id] === true;
              const entryStatusUnknown = enteredRaffles[raffle._id] === null;
              const isBusy = busyRaffleId === raffle._id;

              return (
                <article className="raffle-item" key={raffle._id}>
                  <div className="raffle-event-image">
                    {raffle.imageUrl ? (
                      <img
                        src={raffle.imageUrl}
                        alt={`${raffle.title} event`}
                        loading="lazy"
                        onError={event => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.parentElement.classList.add(
                            'raffle-event-image-fallback'
                          );
                        }}
                      />
                    ) : (
                      <div className="raffle-image-placeholder">
                        <ImageIcon size={28} />
                        <span>Event image</span>
                      </div>
                    )}
                  </div>
                  <div className="raffle-item-header">
                    <span
                      className={`raffle-status-badge raffle-status-${raffleStatus}`}
                    >
                      <span className="raffle-status-dot" />
                      {getStatusLabel(raffleStatus)}
                    </span>

                    {hasEntered && (
                      <span className="raffle-entered-label">
                        <CheckCircle2 size={14} />
                        Entered
                      </span>
                    )}
                  </div>

                  <h3>{raffle.title}</h3>

                  {raffle.description && (
                    <p className="raffle-item-description">
                      {raffle.description}
                    </p>
                  )}

                  <div className="raffle-item-prize">
                    <Trophy size={18} />

                    <div>
                      <small>PRIZE</small>
                      <strong>{raffle.prize}</strong>
                    </div>
                  </div>

                  <div className="raffle-item-details">
                    <div>
                      <CalendarDays size={16} />
                      <span>
                        <small>Starts</small>
                        {formatDate(raffle.startAt)}
                      </span>
                    </div>

                    <div>
                      <Clock3 size={16} />
                      <span>
                        <small>Ends</small>
                        {formatDate(raffle.endAt)}
                      </span>
                    </div>

                    <div className="raffle-participant-count">
                      <Users size={16} />
                      <span>
                        <small>Participants</small>
                        {Number(raffle.participantCount || 0)}
                      </span>
                    </div>

                    <div>
                      <Trophy size={16} />
                      <span>
                        <small>Winners</small>
                        {raffle.winnerCount ?? 1}{' '}
                        {(raffle.winnerCount ?? 1) === 1 ? 'winner' : 'winners'}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(raffle.requirements) &&
                    raffle.requirements.length > 0 && (
                      <div className="raffle-item-requirements">
                        <strong>Requirements</strong>

                        <ul>
                          {raffle.requirements.map((requirement, index) => (
                            <li key={`${raffle._id}-requirement-${index}`}>
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className="raffle-item-actions">
                    {hasEntered ? (
                      <button
                        className="raffle-button raffle-button-entered"
                        type="button"
                        disabled
                      >
                        <CheckCircle2 size={16} />
                        Entry submitted
                      </button>
                    ) : raffleStatus === 'active' ? (
                      <button
                        className="raffle-button raffle-button-primary"
                        type="button"
                        onClick={() => enterRaffle(raffle)}
                        disabled={
                          loading || Boolean(busyRaffleId) || entryStatusUnknown
                        }
                      >
                        {isBusy ? (
                          <>
                            <RefreshCw size={16} className="raffle-spin-icon" />
                            Submitting...
                          </>
                        ) : entryStatusUnknown ? (
                          'Checking entry...'
                        ) : (
                          <>
                            <Ticket size={16} />
                            Enter raffle
                            <ArrowUpRight size={16} />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="raffle-button raffle-button-disabled"
                        type="button"
                        disabled
                      >
                        {raffleStatus === 'upcoming'
                          ? 'Not started yet'
                          : raffleStatus === 'ended'
                            ? 'Raffle ended'
                            : 'Raffle completed'}
                      </button>
                    )}
                  </div>

                  {!hasEntered && raffleMessages[raffle._id] && (
                    <p
                      role="status"
                      aria-live="polite"
                      style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        border: `1px solid ${
                          /success|entered/i.test(raffleMessages[raffle._id])
                            ? 'rgba(70, 220, 150, 0.35)'
                            : 'rgba(255, 80, 100, 0.35)'
                        }`,
                        borderRadius: '8px',
                        background: /success|entered/i.test(
                          raffleMessages[raffle._id]
                        )
                          ? 'rgba(70, 220, 150, 0.1)'
                          : 'rgba(255, 80, 100, 0.1)',
                        color: /success|entered/i.test(
                          raffleMessages[raffle._id]
                        )
                          ? '#70e0a5'
                          : '#ff7b91',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      {raffleMessages[raffle._id]}
                    </p>
                  )}

                  {entryStatusUnknown && walletAddress && (
                    <p className="raffle-item-hint">
                      Could not confirm your entry status. Refresh the page or
                      try again before entering.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Raffle;
