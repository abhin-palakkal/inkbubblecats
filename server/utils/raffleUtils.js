const calculateRaffleTickets = nftCount => {
  if (nftCount >= 50) return 10;
  if (nftCount >= 20) return 7;
  if (nftCount >= 10) return 5;
  if (nftCount >= 5) return 3;
  if (nftCount >= 3) return 2;
  if (nftCount >= 1) return 1;

  return 0;
};

module.exports = { calculateRaffleTickets };
