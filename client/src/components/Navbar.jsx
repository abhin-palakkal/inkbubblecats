import { useState, useEffect } from 'react';
import { Menu, X, Home, Cat, Trophy, Ticket, Info } from 'lucide-react';

import { SiX, SiOpensea } from '@icons-pack/react-simple-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import './Navbar.css';

import logo from '../assets/logo.png';
import { site } from '../config/site';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  // Navigate to a section on the Home page
  const navigateToSection = id => {
    close();

    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Handle section scrolling after navigating to Home
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.substring(1);

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [location.pathname, location.hash]);

  // Scroll to Home top
  const navigateHome = () => {
    close();

    if (location.pathname !== '/') {
      navigate('/');
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <header className="navbar">
      {/* BRAND */}
      <Link className="brand" to="/" onClick={navigateHome}>
        <span className="brand-mark">
          <img src={logo} alt="Ink Bubble Cats logo" />
        </span>

        <span className="brand-text">
          INK <b>BUBBLE CATS</b>
          <small>PIXEL CAT CLUB</small>
        </span>
      </Link>

      {/* MOBILE MENU */}
      <button
        type="button"
        className="mobile-menu"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* NAVIGATION */}
      <nav className={`nav-links ${open ? 'nav-open' : ''}`}>
        <Link to="/" onClick={navigateHome}>
          <Home size={16} />
          <span>HOME</span>
        </Link>

        <Link to="/my-cats" onClick={close}>
          <Cat size={16} />
          <span>MY CATS</span>
        </Link>

        <Link to="/raffles" onClick={close}>
          <Ticket size={16} />
          <span>RAFFLES</span>
        </Link>

        <Link to="/winners" onClick={close}>
          <Trophy size={16} />
          <span>WINNERS</span>
        </Link>

        <Link to="/" onClick={() => navigateToSection('tickets')}>
          <Ticket size={16} />
          <span>TICKETS</span>
        </Link>

        <Link to="/" onClick={() => navigateToSection('about')}>
          <Info size={16} />
          <span>ABOUT</span>
        </Link>

        {/* SOCIAL LINKS */}
        <div className="nav-social-group">
          <a
            className="nav-social"
            href={site.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ink Bubble Cats on X"
            onClick={close}
          >
            <SiX size={19} />
          </a>

          <a
            className="nav-social"
            href={site.openseaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ink Bubble Cats on OpenSea"
            title="OpenSea"
            onClick={close}
          >
            <SiOpensea size={21} />
          </a>
        </div>

        {/* CONNECT WALLET */}
        <div className="nav-wallet">
          <ConnectWallet />
        </div>
      </nav>
    </header>
  );
}
