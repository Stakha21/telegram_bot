import dotenv from "dotenv";

dotenv.config();

const requestOptions = {
  method: "GET",
  headers: {
    "X-CMC_PRO_API_KEY": process.env.COIN_KEY,
  },
};

export { requestOptions };
