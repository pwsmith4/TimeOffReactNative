// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://gamepark1:pJrn7Yqkl54hwA77@cluster0.kvhmzcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});
mongoose.connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Schema
const RequestSchema = new mongoose.Schema({
  startDate: String,
  endDate: String,
  type: String,
  comment: String,
  status: { type: String, default: 'Pending' }
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timeOffRequests: [RequestSchema]
});

// User Model
const User = mongoose.model('User', UserSchema);

// Model
const TimeOffRequest = mongoose.model('TimeOffRequest', RequestSchema);

// Middleware
app.use(bodyParser.json());

app.get('/api/test', (req, res) => {
  res.status(200).send('Server is working');
});

// Routes
app.delete('/timeoff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TimeOffRequest.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: 'Time-off request deleted successfully' });
    } else {
      res.status(404).json({ message: 'Time-off request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time-off request', error });
  }
});

app.post('/api/timeoff', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { startDate, endDate, type, comment, username } = req.body;

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new time-off request
    const newRequest = {
      startDate,
      endDate,
      type,
      comment
    };

    // Add the new request to the user's timeOffRequests array
    user.timeOffRequests.push(newRequest);

    // Save the updated user document
    await user.save();

    console.log('Request saved successfully');
    res.status(201).json({ message: 'Time-off request saved successfully' });
  } catch (err) {
    console.error('Error saving request:', err);
    res.status(400).json({ error: err.message || 'An error occurred while saving the request' });
  }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ success: false, message: 'An error occurred during signup' });
  }
});

// Signin Route
app.post('/api/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    res.json({ success: true, message: 'Signed in successfully' });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ success: false, message: 'An error occurred during signin' });
  }
});
//Retrieve User's time off requests
app.post('/api/timeoff/users', async (req, res) => {
  try {
    const { username } = req.body;
    console.log('Received request for time-off with username:', username);

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ timeOffRequests: user.timeOffRequests });
  } catch (err) {
    console.error('Error fetching time-off requests:', err);
    res.status(500).json({ error: 'An error occurred while fetching time-off requests' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});