const express = require("express");
const Review = require("../models/Review");
const config = require("../config");

const router = express.Router();

/**
 * Builds a short text summary of recent reviews so the AI model
 * can base its recommendations on what users have written.
 */
async function buildReviewContext() {
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(config.chatContextLimit);

  if (reviews.length === 0) return "No reviews yet.";
  return reviews.map((r) => `- ${r.title} (${r.rating}/5): ${r.text}`).join("\n");
}

// POST /api/chat - ask the AI movie assistant a question
router.post("/", async (req, res) => {
  const message = (req.body && req.body.message ? String(req.body.message) : "").trim();
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const context = await buildReviewContext();

    const response = await fetch(`${config.ollamaHost}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ollamaModel,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are a friendly movie assistant. Keep answers short. " +
              "Recommend movies using these user reviews when relevant:\n" +
              context,
          },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    res.json({ reply: data.message ? data.message.content : "(no reply)" });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(502).json({
      error:
        "The AI assistant is not available. Make sure Ollama is running " +
        `and the model "${config.ollamaModel}" has been pulled (see README).`,
    });
  }
});

module.exports = router;
