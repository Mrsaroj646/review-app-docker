const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

const config = require("./config");
const reviewRoutes = require("./routes/reviews");
const chatRoutes = require("./routes/chat");

const app = express();

// ---------- Middleware ----------
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// ---------- Routes ----------
app.get("/api/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({ ok: dbConnected, database: dbConnected ? "up" : "down" });
});

app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);

// Unknown API routes
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler (catches errors passed with next(err))
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  res.status(500).json({ error: "Internal server error" });
});

// ---------- Startup ----------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectToDatabase() {
  for (let attempt = 1; attempt <= config.dbMaxRetries; attempt++) {
    try {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.log(`Waiting for MongoDB (${attempt}/${config.dbMaxRetries})...`);
      await sleep(config.dbRetryDelayMs);
    }
  }
  throw new Error("Could not connect to MongoDB");
}

async function start() {
  try {
    await connectToDatabase();
    app.listen(config.port, () => {
      console.log(`Movie Review App running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Docker's restart policy will try again
  }
}

start();
