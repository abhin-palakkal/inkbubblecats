import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Download,
  Image as ImageIcon,
  LoaderCircle,
  Share2,
  Sparkles,
} from 'lucide-react';
import './EligibilityShareCard.css';

import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img3.png';
import img4 from '../assets/img4.png';
import img5 from '../assets/img5.png';

const images = [
  { id: 1, src: img1 },
  { id: 2, src: img2 },
  { id: 3, src: img3 },
  { id: 4, src: img4 },
  { id: 5, src: img5 },
];

const BRAND = 'INK BUBBLE CATS';
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 675;

export default function EligibilityShareCard({ eligibility, address = '' }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const canvasRef = useRef(null);

  const cleanAddress = String(address || '').trim();
  const isGTD = eligibility === 'GTD';

  useEffect(() => {
    return () => {
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [generatedUrl]);

  if (!['GTD', 'FCFS'].includes(eligibility)) {
    return null;
  }

  const postText = isGTD
    ? `I just got GTD for ${BRAND} on INK Chain! 🐱💜

3,333 pixel cats. One growing ecosystem. Let's go!

@InkBubbleCats #INK  

Wallet: ${cleanAddress}`
    : `I just got FCFS access for ${BRAND} on INK Chain! 🐱💜

3,333 pixel cats. One growing ecosystem. Let's go!

@InkBubbleCats #INK  

Wallet: ${cleanAddress}`;

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function drawCoverImage(ctx, image) {
    const scale = Math.max(
      CANVAS_WIDTH / image.naturalWidth,
      CANVAS_HEIGHT / image.naturalHeight
    );

    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    ctx.drawImage(
      image,
      (CANVAS_WIDTH - width) / 2,
      (CANVAS_HEIGHT - height) / 2,
      width,
      height
    );
  }

  async function generateImage() {
    setGenerating(true);
    setError('');

    try {
      if (!cleanAddress) {
        throw new Error(
          'Wallet address is missing. Check a wallet first, then generate your card.'
        );
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!ctx) {
        throw new Error('Your browser could not create the image.');
      }

      const artwork = new Image();
      artwork.src = selectedImage.src;

      await new Promise((resolve, reject) => {
        if (artwork.complete && artwork.naturalWidth > 0) {
          resolve();
          return;
        }

        artwork.onload = resolve;
        artwork.onerror = () =>
          reject(new Error('Could not load the selected artwork.'));
      });

      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      // Artwork background
      drawCoverImage(ctx, artwork);

      // Premium dark overlay
      const gradient = ctx.createLinearGradient(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );

      gradient.addColorStop(0, 'rgba(12, 8, 28, 0.82)');
      gradient.addColorStop(0.52, 'rgba(17, 10, 39, 0.54)');
      gradient.addColorStop(1, 'rgba(9, 7, 22, 0.94)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Border
      ctx.strokeStyle = 'rgba(207, 173, 255, 0.95)';
      ctx.lineWidth = 3;
      roundedRect(ctx, 24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48, 26);
      ctx.stroke();

      // Small accent
      ctx.fillStyle = '#c9a3ff';
      roundedRect(ctx, 66, 67, 8, 38, 4);
      ctx.fill();

      ctx.textBaseline = 'alphabetic';

      // Header
      ctx.fillStyle = '#e3d0ff';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('INK CHAIN COMMUNITY', 91, 93);

      // Main headline
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 82px Arial';
      ctx.fillText(isGTD ? 'I GOT GTD!' : 'I GOT FCFS!', 66, 208);
      ctx.shadowBlur = 0;

      // Project name
      ctx.fillStyle = '#d8baff';
      ctx.font = 'bold 34px Arial';
      ctx.fillText(BRAND, 70, 267);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.font = '25px Arial';
      ctx.fillText(
        isGTD
          ? 'My mint spot is guaranteed.'
          : 'Ready for the first-come mint.',
        70,
        315
      );

      // Wallet panel
      ctx.fillStyle = 'rgba(12, 8, 29, 0.88)';
      roundedRect(ctx, 62, 363, CANVAS_WIDTH - 124, 108, 16);
      ctx.fill();

      ctx.strokeStyle = 'rgba(202, 164, 255, 0.52)';
      ctx.lineWidth = 1.5;
      roundedRect(ctx, 62, 363, CANVAS_WIDTH - 124, 108, 16);
      ctx.stroke();

      ctx.fillStyle = '#c9a3ff';
      ctx.font = 'bold 17px Arial';
      ctx.fillText('CHECKED WALLET ADDRESS', 84, 395);

      ctx.fillStyle = '#ffffff';
      ctx.font = '22px monospace';

      // Draw the complete wallet address on the image.
      const maxWalletWidth = CANVAS_WIDTH - 190;
      let walletFontSize = 22;

      while (
        ctx.measureText(cleanAddress).width > maxWalletWidth &&
        walletFontSize > 14
      ) {
        walletFontSize -= 1;
        ctx.font = `${walletFontSize}px monospace`;
      }

      ctx.fillText(cleanAddress, 84, 438);

      // Footer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 21px Arial';
      ctx.fillText('3,333 PIXEL CATS  •  BUILT ON INK', 66, 544);

      ctx.fillStyle = '#d8baff';
      ctx.font = '20px Arial';
      ctx.fillText('#InkBubbleCats  #INK', 66, 586);

      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        throw new Error('Image generation failed. Please try again.');
      }

      const url = URL.createObjectURL(blob);
      setGeneratedUrl(url);
    } catch (err) {
      setError(err.message || 'Could not generate the image.');
    } finally {
      setGenerating(false);
    }
  }

  function downloadImage() {
    if (!generatedUrl) return;

    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = `ink-bubble-cats-${eligibility.toLowerCase()}.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function shareOnX() {
    if (!cleanAddress) {
      setError('Wallet address is missing. Please check the wallet again.');
      return;
    }

    // Include the actual checked address in the prefilled X post.
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      postText
    )}`;

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  function selectArtwork(image) {
    setSelectedImage(image);
    setError('');
    setGeneratedUrl('');
  }

  return (
    <section className="eligibility-share">
      <canvas
        ref={canvasRef}
        className="eligibility-share-canvas"
        aria-hidden="true"
      />

      <div className="eligibility-share-topline">
        <span className="eligibility-share-icon">
          <Sparkles size={19} />
        </span>

        <span className="eligibility-share-eyebrow">
          INK BUBBLE CATS · SHARE STUDIO
        </span>

        <span className="eligibility-share-status">
          <span />
          {eligibility} ELIGIBLE
        </span>
      </div>

      <div className="eligibility-share-heading">
        <div>
          <h3>Create your share card</h3>
          <p>
            Choose your favourite artwork, generate your card, and share your
            eligibility with the community.
          </p>
        </div>
      </div>

      <div className="eligibility-share-section-label">
        <span>01</span>
        <div>
          <strong>Choose your artwork</strong>
          <small>Pick one of the five designs</small>
        </div>
      </div>

      <div className="eligibility-image-options" aria-label="Choose artwork">
        {images.map(image => (
          <button
            key={image.id}
            type="button"
            className={`eligibility-image-option ${
              selectedImage.id === image.id ? 'selected' : ''
            }`}
            onClick={() => selectArtwork(image)}
            aria-label={`Choose artwork ${image.id}`}
            aria-pressed={selectedImage.id === image.id}
          >
            <img src={image.src} alt={`Bubble Cats artwork ${image.id}`} />

            <span className="eligibility-image-number">
              {selectedImage.id === image.id ? (
                <Check size={15} />
              ) : (
                `0${image.id}`
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="eligibility-share-section-label preview-label">
        <span>02</span>
        <div>
          <strong>Preview your card</strong>
          <small>Your wallet address will be included</small>
        </div>
      </div>

      <div className="eligibility-share-preview">
        {generatedUrl ? (
          <img
            className="eligibility-generated-image"
            src={generatedUrl}
            alt={`${eligibility} Ink Bubble Cats share card`}
          />
        ) : (
          <div className="eligibility-preview-placeholder">
            <img src={selectedImage.src} alt="" />

            <div className="eligibility-preview-overlay">
              <span className="eligibility-preview-label">
                INK CHAIN COMMUNITY
              </span>

              <strong>{isGTD ? 'I GOT GTD!' : 'I GOT FCFS!'}</strong>

              <span className="eligibility-preview-brand">{BRAND}</span>

              <span className="eligibility-preview-description">
                {isGTD
                  ? 'My mint spot is guaranteed.'
                  : 'Ready for the first-come mint.'}
              </span>

              <div className="eligibility-preview-wallet">
                <small>CHECKED WALLET ADDRESS</small>
                <span>
                  {cleanAddress || 'Check a wallet to show its address'}
                </span>
              </div>

              <small className="eligibility-preview-footer">
                3,333 PIXEL CATS · BUILT ON INK
              </small>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="eligibility-share-error" role="alert">
          {error}
        </p>
      )}

      <div className="eligibility-share-actions">
        <button
          type="button"
          className="eligibility-generate-button"
          onClick={generateImage}
          disabled={generating}
        >
          {generating ? (
            <LoaderCircle className="eligibility-spin" size={18} />
          ) : (
            <ImageIcon size={18} />
          )}
          {generating ? 'GENERATING CARD...' : 'GENERATE SHARE CARD'}
        </button>

        {generatedUrl && (
          <>
            <button
              type="button"
              className="eligibility-download-button"
              onClick={downloadImage}
            >
              <Download size={18} />
              DOWNLOAD PNG
            </button>

            <button
              type="button"
              className="eligibility-x-button"
              onClick={shareOnX}
            >
              <Share2 size={18} />
              SHARE ON X
            </button>
          </>
        )}
      </div>

      <p className="eligibility-share-tip">
        <span>
          <Check size={15} />
        </span>
        Generate and download your card, then attach the PNG to your X post.
      </p>
    </section>
  );
}
