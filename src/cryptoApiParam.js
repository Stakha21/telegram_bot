const requestOptions = {
  method: "GET",
  uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  qs: {
    start: "1",
    limit: "40",
    convert: "USD",
  },
  headers: {
    "X-CMC_PRO_API_KEY": "b35525aa-f8b3-4545-bc52-088d22e49afd",
  },
  json: true,
  gzip: true,
};

module.exports = requestOptions;
