import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './PixelCatArt.css';
import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img3.png';
import img4 from '../assets/img4.png';
import img5 from '../assets/img5.png';

const nfts = [
  { id: 1, name: 'Bubble Cat #001', image: img1 },
  { id: 2, name: 'Bubble Cat #002', image: img2 },
  { id: 3, name: 'Bubble Cat #003', image: img3 },
  { id: 4, name: 'Bubble Cat #004', image: img4 },
  { id: 5, name: 'Bubble Cat #005', image: img5 },
];

export default function PixelCatArt() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  const nextNFT = () => {
    setCurrentIndex(index => (index + 1) % nfts.length);
  };

  const previousNFT = () => {
    setCurrentIndex(index => (index - 1 + nfts.length) % nfts.length);
  };

  const handleTouchStart = event => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = event => {
    if (touchStart === null) return;

    const touchEnd = event.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 50) nextNFT();
    if (distance < -50) previousNFT();

    setTouchStart(null);
  };

  const currentNFT = nfts[currentIndex];

  return (
    <div
      className="pixel-cat-scene"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="pixel-cat-arrow pixel-cat-prev"
        onClick={previousNFT}
        aria-label="Previous NFT"
        type="button"
      >
        <ChevronLeft size={26} />
      </button>

      <div className="pixel-cat-content" key={currentNFT.id}>
        <img
          className="pixel-cat-character"
          src={currentNFT.image}
          alt={currentNFT.name}
          draggable="false"
        />

        <h3 className="pixel-cat-name">{currentNFT.name}</h3>

        <p className="pixel-cat-count">
          NFT {currentIndex + 1} OF {nfts.length}
        </p>
      </div>

      <button
        className="pixel-cat-arrow pixel-cat-next"
        onClick={nextNFT}
        aria-label="Next NFT"
        type="button"
      >
        <ChevronRight size={26} />
      </button>

      <div className="pixel-cat-dots">
        {nfts.map((nft, index) => (
          <button
            key={nft.id}
            type="button"
            className={
              index === currentIndex ? 'pixel-cat-dot active' : 'pixel-cat-dot'
            }
            onClick={() => setCurrentIndex(index)}
            aria-label={`Show NFT ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
