const { getNftBalance } = require('./utils/nftUtils');

const testWallet = '0x8Ef9cEcB482e7574F376d97f5F9B30ED518eAFA3';

const test = async () => {
  try {
    const balance = await getNftBalance(testWallet);

    console.log('Wallet:', testWallet);
    console.log('Ink Bubble Cats owned:', balance);
  } catch (error) {
    console.error('NFT balance test failed:', error.message);
  }
};

test();
