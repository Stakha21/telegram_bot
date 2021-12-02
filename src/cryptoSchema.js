import mongoose from "mongoose";

const cryptoSchema = new mongoose.Schema({
  name: String,
  date: Date,
  amountInUse: Number,
  maxAmount: Number,
  price: Number,
  followers: [String],
});

const cryptoModel = mongoose.model("crypto", cryptoSchema);

export { cryptoModel };
