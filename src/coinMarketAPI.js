import axios from "axios";

class CoinAPI {
  getCryptoList() {
    return axios
      .get(process.env.COIN_MARKET_URL, {
        params: {
          limit: 20,
        },
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COIN_KEY,
        },
      })
      .then((res) => res.data.data)
      .catch((err) => console.log(err.message));
  }

  getCryptoBySymbol(symbol) {
    return axios
      .get(process.env.COIN_MARKET_SINGLE, {
        params: {
          symbol,
        },
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COIN_KEY,
        },
      })
      .then((res) => res.data.data)
      .catch((err) => console.log(err.message));
  }

  getFollowingCurrencies(symbol) {
    return axios
      .get(process.env.COIN_MARKET_SINGLE, {
        params: {
          symbol,
        },
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COIN_KEY,
        },
      })
      .then((res) => res.data.data)
      .catch((err) => console.log(err.message));
  }
}

export { CoinAPI };
