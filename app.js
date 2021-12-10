import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import { userModel } from "./src/cryptoSchema.js";
import express from "express";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL);
const telegram_url = `https://api.telegram.org/bot${process.env.TELEGRAM}/`;
const app = express();
app.use(express.json());

function main() {
  let symbolArr, deleteCryptoArr, addCryptoArr;

  app.post("/", async (req, res) => {
    const chatId =
      req.body.message?.chat.id || req.body.callback_query.message.chat.id;
    const sendMessage = req.body.message?.text;
    const userName = req.body.message?.from.username;

    if (sendMessage === "/start") {
      const user = new userModel({
        userName,
        cryptos: [],
      });

      userModel.exists({ userName }).then((res) => res || user.save());

      const text = `Hello, ${
        req.body.message.from.first_name || "my friend"
      }! Type /help to see what I can!`;

      sendAnswer(text, chatId, res);
    } else if (sendMessage === "/help") {
      const text =
        "I'm a crypto bot!! I can provide you with crypto information! I support such commands:\n/listRecent\n/listFavorite\n/addToFavorite {currency name}\n/deleteFavorite {currency name}";
      sendAnswer(text, chatId, res);
    } else if (sendMessage === "/listRecent") {
      const data = await axios
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

      symbolArr = data.map((crypto) => `/${crypto.symbol}`);
      deleteCryptoArr = data.map(
        (crypto) => `/deleteFavorite ${crypto.symbol}`
      );
      addCryptoArr = data.map((crypto) => `/addToFavorite ${crypto.symbol}`);
      const text = data
        .map(
          (crypto) => `/${crypto.symbol} $${crypto.quote.USD.price.toFixed(2)}`
        )
        .join("\n");
      sendAnswer(text, chatId, res);
    } else if (symbolArr.includes(sendMessage)) {
      const userObj = await userModel.findOne({
        userName,
      });
      const symbol = sendMessage.slice(1);
      const cryptoData = await axios
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

      const text = currencyString(cryptoData[symbol]);
      axios
        .post(`${telegram_url}sendMessage`, {
          chat_id: chatId,
          text,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: userObj.cryptos.includes(symbol)
                    ? "Remove from favorite"
                    : "Add to favorite",
                  callback_data: symbol,
                },
              ],
            ],
          },
        })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.send(err));
    } else if (req.body.callback_query) {
      const userName = req.body.callback_query.from.username;
      const cryptoSymbol = req.body.callback_query.data;
      const text = `${cryptoSymbol} is processed!`;
      const { cryptos } = await userModel.findOne({
        userName,
      });

      cryptos.includes(cryptoSymbol)
        ? cryptos.splice(cryptos.indexOf(cryptoSymbol), 1)
        : cryptos.push(cryptoSymbol);

      await userModel.findOneAndUpdate({ userName }, { cryptos });
      axios
        .post(`${telegram_url}editMessageText`, {
          chat_id: chatId,
          text,
          message_id: req.body.callback_query.message.message_id,
        })
        .then((response) => res.status(200).send(response))
        .catch((err) => res.send(err));
    } else if (deleteCryptoArr.includes(sendMessage)) {
      const cryptoSymbol = sendMessage.slice(sendMessage.indexOf(" ") + 1);
      const { cryptos } = await userModel.findOne({
        userName,
      });

      const text = cryptos.includes(cryptoSymbol)
        ? `${cryptoSymbol} deleted from favorite!`
        : `${cryptoSymbol} is not in favorite.`;

      cryptos.includes(cryptoSymbol) &&
        cryptos.splice(cryptos.indexOf(cryptoSymbol), 1);

      await userModel.findOneAndUpdate({ userName }, { cryptos });

      sendAnswer(text, chatId, res);
    } else if (addCryptoArr.includes(sendMessage)) {
      const cryptoSymbol = sendMessage.slice(sendMessage.indexOf(" ") + 1);
      const { cryptos } = await userModel.findOne({
        userName,
      });

      const text = !cryptos.includes(cryptoSymbol)
        ? `${cryptoSymbol} added to favorite!`
        : `${cryptoSymbol} is already in favorite.`;

      cryptos.includes(cryptoSymbol) || cryptos.push(cryptoSymbol);

      await userModel.findOneAndUpdate({ userName }, { cryptos });
      sendAnswer(text, chatId, res);
      return;
    } else if (
      sendMessage === "/deleteFavorite" ||
      sendMessage === "/addToFavorite"
    ) {
      const text = "You should enter currency name!";
      sendAnswer(text, chatId, res);
      return;
    } else if (
      sendMessage.startsWith("/deleteFavorite") ||
      sendMessage.startsWith("/addToFavorite")
    ) {
      const text = "Invalid currency name.";
      sendAnswer(text, chatId, res);
      return;
    } else if (sendMessage === "/listFavorite") {
      const { cryptos } = await userModel.findOne({
        userName,
      });

      const followingCryptos = await axios
        .get(process.env.COIN_MARKET_SINGLE, {
          params: {
            symbol: cryptos.toString(),
          },
          headers: {
            "X-CMC_PRO_API_KEY": process.env.COIN_KEY,
          },
        })
        .then((res) => res.data.data)
        .catch((err) => console.log(err));

      const responseArr = cryptos.map(
        (crypto) =>
          `/${followingCryptos[crypto].symbol} $${followingCryptos[
            crypto
          ].quote.USD.price.toFixed(2)}`
      );

      const text =
        responseArr.length === 0
          ? "No currency in favorite!"
          : `Your favorite list:\n${responseArr.join("\n")}`;
      sendAnswer(text, chatId, res);
    } else {
      const text = "I didn't understand you, could you repeat, please?";
      sendAnswer(text, chatId, res);
    }
  });
}

function sendAnswer(text, chat_id, res) {
  axios
    .post(`${telegram_url}sendMessage`, {
      chat_id,
      text,
    })
    .then((response) => res.status(200).send(response))
    .catch((err) => res.send(err));
}

function currencyString(curObj) {
  const outArr = [];
  for (const [key, value] of Object.entries(curObj.quote.USD)) {
    if (typeof value === "string") {
      const str = `${key.replaceAll("_", " ")}: ${new Intl.DateTimeFormat(
        "en-US",
        {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }
      ).format(new Date(value))}`;
      outArr.push(str);
    } else {
      const str = `${key.replaceAll("_", " ")}: ${
        value < 0 ? `-$${Math.abs(value.toFixed(2))}` : `$${value.toFixed(2)}`
      }`;
      outArr.push(str);
    }
  }
  return `name: ${curObj.name}\n${outArr.join("\n")}`;
}

main();

app.listen(80, () => {
  console.log("Server is running");
});
