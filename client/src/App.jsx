import { useEffect, useState } from 'react';
import PixelCatArt from './components/PixelCatArt';
import Navbar from './components/Navbar';
import { SiX } from '@icons-pack/react-simple-icons';
import MyCats from './components/MyCats';
import {
  ArrowDown,
  ArrowUpRight,
  Sparkles,
  MessageCircle,
  Disc3,
  Heart,
  Gem,
  Users,
  Cat,
  Wallet,
  Image,
} from 'lucide-react';

import { site } from './config/site';
import logo from './assets/logo.png';

const roadmap = [
  {
    number: '01',
    title: 'THE GENESIS',
    text: '3,333 unique Bubble Cats. The beginning of a community and an ecosystem built on INK.',
    status: 'THE FOUNDATION',
    icon: Sparkles,
  },
  {
    number: '02',
    title: 'MORE THAN AN NFT',
    text: 'Your Bubble Cat is designed to be part of our growing ecosystem, with access to future projects and experiences planned for holders.',
    status: 'HOLDER ECOSYSTEM',
    icon: Gem,
  },
  {
    number: '03',
    title: 'THE INK GAME',
    text: 'We aim to build a game within the INK ecosystem, bringing Bubble Cats into a new interactive experience.',
    status: 'GAME DEVELOPMENT PLANS',
    icon: Disc3,
  },
  {
    number: '04',
    title: 'GROW TOGETHER',
    text: 'Build with our community, explore new ideas, and expand the Bubble Cats universe through future projects and experiences.',
    status: 'THE JOURNEY CONTINUES',
    icon: Users,
  },
];

