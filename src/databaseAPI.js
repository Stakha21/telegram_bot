import { userModel } from "./cryptoSchema.js";

class DatabaseAPI {
  createUser(userName) {
    const user = new userModel({
      userName,
      cryptos: [],
    });
    userModel.exists({ userName }).then((res) => res || user.save());
  }

  getUser(userName) {
    return userModel.findOne({
      userName,
    });
  }

  updateUserData(userName, cryptos) {
    return userModel.findOneAndUpdate({ userName }, { cryptos });
  }
}

export { DatabaseAPI };
