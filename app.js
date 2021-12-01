const mongoose = require("mongoose");
const request = require("request");
const requestOptions = require("./src/cryptoApiParam");
const cryptoModel = require("./src/cryptoSchema");
const { Telegraf } = require("telegraf");

const bot = new Telegraf("2134286310:AAH8Xa4rRsuQEg5d70UVX0zG4mOnFP0h_To");
mongoose.connect(
  "mongodb+srv://pavel:sep12@cluster0.ky9ov.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function app() {
  bot.start((ctx) =>
    ctx.reply(
      `Hello, ${
        ctx.from.first_name ? ctx.from.first_name : "my friend"
      }! Type /help to see what I can!`
    )
  );

  bot.help((ctx) =>
    ctx.reply(
      "I'm a crypto bot!! I can provide you with crypto information! I support such commands: /listRecent, /listFollowing, /listFavorite"
    )
  );

  bot.command("listRecent", (ctx) => {
    request(requestOptions, (err, { body }) => {
      const cryptoArr = body.data;

      cryptoArr.forEach((crypto) => {
        const cryptoObj = new cryptoModel({
          name: crypto.name,
          date: crypto.date_added,
          amountInUse: crypto.circulating_supply,
          maxAmount: crypto.max_supply,
        });

        cryptoModel.exists({ name: cryptoObj.name }).then((res) => {
          if (res === false) cryptoObj.save();
        });

        ctx.reply(`/BTC_${transformName(cryptoObj.name)}`);
      });
    });
  });

  const dbArr = await cryptoModel.find();
  const curNameArr = dbArr.map((cur) => cur.name);

  curNameArr.forEach((name) => {
    const queryName = transformName(name);

    bot.command(`BTC_${queryName}`, (ctx) => {
      displayCryptoInfo(ctx, name);
    });

    bot.command(`${queryName}`, (ctx) => {
      displayCryptoInfo(ctx, name);
    });

    bot.command(`addToFavorite_${queryName}`, async (ctx) => {
      await cryptoModel.findOneAndUpdate({ name }, { favorite: true });
      ctx.reply(`${name} added to favorite!`);
    });

    bot.command(`deleteFavorite_${queryName}`, async (ctx) => {
      await cryptoModel.findOneAndUpdate({ name }, { favorite: false });
      ctx.reply(`${name} deleted from favorite!`);
    });

    bot.action(`${name}`, (ctx) => {
      ctx.deleteMessage();
      ctx.reply(`${name} is processed!`);
    });
  });

  bot.command("listFollowing", async (ctx) => {
    const followArr = await cryptoModel.find({ following: true });

    if (followArr.length === 0) ctx.reply("No currency following!");
    else {
      followArr.forEach((cur) => ctx.reply(`/BTC_${transformName(cur.name)}`));
    }
  });

  bot.command("listFavorite", async (ctx) => {
    const favoriteArr = await cryptoModel.find({ favorite: true });

    if (favoriteArr.length === 0) ctx.reply("No currency in favorite!");
    else {
      favoriteArr.forEach((cur) =>
        ctx.reply(`/BTC_${transformName(cur.name)}`)
      );
    }
  });

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
                text: currentObj.following
                  ? "Remove from following"
                  : "Add to following",
                callback_data: followCurrency(currentObj),
              },
            ],
          ],
        },
      }
    );
  }

  function followCurrency(obj) {
    obj.following = obj.following ? false : true;
    cryptoModel
      .findOneAndUpdate({ name: obj.name }, { following: obj.following })
      .then((res) => console.log(res));
    return obj.name;
  }

  function transformName(name) {
    return name.includes(" ") ? name.replaceAll(" ", "_") : name;
  }
}

app();

bot.launch();
