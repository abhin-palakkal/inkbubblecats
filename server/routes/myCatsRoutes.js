const express = require('express');
const router = express.Router();

router.get('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const { cursor } = req.query;

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address',
      });
    }

    const params = new URLSearchParams({
      collection: 'ink-bubble-cats-nft',
      limit: '50',
    });

    if (cursor) {
      params.set('next', cursor);
    }

    const response = await fetch(
      `https://api.opensea.io/api/v2/chain/ink/account/${wallet}/nfts?${params}`,
      {
        headers: {
          'x-api-key': process.env.OPENSEA_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.errors || 'OpenSea API request failed',
      });
    }

    const cats = (data.nfts || []).map(nft => ({
      tokenId: nft.identifier,
      name: nft.name,
      image: nft.display_image_url || nft.image_url,
      openseaUrl: nft.opensea_url,
    }));

    res.json({
      success: true,
      count: cats.length,
      cats,
      next: data.next || null,
    });
  } catch (error) {
    console.error('My Cats error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your Bubble Cats',
    });
  }
});

module.exports = router;
