const mongoose = require("mongoose");
const validator = require("validator");
const ObjectId = require("mongodb").ObjectID;

const userSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 150,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("user", userSchema);
