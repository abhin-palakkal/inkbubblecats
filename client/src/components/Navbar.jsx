import { Menu, X } from 'lucide-react';
import { SiX, SiOpensea } from '@icons-pack/react-simple-icons';
import logo from '../assets/logo.png';
import { useState } from 'react';
import { site } from '../config/site';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
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
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'nav-links nav-open' : 'nav-links'}>
        <a href="#wallet-checker" onClick={close}>
          WALLET CHECKER
        </a>
        <a href="#mint-details" onClick={close}>
          MINT DETAILS
        </a>
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
          rel="noreferrer"
          aria-label="X"
        >
          <SiX size={17} />
        </a>
        <a
          className="nav-social"
          href={site.openseaUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="OpenSea"
          title="OpenSea"
          onClick={close}
        >
          <SiOpensea size={22} />
        </a>
      </nav>
    </header>
  );
}
