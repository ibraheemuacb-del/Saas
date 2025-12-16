import express from 'express';
import router from './router/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Wire the router under /api
app.use('/api', router);

// Health check route (optional, useful for testing)
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'OK', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
