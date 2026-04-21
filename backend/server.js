require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Connect to database
connectDB();

// Initialize automated jobs
const { startCronJobs } = require('./src/utils/cronJobs');
startCronJobs();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Basic route for testing
app.get('/', (req, res) => {
  res.send('OpportunityHub API is running...');
});

const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

// App Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/registrations', require('./src/routes/registrationRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));

// Error Middleware (should be after all defined routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
