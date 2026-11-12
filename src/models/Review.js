const mongoose = require("mongoose");

/**
 * A single movie review written by a user.
 */
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      maxlength: [100, "Title must be at most 100 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    text: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Review must be at most 1000 characters"],
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Review", reviewSchema);
