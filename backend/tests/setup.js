const mongoose = require('mongoose');

// Connect to a test database or mock
beforeAll(async () => {
    // For now we just suppress console logs to keep test output clean
    // In a real scenario we would connect to a test DB here
    // process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db'; 
});

afterAll(async () => {
  await mongoose.disconnect();
});
