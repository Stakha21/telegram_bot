import dotenv from "dotenv";
import mongoose from "mongoose";
import fetch from "node-fetch";
import { requestOptions } from "./src/cryptoApiParam.js";
import { userModel } from "./src/cryptoSchema.js";
import { Telegraf } from "telegraf";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM);
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function app() {
  const { data } = await fetch(
    process.env.COIN_MARKET_URL,
    requestOptions
  ).then((res) => res.json());

  const cryptoArr = data.slice(0, 20).map((crypto) => ({
    name: crypto.name,
    symbol: crypto.symbol,
    amountInUse: crypto.circulating_supply,
    maxAmount: crypto.max_supply,
    quote: crypto.quote.USD,
  }));

  const curSymArr = cryptoArr.map((cur) => cur.symbol);
  const curNameArr = cryptoArr.map((cur) => cur.name);

  bot.start((ctx) => {
    const user = new userModel({
      userName: ctx.from.username,
      cryptos: [],
    });
    userModel
      .exists({ userName: user.userName })
      .then((res) => res || user.save());

    ctx.reply(
      `Hello, ${
        ctx.from.first_name || "my friend"
      }! Type /help to see what I can!`
    );
  });

  bot.help((ctx) =>
    ctx.reply(
      "I'm a crypto bot!! I can provide you with crypto information! I support such commands: /listRecent, /listFavorite, /addToFavorite {currency name}, /deleteFavorite {currency name}"
    )
  );

  bot.command("listRecent", async (ctx) => {
    const resStr = [];

    cryptoArr.forEach(async (crypto) =>
      resStr.push(`/${crypto.symbol} $${crypto.quote.price.toFixed(2)}`)
    );
    ctx.reply(`List of crypto currecies: 
${resStr.join("\n")}`);
  });

  curSymArr.forEach((symbol) => {
    bot.command(`${symbol}`, (ctx) => {
      displayCryptoInfo(
        ctx,
        cryptoArr.find((cur) => cur.symbol === symbol)
      );
    });

    bot.action(`${symbol}`, async (ctx) => {
      ctx.deleteMessage();
      const currentObj = cryptoArr.find((cur) => cur.symbol === symbol);
      followCurrency(ctx.from.username, currentObj.name);
      ctx.reply(`${currentObj.name} is processed!`);
    });
  });

  bot.command("listFavorite", async (ctx) => {
    const { cryptos } = await userModel.findOne({
      userName: ctx.from.username,
    });

    const followingCryptos = cryptoArr.filter((cur) =>
      cryptos.includes(cur.name)
    );

    const resStr = followingCryptos.map(
      (cur) => `/${cur.symbol} $${cur.quote.price.toFixed(2)}`
    );
    if (resStr.length === 0) ctx.reply("No currency in favorite!");
    else {
      ctx.reply(`Your favorite list:
${resStr.join("\n")}`);
    }
  });

  bot.on("message", (ctx) => {
    if (
      ctx.update.message.text === "/addToFavorite" ||
      ctx.update.message.text === "/deleteFavorite"
    )
      ctx.reply("You should enter currency name!");
    else if (
      !ctx.update.message.text.includes("/addToFavorite") &&
      !ctx.update.message.text.includes("/deleteFavorite")
    )
      ctx.reply("I didn’t understand you, could you repeat, please?");
    else
      curNameArr.forEach(async (cur) => {
        if (ctx.update.message.text === `/addToFavorite ${cur}`) {
          const { cryptos } = await userModel.findOne({
            userName: ctx.from.username,
          });

          if (!cryptos.includes(cur)) {
            cryptos.push(cur);
            await userModel.findOneAndUpdate(
              { userName: ctx.from.username },
              { cryptos }
            );
            ctx.reply(`${cur} added to favorite!`);
          } else ctx.reply(`${cur} is already in favorite.`);
        } else if (ctx.update.message.text === `/deleteFavorite ${cur}`) {
          const { cryptos } = await userModel.findOne({
            userName: ctx.from.username,
          });

          if (cryptos.includes(cur)) {
            cryptos.splice(cryptos.indexOf(cur), 1);
            await userModel.findOneAndUpdate(
              { userName: ctx.from.username },
              { cryptos }
            );
            ctx.reply(`${cur} deleted from favorite!`);
          } else ctx.reply(`${cur} is not in favorite.`);
        }
      });
  });
}

async function displayCryptoInfo(ctx, curObj) {
  const userObj = await userModel.findOne({ userName: ctx.from.username });
  ctx.reply(`name: ${curObj.name}\n${currencyString(curObj.quote)}`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: userObj.cryptos.includes(curObj.name)
              ? "Remove from favorite"
              : "Add to favorite",
            callback_data: curObj.symbol,
          },
        ],
      ],
    },
  });
}

function currencyString(quoteObj) {
  const outArr = [];
  for (const [key, value] of Object.entries(quoteObj)) {
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
  return outArr.join("\n");
}

async function followCurrency(userName, cryptoName) {
  let { cryptos } = await userModel.findOne({ userName });

  if (cryptos.includes(cryptoName))
    cryptos.splice(cryptos.indexOf(cryptoName), 1);
  else cryptos.push(cryptoName);

  await userModel.findOneAndUpdate({ userName }, { cryptos });
}

app();

bot.launch();
