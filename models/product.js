const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ""],
    trim: true,
    maxlength: [120, "Prodcut name should not be more than 120 characters."],
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    trim: true,
    maxlength: [5, "Prodcut price should not be more than 5 digits"],
  },
  descriptio: {
    type: String,
    require: [true, "Please provide description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please select category from short-sleeves,long-sleeves,sweat-shirts,hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
      message:
        "Please select category only from short-sleeves,long-sleeves,sweat-shirts,hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "Please add brand for clothing"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
