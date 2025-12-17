const rateLimit = require("express-rate-limit");

// Limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests, please try again later.",
  },
});

// Limit each IP to 7 LLM requests per 15 minutes
const llmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 7, // limit each IP to 7 requests per windowMs
  message: {
    error: "Too many requests, please try again later.",
  },
});

module.exports = {
  limiter,
  llmLimiter,
};
