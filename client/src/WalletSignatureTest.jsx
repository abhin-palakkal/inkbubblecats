import { useState } from 'react';

const API = 'http://localhost:3000/raffles';

export default function WalletSignatureTest() {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('Not connected');
  const [verificationToken, setVerificationToken] = useState('');

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setWalletAddress(accounts[0]);
      setStatus('Wallet connected');
      setVerificationToken('');
    } catch (error) {
      setStatus(error.message || 'Failed to connect wallet');
    }
  };

  const verifyWallet = async () => {
    try {
      setStatus('Requesting verification message...');
      setVerificationToken('');

      if (!window.ethereum || !walletAddress) {
        throw new Error('Connect your wallet first.');
      }

      // Request a nonce and exact message from the backend
      const nonceResponse = await fetch(`${API}/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      const nonceResult = await nonceResponse.json();

      if (!nonceResponse.ok || !nonceResult.success) {
        throw new Error(nonceResult.message || 'Nonce request failed.');
      }

      const message = nonceResult.data.message;

      setStatus('Please approve the signature in MetaMask...');

      // Sign the server-generated message
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      setStatus('Checking signature...');

      // Verify signature and obtain JWT
      const verifyResponse = await fetch(`${API}/verify-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          message,
          signature,
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyResult.success) {
        throw new Error(verifyResult.message || 'Wallet verification failed.');
      }

      setVerificationToken(verifyResult.data.verificationToken);
      setStatus('Wallet verified successfully!');
    } catch (error) {
      setStatus(
        error.code === 4001
          ? 'You rejected the MetaMask request.'
          : error.message || 'Verification failed.'
      );
    }
  };
  const enterRaffle = async () => {
    try {
      if (!verificationToken) {
        throw new Error('Verify your wallet first.');
      }

      setStatus('Entering raffle...');

      const response = await fetch(`${API}/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verificationToken}`,
        },
        body: JSON.stringify({
          raffleId: '6ada215f489747c2c2d06bc1',
          walletAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to enter raffle.');
      }

      setStatus('Successfully entered the raffle!');
    } catch (error) {
      setStatus(error.message || 'Raffle entry failed.');
    }
  };

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <h1>Ink Bubble Cats</h1>
      <h2>Wallet Signature Test</h2>

      <p>Status: {status}</p>

      {walletAddress && (
        <p>
          <strong>Wallet:</strong> {walletAddress}
        </p>
      )}

      <button onClick={connectWallet}>1. Connect MetaMask</button>

      <button
        onClick={verifyWallet}
        disabled={!walletAddress}
        style={{ marginLeft: 8 }}
      >
        2. Sign & Verify
      </button>

      {verificationToken && (
        <p>
          <strong>JWT received!</strong> Your wallet signature was verified. The
          token expires in 10 minutes.
        </p>
      )}
      {verificationToken && (
        <button onClick={enterRaffle}>3. Enter Raffle</button>
      )}
    </main>
  );
}
