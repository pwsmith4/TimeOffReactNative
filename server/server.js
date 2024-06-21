// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors);
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://gamepark1:pJrn7Yqkl54hwA77@cluster0.kvhmzcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});


// Schema
const RequestSchema = new mongoose.Schema({
  startDate: String,
  endDate: String,
  type: String,
  comment: String
});

// Model
const TimeOffRequest = mongoose.model('TimeOffRequest', RequestSchema);

// Middleware
app.use(bodyParser.json());


// Routes
app.post('/api/timeoff', (req, res) => {
    const { startDate, endDate, type, comment } = req.body;
    const newRequest = new TimeOffRequest({ startDate, endDate, type, comment });
  newRequest.save()
    .then(() => res.status(201).send('Request saved successfully'))
    .catch(err => res.status(400).send(err));
});


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});