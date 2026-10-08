const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/reviewapp";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";

const Review = mongoose.model("Review", new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/reviews", async (req, res) => {
  res.json(await Review.find().sort({ createdAt: -1 }));
});

app.post("/api/reviews", async (req, res) => {
  try {
    res.status(201).json(await Review.create(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// AI chatbot: answers using the reviews stored in MongoDB
app.post("/api/chat", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(20);
    const context = reviews.length
      ? reviews.map(r => `${r.title} (${r.rating}/5): ${r.text}`).join("\n")
      : "No reviews yet.";
    const r = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: "system", content: "You are a friendly movie assistant. Recommend movies using these user reviews when relevant:\n" + context },
          { role: "user", content: req.body.message }
        ]
      })
    });
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    res.json({ reply: data.message.content });
  } catch (e) {
    res.status(502).json({ reply: "AI is not ready yet. Make sure the model is pulled (see README). " + e.message });
  }
});

async function start() {
  for (let i = 1; i <= 20; i++) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB connected");
      break;
    } catch (e) {
      console.log(`Waiting for MongoDB (${i}/20)...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  app.listen(PORT, () => console.log(`Review app on port ${PORT}`));
}
start();
