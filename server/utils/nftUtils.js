const { ethers } = require('ethers');

const RPC_URL = 'https://rpc-gel.inkonchain.com';

const NFT_CONTRACT_ADDRESS = '0xd5e11440ca64a53dc7efb369a1dcceff0c95dfcd';

const provider = new ethers.JsonRpcProvider(RPC_URL);

const nftAbi = ['function balanceOf(address owner) view returns (uint256)'];

const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, provider);

const getNftBalance = async walletAddress => {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error('Invalid wallet address');
  }

  const balance = await nftContract.balanceOf(walletAddress);

  return Number(balance);
};

module.exports = { getNftBalance };
