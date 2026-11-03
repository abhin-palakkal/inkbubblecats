import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Ticket,
  Users,
  Disc3,
  Trophy,
  ShieldCheck,
  Wallet,
  Gift,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

import './Home.css';

import PixelCatArt from '../../src/components/PixelCatArt';
import { site } from '../../src/config/site';
import logo from '../../src/assets/logo.png';

const ticketTiers = [
  { min: 1, max: 2, tickets: 1 },
  { min: 3, max: 4, tickets: 2 },
  { min: 5, max: 9, tickets: 3 },
  { min: 10, max: 19, tickets: 5 },
  { min: 20, max: 49, tickets: 7 },
  { min: 50, max: Infinity, tickets: 10 },
];

const calculateRaffleTickets = nftCount => {
  if (nftCount >= 50) return 10;
  if (nftCount >= 20) return 7;
  if (nftCount >= 10) return 5;
  if (nftCount >= 5) return 3;
  if (nftCount >= 3) return 2;
  if (nftCount >= 1) return 1;

  return 0;
};

const Home = () => {
  const [siteInfo, setSiteInfo] = useState(null);
  const [nftCount, setNftCount] = useState('1');

  useEffect(() => {
    const controller = new AbortController();

    const apiBase = (
      import.meta.env.VITE_API_URL || 'http://localhost:3000'
    ).replace(/\/$/, '');

    fetch(`${apiBase}/site-info`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Unable to load site information');
        return response.json();
      })
      .then(data => setSiteInfo(data))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Site info error:', error);
        }
      });

    return () => controller.abort();
  }, []);

  const supplyValue =
    siteInfo?.data?.supply ?? siteInfo?.supply ?? site.supply ?? 3333;

  const supply = Number(supplyValue).toLocaleString();

  const ownedNFTs = Math.max(
    0,
    Math.min(100000, Math.floor(Number(nftCount) || 0))
  );

  const raffleTickets = calculateRaffleTickets(ownedNFTs);

  const nextTier = ticketTiers.find(tier => ownedNFTs < tier.min);

  const remainingNFTs = nextTier ? nextTier.min - ownedNFTs : 0;

  return (
    <main className="home-page">
      {/* HERO */}
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="hero-pill">
            <span className="pulse-dot" />
            THE COMMUNITY RAFFLE HUB ON INK
          </div>

          <h1>
            MORE CATS.
            <br />
            <span>MORE TICKETS.</span>
            <br />
            MORE CHANCES<span className="title-period">.</span>
          </h1>

          <p className="hero-description">
            Your Ink Bubble Cats do more than sit in your wallet. Hold your
            cats, earn raffle tickets, and get access to exclusive NFT rewards,
            free mints, and community collaborations.
          </p>

          <div className="hero-actions">
            <Link to="/raffles" className="button-primary">
              EXPLORE RAFFLES <ArrowRight size={17} />
            </Link>

            <Link to="/my-cats" className="button-secondary">
              VIEW MY CATS
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <span className="stat-icon">
                <img src={logo} alt="" className="site-logo-icon" />
              </span>
              <strong>{supply}</strong>
              <small>UNIQUE BUBBLE CATS</small>
            </div>

            <div>
              <span className="stat-icon">
                <Ticket size={17} />
              </span>
              <strong>10 MAX</strong>
              <small>RAFFLE TICKETS</small>
            </div>

            <div>
              <span className="stat-icon">
                <Disc3 size={17} />
              </span>
              <strong>INK</strong>
              <small>POWERED BY INK</small>
            </div>
          </div>
        </div>

        <PixelCatArt />

        <div className="hero-bottom-note">
          <span className="tiny-square" />
          HOLD YOUR CATS. EARN TICKETS. JOIN THE RAFFLES.
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker" aria-hidden="true">
        <div>
          ✦ INK BUBBLE CATS <span>✦</span>
          MORE CATS MORE TICKETS <span>✦</span>
          NFT RAFFLES <span>✦</span>
          COMMUNITY REWARDS <span>✦</span>
          BUILT ON INK <span>✦</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="how-it-works section-wrap">
        <div className="home-section-heading centered-heading">
          <div>
            <div className="section-kicker">
              <span className="pixel-dot" />
              SIMPLE. FAIR. COMMUNITY POWERED.
            </div>

            <h2 className="section-title">
              HOW IT <span>WORKS.</span>
            </h2>

            <p className="hero-description">
              Getting started is easy. Your NFT holdings determine how many
              tickets you receive for each eligible raffle.
            </p>
          </div>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon">
              <Wallet size={25} />
            </div>
            <h3>HOLD YOUR CATS</h3>
            <p>
              Own Ink Bubble Cats in your wallet. The more cats you hold, the
              more raffle tickets you can earn.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon">
              <Ticket size={25} />
            </div>
            <h3>EARN TICKETS</h3>
            <p>
              Your eligible NFT count determines your ticket allocation based on
              our holding tiers.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon">
              <Trophy size={25} />
            </div>
            <h3>JOIN & WIN</h3>
            <p>
              Enter available raffles, follow the requirements, and get a chance
              to win exciting community rewards.
            </p>
          </article>
        </div>
      </section>

      {/* TICKET CALCULATOR */}
      <section id="tickets" className="ticket-section section-wrap">
        <div className="ticket-content">
          <div className="section-kicker">
            <span className="pixel-dot" />
            YOUR HOLDINGS. YOUR TICKETS.
          </div>

          <h2 className="section-title">
            MORE CATS.
            <br />
            <span>MORE TICKETS.</span>
          </h2>

          <p className="hero-description">
            Every eligible holder receives raffle tickets based on their total
            Ink Bubble Cats holdings. Check your ticket allocation below.
          </p>

          <div className="ticket-calculator">
            <label htmlFor="nft-count">HOW MANY BUBBLE CATS DO YOU HOLD?</label>

            <input
              id="nft-count"
              type="number"
              min="0"
              max="100000"
              step="1"
              value={nftCount}
              onChange={event => setNftCount(event.target.value)}
              placeholder="Enter NFT quantity"
            />

            <div className="ticket-result">
              <div>
                <span>YOUR RAFFLE TICKETS</span>
                <strong>{raffleTickets}</strong>
                <small>
                  {raffleTickets === 1 ? 'TICKET' : 'TICKETS'} PER ELIGIBLE
                  RAFFLE
                </small>
              </div>

              <Ticket size={42} />
            </div>

            {ownedNFTs === 0 ? (
              <p className="ticket-hint">
                Hold at least 1 Ink Bubble Cat to receive a raffle ticket.
              </p>
            ) : nextTier ? (
              <p className="ticket-hint">
                Hold {remainingNFTs} more {remainingNFTs === 1 ? 'cat' : 'cats'}{' '}
                to unlock {nextTier.tickets} tickets.
              </p>
            ) : (
              <p className="ticket-hint">
                You've unlocked the maximum allocation of 10 tickets!
              </p>
            )}

            <Link to="/my-cats" className="button-primary calculator-button">
              CHECK MY HOLDINGS <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="ticket-tiers">
          <div className="section-kicker">
            <span className="pixel-dot" />
            TICKET ALLOCATION
          </div>

          <h3>HOLDING TIERS</h3>

          <p>Your ticket allocation increases as your collection grows.</p>

          <div className="tier-list">
            {ticketTiers.map((tier, index) => {
              const isActive =
                ownedNFTs >= tier.min &&
                (tier.max === Infinity || ownedNFTs <= tier.max);

              return (
                <div
                  className={`tier-row ${isActive ? 'tier-active' : ''}`}
                  key={tier.min}
                >
                  <div className="tier-nft">
                    <img src={logo} alt="" />
                    <span>
                      {tier.min}
                      {tier.max === Infinity ? '+' : `–${tier.max}`} CATS
                    </span>
                  </div>

                  <div className="tier-tickets">
                    <Ticket size={16} />
                    <strong>{tier.tickets}</strong>
                    <span>{tier.tickets === 1 ? 'TICKET' : 'TICKETS'}</span>
                  </div>

                  {isActive && <span className="tier-current">YOUR TIER</span>}
                </div>
              );
            })}
          </div>

          <div className="tier-note">
            <ShieldCheck size={18} />
            <span>
              Ticket allocation is based on eligible NFT holdings and may vary
              if a raffle has additional requirements.
            </span>
          </div>
        </div>
      </section>

      {/* RAFFLE PROMOTION */}
      <section className="home-raffles section-wrap">
        <div className="home-section-heading">
          <div>
            <div className="section-kicker">
              <span className="pixel-dot" />
              SOMETHING EXCITING IS WAITING
            </div>

            <h2 className="section-title">
              DISCOVER <span>RAFFLES.</span>
            </h2>

            <p className="hero-description">
              Explore free mint spots, NFT prizes, exclusive collaborations, and
              rewards from projects across the Ink ecosystem.
            </p>
          </div>

          <Link to="/raffles" className="button-secondary">
            VIEW ALL RAFFLES <ArrowRight size={16} />
          </Link>
        </div>

        <div className="raffle-promo-grid">
          <article className="raffle-promo-card">
            <div className="promo-icon">
              <Gift size={25} />
            </div>
            <span>COMMUNITY REWARDS</span>
            <h3>EXCLUSIVE PRIZES</h3>
            <p>
              Discover NFT rewards, free mints, whitelist spots, and special
              opportunities.
            </p>
            <Link to="/raffles">
              EXPLORE RAFFLES <ChevronRight size={16} />
            </Link>
          </article>

          <article className="raffle-promo-card">
            <div className="promo-icon">
              <Ticket size={25} />
            </div>
            <span>YOUR HOLDINGS MATTER</span>
            <h3>MORE TICKETS</h3>
            <p>
              Build your collection and unlock higher ticket allocations for
              eligible raffles.
            </p>
            <Link to="/my-cats">
              VIEW MY CATS <ChevronRight size={16} />
            </Link>
          </article>

          <article className="raffle-promo-card">
            <div className="promo-icon">
              <Trophy size={25} />
            </div>
            <span>THE WINNERS' WALL</span>
            <h3>PAST WINNERS</h3>
            <p>
              See previous raffle winners and celebrate the community members
              who won.
            </p>
            <Link to="/winners">
              SEE WINNERS <ChevronRight size={16} />
            </Link>
          </article>
        </div>
      </section>

      {/* HOLDER COMMUNITY */}
      <section id="about" className="home-community section-wrap">
        <div className="home-community-content">
          <div className="section-kicker">
            <span className="pixel-dot" />
            MORE THAN JUST AN NFT
          </div>

          <h2 className="section-title">
            YOUR BUBBLE CAT.
            <br />
            <span>YOUR COMMUNITY.</span>
          </h2>

          <p className="hero-description">
            Ink Bubble Cats is about building together. Connect with holders,
            discover new collaborations, support projects, and enjoy the Ink
            ecosystem.
          </p>

          <div className="hero-actions">
            <Link to="/my-cats" className="button-primary">
              EXPLORE MY CATS <ArrowRight size={17} />
            </Link>

            <a
              href="https://x.com/InkBubbleCats"
              target="_blank"
              rel="noreferrer"
              className="button-secondary"
            >
              JOIN OUR COMMUNITY <ExternalLink size={15} />
            </a>
          </div>
        </div>

        <div className="home-community-features">
          <article>
            <Ticket size={25} />
            <h3>EXCLUSIVE RAFFLES</h3>
            <p>Free mints, NFT prizes, and special rewards.</p>
          </article>

          <article>
            <Users size={25} />
            <h3>COMMUNITY FIRST</h3>
            <p>Collaborations and opportunities for holders.</p>
          </article>

          <article>
            <Sparkles size={25} />
            <h3>BUILT ON INK</h3>
            <p>Growing together in the Ink ecosystem.</p>
          </article>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-final-cta section-wrap">
        <div>
          <div className="section-kicker">
            <span className="pixel-dot" />
            YOUR NEXT WIN STARTS HERE
          </div>

          <h2>
            READY TO <span>PLAY?</span>
          </h2>

          <p>
            Check your Bubble Cats, discover active raffles, and make the most
            of your tickets.
          </p>
        </div>

        <Link to="/raffles" className="button-primary">
          ENTER THE RAFFLE HUB <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
};

export default Home;
