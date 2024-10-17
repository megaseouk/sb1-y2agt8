import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fillSpotifyForm } from './spotifyAutomation.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// TODO: Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/spotify_lead_gen';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// User model
const User = mongoose.model('User', {
  email: String,
  password: String,
  profile: {
    name: String,
    email: String,
    address: String,
    phoneNumber: String
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/submit-profile', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const profile = req.body;
    await User.findByIdAndUpdate(userId, { profile });
    
    // Automate Spotify lead generation form submission
    const result = await fillSpotifyForm(profile);
    
    res.json({ message: 'Profile submitted and form filled successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting profile' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});