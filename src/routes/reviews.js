const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");

const router = express.Router();

// GET /api/reviews - list all reviews, newest first
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews - create a new review
router.post("/", async (req, res, next) => {
  try {
    // Only accept the fields we expect (avoid saving unexpected data)
    const { title, rating, text } = req.body || {};
    const review = await Review.create({ title, rating, text });
    res.status(201).json(review);
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ error: message });
    }
    next(err);
  }
});

// DELETE /api/reviews/:id - delete a review by id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid review id" });
    }
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
