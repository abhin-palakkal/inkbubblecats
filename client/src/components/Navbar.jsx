import { Menu, X, Cat } from 'lucide-react';
import { SiX, SiOpensea } from '@icons-pack/react-simple-icons';
import { useState } from 'react';
import './Navbar.css';

import logo from '../assets/logo.png';
import { site } from '../config/site';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const openMyCats = () => {
    close();

    document.getElementById('my-cats')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <header className="navbar">
      <a className="brand" href="#home" onClick={close}>
        <span className="brand-mark">
          <img src={logo} alt="Ink Bubble Cats logo" />
        </span>

        <span>
          INK <b>BUBBLE CATS</b>
          <small>PIXEL CAT CLUB</small>
        </span>
      </a>

      <button
        className="mobile-menu"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? 'nav-links nav-open' : 'nav-links'}>
        <a href="#about" onClick={close}>
          ABOUT
        </a>

        <a href="#roadmap" onClick={close}>
          ROADMAP
        </a>

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
          <SiOpensea size={22} />
        </a>

        <button className="my-cats-button" onClick={openMyCats}>
          <Cat size={18} />
          <span>MY CATS</span>
        </button>

        <ConnectWallet />
      </nav>
    </header>
  );
}
