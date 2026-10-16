import { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Ticket,
  Globe2,
  CircleX,
  LoaderCircle,
  RotateCcw,
} from 'lucide-react';

import EligibilityShareCard from './EligibilityShareCard';

const apiBase = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const resultConfig = {
  GTD: {
    title: 'GTD ELIGIBLE',
    subtitle: 'Your spot is guaranteed!',
    detail: "You're on the guaranteed mint list.",
    Icon: ShieldCheck,
    tone: 'green',
  },
  FCFS: {
    title: 'FCFS ELIGIBLE',
    subtitle: "You're on the FCFS list!",
    detail: 'Mint spots may be limited and are first come, first served.',
    Icon: Ticket,
    tone: 'blue',
  },
  PUBLIC: {
    title: 'PUBLIC MINT',
    subtitle: 'Public mint access',
    detail: 'You can participate when the public mint phase is open.',
    Icon: Globe2,
    tone: 'purple',
  },
  NONE: {
    title: 'NO ALLOWLIST SPOT',
    subtitle: 'No GTD or FCFS found',
    detail: 'This wallet has no recorded GTD or FCFS allocation.',
    Icon: CircleX,
    tone: 'red',
  },
};

export default function WalletChecker() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    setError('');

    const cleanAddress = address.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      setError(
        'Enter a valid wallet address (0x + 40 hexadecimal characters).'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/wallet/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: cleanAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to check this wallet.');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const config = result ? resultConfig[result.eligibility] : null;

  const ResultIcon = config?.Icon;

  function resetChecker() {
    setResult(null);
    setError('');
    setAddress('');
  }

  return (
    <section className="checker-section section-wrap" id="wallet-checker">
      <div className="section-kicker">
        <span className="pixel-dot" /> THE ORACLE
      </div>

      <h2 className="section-title">
        CHECK YOUR <span>WALLET</span>
      </h2>

      <p className="section-copy">
        One address. One quick check. Find your place in the Bubble Cats
        universe.
      </p>

      <div className="checker-card pixel-border">
        <div className="checker-top">
          <span className="window-dots">
            <i />
            <i />
            <i />
          </span>

          <span>WALLET.EXE</span>
          <span className="online-dot">● LIVE CHECK</span>
        </div>

        <form onSubmit={handleSubmit} className="wallet-form">
          <label htmlFor="wallet-address">YOUR WALLET ADDRESS</label>

          <div className="input-row">
            <input
              id="wallet-address"
              value={address}
              onChange={event => setAddress(event.target.value)}
              placeholder="0x paste your wallet address..."
              autoComplete="off"
              spellCheck="false"
            />

            <button className="check-button" type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Search size={18} />
              )}

              <span>{loading ? 'CHECKING' : 'CHECK WALLET'}</span>
            </button>
          </div>

          <p className="input-hint">
            We only need your public wallet address. Never share your seed
            phrase or private key.
          </p>
        </form>

        {error && (
          <div className="feedback error-feedback" role="alert">
            <CircleX size={21} />
            <span>{error}</span>
          </div>
        )}

        {result && config && (
          <>
            <div
              className={`result-card result-${config.tone}`}
              aria-live="polite"
            >
              <div className="result-icon">
                <ResultIcon size={30} />
              </div>

              <div className="result-content">
                <span className="result-eyebrow">CHECK COMPLETE</span>

                <h3>{config.title}</h3>
                <strong>{config.subtitle}</strong>

                <p>{result.message || config.detail}</p>
                <code>{result.address || address.trim()}</code>
              </div>

              <button
                className="reset-button"
                type="button"
                onClick={resetChecker}
                aria-label="Check another wallet"
              >
                <RotateCcw size={17} />
              </button>
            </div>

            {(result.eligibility === 'GTD' ||
              result.eligibility === 'FCFS') && (
              <EligibilityShareCard
                eligibility={result.eligibility}
                address={result.address || address.trim()}
              />
            )}
          </>
        )}
      </div>

      <div className="checker-note">
        <span>✦</span> Eligibility is based on the project's current wallet list
        and does not guarantee an on-chain transaction will succeed.
      </div>
    </section>
  );
}
