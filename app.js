const express = require('express');
const redis = require('redis');
const { PubSub } = require('@google-cloud/pubsub');
const app = express();

// Redis client setup
const redisClient = redis.createClient({ host: '10.75.121.11', port: 6379 }); // or connect to Redis Cloud

// Google Cloud Pub/Sub setup
const pubsub = new PubSub();
const topicName = 'rate-limit-topic'; // Set the topic name

app.use(express.static('public')); // Serving the static HTML

// Set up Rate Limit variables
const RATE_LIMIT = 10; // 10 clicks per minute
const WINDOW_SIZE_IN_MINUTES = 1;

// Function to log to database (in this case, simulate logging)
function logClick(button, ip) {
  console.log(`Button: ${button}, IP: ${ip}, Timestamp: ${new Date()}`);
}

// Rate limiting middleware
async function rateLimit(button, ip) {
  const key = `${button}:${ip}`;
  const currentTime = Math.floor(Date.now() / 1000);
  const timeWindowStart = currentTime - (60 * WINDOW_SIZE_IN_MINUTES); // 1 minute window

  const clickCount = await redisClient.lrangeAsync(key, 0, -1);
  const recentClicks = clickCount.filter(timestamp => timestamp >= timeWindowStart);

  if (recentClicks.length >= RATE_LIMIT) {
    return true; // Limit exceeded
  }

  // Log the click
  redisClient.lpushAsync(key, currentTime); // Add the current timestamp to the list
  redisClient.ltrimAsync(key, 0, RATE_LIMIT - 1); // Keep only the most recent clicks

  return false; // Not exceeded
}

// Button Click Route
app.post('/button/:color', async (req, res) => {
  const buttonColor = req.params.color;
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const limitExceeded = await rateLimit(buttonColor, userIp);

  if (limitExceeded) {
    // Publish to Google Pub/Sub when rate limit is reached
    const message = JSON.stringify({ buttonColor, timestamp: new Date(), userIp });
    await pubsub.topic(topicName).publish(Buffer.from(message));
    return res.status(429).send(`Rate limit exceeded for ${buttonColor} button!`);
  }

  // Log the click to a database (simulated)
  logClick(buttonColor, userIp);
  res.send(`You clicked the ${buttonColor} button!`);
});

// Start server
const port = 8080;
app.listen(port, () => {
  console.log(`Express app running on http://localhost:${port}`);
});
