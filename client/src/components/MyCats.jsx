import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import './MyCats.css';

const PAGE_SIZE = 10;

export default function MyCats() {
  const { address, isConnected } = useAccount();

  const [cats, setCats] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConnected || !address) {
      setCats([]);
      setVisibleCount(PAGE_SIZE);
      return;
    }

    const fetchAllCats = async () => {
      setLoading(true);
      setError('');
      setCats([]);
      setVisibleCount(PAGE_SIZE);

      try {
        let allCats = [];
        let cursor = null;

        do {
          const params = new URLSearchParams();

          if (cursor) {
            params.set('cursor', cursor);
          }

          const query = params.toString();
          const response = await fetch(
            `https://inkbubblecats.onrender.com/my-cats/${address}${query ? `?${query}` : ''}`
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load your cats');
          }

          allCats = [...allCats, ...(data.cats || [])];
          cursor = data.next || null;
        } while (cursor);

        setCats(allCats);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCats();
  }, [address, isConnected]);

  const filteredCats = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return cats;

    return cats.filter(cat =>
      `${cat.name} ${cat.tokenId}`.toLowerCase().includes(term)
    );
  }, [cats, search]);

  const visibleCats = filteredCats.slice(0, visibleCount);

  return (
    <section>
      <h2>MY BUBBLE CATS</h2>

      {!isConnected ? (
        <p>Connect your wallet to see your Bubble Cats.</p>
      ) : (
        <>
          <p>Connected wallet: {address}</p>

          <input
            type="search"
            className="my-cats-search"
            placeholder="Search by cat name or token ID..."
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setVisibleCount(10);
            }}
            aria-label="Search Bubble Cats"
          />

          <p>
            Showing {visibleCats.length} of {filteredCats.length} cats
          </p>

          {loading && <p>Loading all your Bubble Cats...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && filteredCats.length === 0 && (
            <p>No Bubble Cats found.</p>
          )}

          <div className="my-cats-grid">
            {visibleCats.map(cat => (
              <article key={cat.tokenId} className="my-cat-card">
                <img
                  src={cat.image}
                  alt={cat.name || `BUBBLE CATS #${cat.tokenId}`}
                  loading="lazy"
                />
                <h3>{cat.name || `BUBBLE CATS #${cat.tokenId}`}</h3>

                {cat.openseaUrl && (
                  <a href={cat.openseaUrl} target="_blank" rel="noreferrer">
                    View on OpenSea
                  </a>
                )}
              </article>
            ))}
          </div>

          {!loading && visibleCount < filteredCats.length && (
            <button
              type="button"
              className="load-more-cats"
              onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
            >
              LOAD MORE CATS
            </button>
          )}
        </>
      )}
    </section>
  );
}