function App() {
  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    const apiBase = (
      import.meta.env.VITE_API_URL || 'http://localhost:3000'
    ).replace(/\/$/, '');

    fetch(`${apiBase}/site-info`)
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (data) setSiteInfo(data);
      })
      .catch(() => {});
  }, []);

  const supply = siteInfo?.supply?.toLocaleString?.() || site.supply || '3,333';

  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="hero-pill">
              <span className="pulse-dot" />
              YOUR PIXEL CAT UNIVERSE ON INK
            </div>

            <h1>
              YOUR CATS.
              <br />
              <span>YOUR WORLD.</span>
              <br />
              INK ENERGY<span className="title-period">.</span>
            </h1>

            <p className="hero-description">
              Your Ink Bubble Cats journey starts here. Connect your wallet,
              discover the cats you own, and explore our growing pixel universe
              on INK Chain.
            </p>

            <div className="hero-actions">
              <button
                className="button-primary"
                type="button"
                onClick={() =>
                  document.getElementById('my-cats')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
              >
                EXPLORE MY CATS <ArrowUpRight size={17} />
              </button>

              <a className="button-secondary" href="#about">
                EXPLORE <ArrowDown size={16} />
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <span className="stat-icon">
                  <img src={logo} alt="" className="site-logo-icon" />
                </span>
                <strong>{supply}</strong>
                <small>TOTAL SUPPLY</small>
              </div>

              <div>
                <span className="stat-icon">
                  <Disc3 size={17} />
                </span>
                <strong>INK</strong>
                <small>NETWORK</small>
              </div>

              <div>
                <span className="stat-icon">
                  <Heart size={17} />
                </span>
                <strong>100%</strong>
                <small>CAT ENERGY</small>
              </div>
            </div>
          </div>

          <PixelCatArt />

          <div className="hero-bottom-note">
            <span className="tiny-square" />
            CONNECT YOUR WALLET. DISCOVER YOUR CATS.
          </div>
        </section>

        {/* COLLECTION TICKER */}
        <div className="ticker" aria-hidden="true">
          <div>
            ✦ INK BUBBLE CATS <span>✦</span> YOUR CATS <span>✦</span> INK CHAIN{' '}
            <span>✦</span> PIXEL MAGIC <span>✦</span> COMMUNITY FIRST{' '}
            <span>✦</span> INK BUBBLE CATS <span>✦</span>
          </div>
        </div>

        {/* MY CATS */}
        <section className="checker-section section-wrap" id="my-cats">
          <div className="section-kicker">
            <span className="pixel-dot" />
            YOUR COLLECTION
          </div>

          <h2 className="section-title">
            MEET <span>YOUR CATS.</span>
          </h2>

          <p className="hero-description">
            Connect your wallet to discover your Ink Bubble Cats collection.
          </p>

          <MyCats />
        </section>
        {/* ABOUT */}
        <section className="about-section section-wrap" id="about">
          <div className="about-art">
            <div className="about-orbit orbit-one" />
            <div className="about-orbit orbit-two" />

            <div className="about-cat">
              <Cat size={92} strokeWidth={1.5} />
            </div>

            <span className="about-spark spark-one">✦</span>
            <span className="about-spark spark-two">✧</span>
            <span className="about-tag">EST. ON INK</span>
          </div>

          <div className="about-copy">
            <div className="section-kicker">
              <span className="pixel-dot" />A LITTLE ABOUT US
            </div>

            <h2 className="section-title">
              NOT JUST CATS.
              <br />
              <span>A WHOLE VIBE.</span>
            </h2>

            <p>
              Meet Ink Bubble Cats — a collection of 3,333 unique pixel cats
              bringing colorful characters, creative energy, and community vibes
              to the INK ecosystem.
            </p>

            <p>
              Explore your collection, discover what you own, and join our
              community as we build the Bubble Cats universe together.
            </p>

            <div className="about-tags">
              <span>3,333 PIXEL CATS</span>
              <span>COMMUNITY FIRST</span>
              <span>INK ECOSYSTEM</span>
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section className="roadmap-section section-wrap" id="roadmap">
          <div className="roadmap-heading">
            <div>
              <div className="section-kicker">
                <span className="pixel-dot" />
                THE BIGGER VISION
              </div>

              <h2 className="section-title">
                MORE THAN <span>PIXELS.</span>
              </h2>
            </div>

            <p>
              One collection.
              <br />A universe of possibilities.
            </p>
          </div>

          <div className="roadmap-grid">
            {roadmap.map(({ number, title, text, status, icon: Icon }) => (
              <article className="roadmap-card" key={number}>
                <div className="roadmap-card-top">
                  <span className="roadmap-number">{number}</span>
                  <Icon size={23} />
                </div>

                <h3>{title}</h3>
                <p>{text}</p>

                <span className="roadmap-status">
                  <i />
                  {status}
                </span>
              </article>
            ))}
          </div>

          <p className="roadmap-disclaimer">
            Future projects, game development, and holder experiences are
            planned ambitions and may evolve as the ecosystem develops. Follow
            our official channels for confirmed announcements.
          </p>
        </section>

        {/* COMMUNITY */}
        <section className="community-section">
          <div className="community-inner section-wrap">
            <span className="community-cat">
              <Cat size={36} />
            </span>

            <div className="community-copy">
              <div className="section-kicker">YOUR PEOPLE ARE HERE</div>

              <h2>
                COME JOIN THE <span>CAT CREW.</span>
              </h2>

              <p>
                Follow the updates. Catch the bubbles. Be part of the story.
              </p>
            </div>

            <div className="community-links">
              <a
                href={site.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Ink Bubble Cats on X"
              >
                FOLLOW ON <SiX size={18} />
              </a>

              {site.discordUrl && (
                <a
                  href={site.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join the Ink Bubble Cats Discord"
                >
                  <MessageCircle size={18} />
                  DISCORD
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer section-wrap">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">
            <img src={logo} alt="" className="footer-logo" />
          </span>

          <span>
            INK <b>BUBBLE CATS</b>
            <small>PIXEL CAT CLUB</small>
          </span>
        </a>

        <span>
          MADE WITH <b className="footer-heart">♥</b> AND PIXELS
        </span>

        <div className="footer-right">
          <a href="#home" className="back-top">
            BACK TO TOP ↑
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
