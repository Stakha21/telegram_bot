import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: String,
  cryptos: [String],
});

const userModel = mongoose.model("user", userSchema);

export { userModel };
