import dotenv from "dotenv";
import mongoose from "mongoose";
import fetch from "node-fetch";
import { requestOptions } from "./src/cryptoApiParam.js";
import { cryptoModel } from "./src/cryptoSchema.js";
import { Telegraf } from "telegraf";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM);
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function app() {
  bot.start((ctx) => {
    ctx.reply(
      `Hello, ${
        ctx.from.first_name || "my friend"
      }! Type /help to see what I can!`
    );
  });

  bot.help((ctx) =>
    ctx.reply(
      "I'm a crypto bot!! I can provide you with crypto information! I support such commands: /listRecent, /listFavorite"
    )
  );
  bot.command("listRecent", async (ctx) => {
    const { data } = await fetch(
      process.env.COIN_MARKET_URL,
      requestOptions
    ).then((res) => res.json());

    const cryptoArr = data.slice(0, 20);

    const resStr = [];

    cryptoArr.forEach(async (crypto) => {
      const cryptoObj = new cryptoModel({
        name: crypto.name,
        date: crypto.date_added,
        amountInUse: crypto.circulating_supply,
        maxAmount: crypto.max_supply,
        price: +crypto.quote.USD.price.toFixed(2),
      });

      cryptoModel.exists({ name: cryptoObj.name }).then((res) => {
        if (!res) cryptoObj.save();
      });

      resStr.push(`/${transformName(cryptoObj.name)} ${cryptoObj.price}$`);
    });
    ctx.reply(`${resStr.join("\n")}`);
  });

  const dbArr = await cryptoModel.find();
  const curNameArr = dbArr.map((cur) => cur.name);

  curNameArr.forEach((name) => {
    const queryName = transformName(name);

    bot.command(`${queryName}`, (ctx) => {
      displayCryptoInfo(ctx, name);
    });

    bot.command(`addToFavorite_${queryName}`, async (ctx) => {
      const [{ followers }] = await cryptoModel.find({ name });

      if (!followers.includes(ctx.from.username)) {
        followers.push(ctx.from.username);
        await cryptoModel.findOneAndUpdate(
          { name },
          { followers: [...followers] }
        );
        ctx.reply(`${name} added to favorite!`);
      } else ctx.reply(`${name} is already in favorite.`);
    });

    bot.command(`deleteFavorite_${queryName}`, async (ctx) => {
      const [{ followers }] = await cryptoModel.find({ name });

      if (followers.includes(ctx.from.username)) {
        followers.splice(followers.indexOf(ctx.from.username), 1);
        await cryptoModel.findOneAndUpdate(
          { name },
          { followers: [...followers] }
        );
        ctx.reply(`${name} deleted from favorite!`);
      } else ctx.reply(`${name} is not in favorite.`);
    });

    bot.action(`${name}`, async (ctx) => {
      ctx.deleteMessage();
      const [currentObj] = await cryptoModel.find({ name });
      followCurrency(ctx.from.username, currentObj);
      ctx.reply(`${name} is processed!`);
    });
  });

  bot.command("listFavorite", async (ctx) => {
    const allCryptos = await cryptoModel.find();
    const followingCryptos = allCryptos.filter((cur) =>
      cur.followers.includes(ctx.from.username)
    );

    const resStr = followingCryptos.map((cur) => `/${transformName(cur.name)}`);
    if (resStr.length === 0) ctx.reply("No currency in favorite!");
    else {
      ctx.reply(`${resStr.join("\n")}`);
    }
  });
}

async function displayCryptoInfo(ctx, name) {
  const [currentObj] = await cryptoModel.find({ name });
  const year = new Date(currentObj.date);
  ctx.reply(
    `This cryptocurrency was invented in ${year.getFullYear()}. Total amount in the world is ${
      currentObj.maxAmount ? currentObj.maxAmount : "unlimited"
    }. Amount in use ${currentObj.amountInUse}.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: currentObj.followers.includes(ctx.from.username)
                ? "Remove from favorite"
                : "Add to favorite",
              callback_data: currentObj.name,
            },
          ],
        ],
      },
    }
  );
}

async function followCurrency(userName, obj) {
  let { followers } = obj;

  if (followers.includes(userName))
    followers.splice(followers.indexOf(userName), 1);
  else followers.push(userName);

  await cryptoModel.findOneAndUpdate(
    { name: obj.name },
    { followers: [...followers] }
  );
}

function transformName(name) {
  return name.includes(" ") ? name.replaceAll(" ", "_") : name;
}

app();

bot.launch();
