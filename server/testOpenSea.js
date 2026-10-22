require('dotenv').config();

async function testOpenSea() {
  try {
    const wallet = '0x6AD04152E681C78ff4Da8A9f120B3523672e58dE';

    const response = await fetch(
      `https://api.opensea.io/api/v2/chain/ink/account/${wallet}/nfts`,
      {
        headers: {
          'x-api-key': process.env.OPENSEA_API_KEY,
        },
      }
    );

    const data = await response.json();

    console.log('Status:', response.status);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('OpenSea test failed:', error.message);
  }
}

testOpenSea();
