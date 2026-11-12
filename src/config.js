/**
 * Application configuration.
 * All values can be overridden with environment variables (see .env.example).
 */
module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/reviewapp",
  ollamaHost: process.env.OLLAMA_HOST || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2:1b",

  // How many recent reviews are given to the AI as context
  chatContextLimit: 20,

  // MongoDB connection retry settings (the db container may start slowly)
  dbMaxRetries: 20,
  dbRetryDelayMs: 2000,
};
