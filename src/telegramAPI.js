import axios from "axios";

class TelegramAPI {
  sendAnswer(text, chat_id, res) {
    axios
      .post(`${process.env.TELEGRAM_URL}/sendMessage`, {
        chat_id,
        text,
      })
      .then((response) => res.status(200).send(response))
      .catch((err) => res.send(err));
  }

  sendCurrencyData(text, chat_id, res, userObj, symbol) {
    axios
      .post(`${process.env.TELEGRAM_URL}/sendMessage`, {
        chat_id,
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
  }

  processButton(text, chat_id, res, message_id) {
    axios
      .post(`${process.env.TELEGRAM_URL}/editMessageText`, {
        chat_id,
        text,
        message_id,
      })
      .then((response) => res.status(200).send(response))
      .catch((err) => res.send(err));
  }

  currencyString(curObj) {
    const quoteObj = curObj.quote.USD;
    const outArr = [];

    Object.keys(quoteObj).forEach((key) => {
      const value = quoteObj[key];
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
    });
    return `name: ${curObj.name}\n${outArr.join("\n")}`;
  }
}

export { TelegramAPI };
