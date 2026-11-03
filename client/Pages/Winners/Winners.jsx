import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  X,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './Winners.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

const PAGE_SIZE_OPTIONS = [10, 20];

const shortAddress = address => {
  if (typeof address !== 'string' || address.length < 12) {
    return address || 'Unknown wallet';
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getWinnerAddress = winner => {
  if (typeof winner === 'string') return winner;
  if (!winner || typeof winner !== 'object') return '';

  return (
    winner.walletAddress ||
    winner.address ||
    winner.wallet ||
    winner.winnerAddress ||
    ''
  );
};

const formatDate = date => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return 'Date unavailable';
  }

  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isCompletedRaffle = raffle => {
  const status = String(raffle?.status || raffle?.state || '').toLowerCase();

  return (
    ['completed', 'complete', 'finished', 'drawn'].includes(status) ||
    Boolean(raffle?.completedAt) ||
    Boolean(raffle?.drawnAt) ||
    Boolean(raffle?.winnerSelectedAt)
  );
};

const mergeCompletedRaffles = (primary, fallback) => {
  const map = new Map();

  [
    ...(Array.isArray(primary) ? primary : []),
    ...(Array.isArray(fallback) ? fallback : []),
  ]
    .filter(isCompletedRaffle)
    .forEach(raffle => {
      const id = String(raffle?._id || raffle?.id || '');

      if (id) {
        map.set(id, {
          ...(map.get(id) || {}),
          ...raffle,
        });
      }
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
};

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

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [selectedRaffle, setSelectedRaffle] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Event search
  const [searchTerm, setSearchTerm] = useState('');

  // Winner pagination
  const [winnerPage, setWinnerPage] = useState(1);
  const [winnersPerPage, setWinnersPerPage] = useState(10);

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [pastResult, raffleResult] = await Promise.allSettled([
        fetch(`${API}/raffles/past-winners`).then(readResponse),
        fetch(`${API}/raffles`).then(readResponse),
      ]);

      const pastRaffles =
        pastResult.status === 'fulfilled' &&
        Array.isArray(pastResult.value.data)
          ? pastResult.value.data
          : [];

      const allRaffles =
        raffleResult.status === 'fulfilled' &&
        Array.isArray(raffleResult.value.data)
          ? raffleResult.value.data
          : [];

      const completed = mergeCompletedRaffles(pastRaffles, allRaffles);

      if (
        pastResult.status === 'rejected' &&
        raffleResult.status === 'rejected'
      ) {
        throw new Error('Could not load past winners.');
      }

      setWinners(completed);
    } catch (err) {
      setError(err.message || 'Could not load past winners.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  // Close modal using Escape
  useEffect(() => {
    if (!selectedRaffle) return;

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setSelectedRaffle(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRaffle]);

  // Search completed events
  const filteredWinners = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return winners;

    return winners.filter(raffle => {
      const title = String(raffle.title || '').toLowerCase();
      const prize = String(raffle.prize || '').toLowerCase();

      return title.includes(search) || prize.includes(search);
    });
  }, [winners, searchTerm]);

  // Extract valid winner wallet addresses
  const selectedWinners = useMemo(() => {
    if (!Array.isArray(selectedRaffle?.winners)) return [];

    return selectedRaffle.winners.map(getWinnerAddress).filter(Boolean);
  }, [selectedRaffle]);

  // Pagination calculations
  const totalWinnerPages = Math.max(
    1,
    Math.ceil(selectedWinners.length / winnersPerPage)
  );

  const currentWinners = selectedWinners.slice(
    (winnerPage - 1) * winnersPerPage,
    winnerPage * winnersPerPage
  );

  const firstWinnerNumber =
    selectedWinners.length === 0 ? 0 : (winnerPage - 1) * winnersPerPage + 1;

  const lastWinnerNumber = Math.min(
    winnerPage * winnersPerPage,
    selectedWinners.length
  );

  const openWinners = raffle => {
    setWinnerPage(1);
    setWinnersPerPage(10);
    setSelectedRaffle(raffle);
  };

  const changePageSize = value => {
    setWinnersPerPage(Number(value));
    setWinnerPage(1);
  };

  const copyAddress = async address => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (err) {
      console.error('Could not copy wallet address:', err);
    }
  };

  return (
    <section className="winners-page">
      <div className="winners-container">
        {/* Page heading */}
        <header className="winners-heading">
          <div>
            <span className="winners-eyebrow">INK BUBBLE CATS COMMUNITY</span>

            <h1>
              Past <span>Winners.</span>
            </h1>

            <p>
              Celebrating our community members and their raffle wins. Explore
              previous events and discover the winning wallets.
            </p>
          </div>

          <button
            type="button"
            className="winners-refresh"
            onClick={fetchWinners}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'winners-spin' : ''} />
            Refresh
          </button>
        </header>

        {/* Events heading */}
        <div className="winners-results-heading">
          <div>
            <h2>Completed events</h2>
            <p>Search previous events and view their winning wallets.</p>
          </div>

          {!loading && (
            <span className="winners-count">
              {filteredWinners.length}{' '}
              {filteredWinners.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>

        {/* Event search */}
        <div className="winners-search-wrapper">
          <Search size={19} />

          <input
            type="text"
            className="winners-search"
            placeholder="Search events by name or prize..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="winners-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="winners-error" role="alert">
            <span>{error}</span>

            <button type="button" onClick={fetchWinners}>
              Try again
            </button>
          </div>
        )}

        {/* Loading and event list */}
        {loading ? (
          <div className="winners-empty">
            <RefreshCw size={24} className="winners-spin" />
            <p>Loading past winners...</p>
          </div>
        ) : error ? null : filteredWinners.length === 0 ? (
          <div className="winners-empty">
            <Trophy size={30} />

            <h3>
              {searchTerm
                ? 'No matching events found'
                : 'No winners announced yet'}
            </h3>

            <p>
              {searchTerm
                ? 'Try searching with another event name or prize.'
                : 'Completed raffles and their winning wallets will appear here.'}
            </p>
          </div>
        ) : (
          <div className="winners-list">
            {filteredWinners.map(raffle => {
              const raffleWinners = Array.isArray(raffle.winners)
                ? raffle.winners
                : [];

              const winnerCount = raffle.winnerCount ?? raffleWinners.length;

              return (
                <article className="winners-card" key={raffle._id || raffle.id}>
                  <div className="winners-image">
                    {raffle.imageUrl ? (
                      <img
                        src={raffle.imageUrl}
                        alt={`${raffle.title || 'Raffle'} event`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="winners-image-placeholder">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>

                  <div className="winners-card-content">
                    <div className="winners-card-top">
                      <span className="winners-completed">
                        <CheckCircle2 size={13} />
                        Completed
                      </span>

                      <span className="winners-date">
                        {formatDate(
                          raffle.completedAt || raffle.drawnAt || raffle.endAt
                        )}
                      </span>
                    </div>

                    <h3>{raffle.title || 'Community Raffle'}</h3>

                    <p className="winners-prize">
                      <Trophy size={16} />
                      {raffle.prize || 'Community raffle'}
                    </p>

                    <div className="winners-card-bottom">
                      <span>
                        <Trophy size={15} />
                        {winnerCount} {winnerCount === 1 ? 'Winner' : 'Winners'}
                      </span>

                      <button
                        type="button"
                        className="winners-view-button"
                        onClick={() => openWinners(raffle)}
                      >
                        View wallets
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Winners modal */}
        {selectedRaffle && (
          <div
            className="winners-modal-backdrop"
            onMouseDown={event => {
              if (event.target === event.currentTarget) {
                setSelectedRaffle(null);
              }
            }}
          >
            <section
              className="winners-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="winners-modal-title"
            >
              <div className="winners-modal-header">
                <div>
                  <span className="winners-eyebrow">PAST RAFFLE</span>

                  <h2 id="winners-modal-title">
                    {selectedRaffle.title || 'Community Raffle'}
                  </h2>

                  <p>{selectedRaffle.prize || 'Community raffle'}</p>
                </div>

                <button
                  type="button"
                  className="winners-modal-close"
                  onClick={() => setSelectedRaffle(null)}
                  aria-label="Close winners popup"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="winners-modal-body">
                {/* Winner list heading and page size */}
                <div className="winners-modal-toolbar">
                  <div>
                    <h3>Selected winning wallets</h3>

                    <p className="winners-pagination-info">
                      {selectedWinners.length > 0
                        ? `Showing ${firstWinnerNumber}-${lastWinnerNumber} of ${selectedWinners.length} winners`
                        : 'No winner wallets available'}
                    </p>
                  </div>

                  {selectedWinners.length > 0 && (
                    <label className="winners-page-size">
                      <span>Show</span>

                      <select
                        value={winnersPerPage}
                        onChange={event => changePageSize(event.target.value)}
                      >
                        {PAGE_SIZE_OPTIONS.map(size => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                {selectedWinners.length === 0 ? (
                  <p className="winners-no-wallets">
                    Winner wallet addresses have not been saved for this raffle
                    yet.
                  </p>
                ) : (
                  <>
                    {/* Paginated wallet list */}
                    <div className="winners-wallet-list">
                      {currentWinners.map((address, index) => {
                        const winnerNumber =
                          (winnerPage - 1) * winnersPerPage + index + 1;

                        return (
                          <div
                            className="winners-wallet"
                            key={`${address}-${winnerNumber}`}
                          >
                            <div>
                              <span>Winner {winnerNumber}</span>

                              <strong title={address}>
                                {shortAddress(address)}
                              </strong>
                            </div>

                            <button
                              type="button"
                              onClick={() => copyAddress(address)}
                            >
                              Copy
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination controls */}
                    {totalWinnerPages > 1 && (
                      <div className="winners-pagination">
                        <button
                          type="button"
                          onClick={() =>
                            setWinnerPage(page => Math.max(1, page - 1))
                          }
                          disabled={winnerPage === 1}
                        >
                          <ChevronLeft size={17} />
                          Previous
                        </button>

                        <span>
                          Page {winnerPage} of {totalWinnerPages}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setWinnerPage(page =>
                              Math.min(totalWinnerPages, page + 1)
                            )
                          }
                          disabled={winnerPage === totalWinnerPages}
                        >
                          Next
                          <ChevronRight size={17} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
};

export default Winners;
