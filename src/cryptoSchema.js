const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema({
  name: String,
  date: Date,
  amountInUse: Number,
  maxAmount: Number,
  following: {
    type: Boolean,
    default: false,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

const Crypto = mongoose.model("crypto", cryptoSchema);

module.exports = Crypto;

// {
//     id: 1,
//     name: 'Bitcoin',
//     symbol: 'BTC',
//     slug: 'bitcoin',
//     num_market_pairs: 8312,
//     date_added: '2013-04-28T00:00:00.000Z',
//     tags: [
//       'mineable',
//       'pow',
//       'sha-256',
//       'store-of-value',
//       'state-channel',
//       'coinbase-ventures-portfolio',
//       'three-arrows-capital-portfolio',
//       'polychain-capital-portfolio',
//       'binance-labs-portfolio',
//       'blockchain-capital-portfolio',
//       'boostvc-portfolio',
//       'cms-holdings-portfolio',
//       'dcg-portfolio',
//       'dragonfly-capital-portfolio',
//       'electric-capital-portfolio',
//       'fabric-ventures-portfolio',
//       'framework-ventures-portfolio',
//       'galaxy-digital-portfolio',
//       'huobi-capital-portfolio',
//       'alameda-research-portfolio',
//       'a16z-portfolio',
//       '1confirmation-portfolio',
//       'winklevoss-capital-portfolio',
//       'placeholder-ventures-portfolio',
//       'pantera-capital-portfolio',
//       'multicoin-capital-portfolio',
//       'paradigm-portfolio'
//     ],
//     max_supply: 21000000,
//     circulating_supply: 18888018,
//     total_supply: 18888018,
//     platform: null,
//     cmc_rank: 1,
//     last_updated: '2021-12-01T12:11:07.000Z',
//     quote: { USD: [Object] }
//   }
