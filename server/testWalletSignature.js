const { ethers } = require('ethers');
const { verifyWalletSignature } = require('./utils/walletSignatureUtils');

async function testWalletSignature() {
  // Generate a temporary test wallet
  const wallet = ethers.Wallet.createRandom();

  const message = [
    'Ink Bubble Cats - Wallet Verification',
    '',
    `Wallet: ${wallet.address.toLowerCase()}`,
    'Nonce: test-nonce-123',
    'Purpose: Verify wallet ownership for raffle entry.',
    'This signature does not authorize a transaction.',
  ].join('\n');

  // Sign the message with the test wallet
  const signature = await wallet.signMessage(message);

  // Verify the signature against the correct address
  const valid = verifyWalletSignature(message, signature, wallet.address);

  console.log('Test wallet:', wallet.address);
  console.log('Signature generated:', Boolean(signature));
  console.log('Signature valid:', valid);

  // Confirm a different wallet address is rejected
  const wrongAddress = ethers.Wallet.createRandom().address;

  console.log(
    'Wrong address rejected:',
    !verifyWalletSignature(message, signature, wrongAddress)
  );
}

testWalletSignature().catch(console.error);
