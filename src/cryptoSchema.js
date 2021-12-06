import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: String,
  cryptos: [String],
});

const userModel = mongoose.model("user", userSchema);

export { userModel };

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

// price: 47621.93509482286,
// volume_24h: 320855523.3475463,
// volume_change_24h: -16.0428,
// percent_change_1h: 0.00177856,
// percent_change_24h: -2.82409193,
// percent_change_7d: -15.51152628,
// percent_change_30d: -21.46368851,
// percent_change_60d: -12.28717763,
// percent_change_90d: -6.88479106,
// market_cap: 12228824047.979734,
// market_cap_dominance: 0.5603,
// fully_diluted_market_cap: 12228824047.98,
// last_updated: '2021-12-06T11:38:08.000Z'
