const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module

dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve static files
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const DB = 'mongodb+srv://abdusshahid11399:3QppeRMJJ15VCkwE@cluster0.w3xas7k.mongodb.net/mydatabase2?retryWrites=true&w=majority&appName=Cluster0';
if (!DB) {
  console.error('MONGODB_URI environment variable is missing');
  process.exit(1);
}

mongoose.connect(DB, {
  serverSelectionTimeoutMS: 5000 // 5 seconds
})
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const basicSchema = new mongoose.Schema({
  logo: { type: String },
  navbar: [{ type: String }],
  count_title1: { type: String },
  count_value1: { type: String },
  count_title2: { type: String },
  count_value2: { type: String },
  count_title3: { type: String },
  count_value3: { type: String },
  count_title4: { type: String },
  count_value4: { type: String },
  headline: { type: String },
  desc: { type: String },
  heroImage: { type: String }
});
const Basic = mongoose.model('Basic', basicSchema);

// Register endpoint with validation
app.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).send('Error registering user');
  }
});

// Endpoint to get all registered users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).send('Error fetching users');
  }
});

// Login endpoint with validation
app.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).send('Error logging in');
  }
});

// Get all Basic documents
app.get('/basic', async (req, res) => {
  try {
    const basics = await Basic.find();
    res.json(basics);
  } catch (error) {
    console.error('Error fetching basic data:', error.message);
    res.status(500).send('Error fetching basic data');
  }
});

// Get a single Basic document by ID
app.get('/basic/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const basic = await Basic.findById(id);
    if (!basic) return res.status(404).send('Basic data not found');
    res.json(basic);
  } catch (error) {
    console.error('Error fetching basic data:', error.message);
    res.status(500).send('Error fetching basic data');
  }
});

// Update a Basic document by ID
app.put('/basic/:id', upload.fields([{ name: 'logo' }, { name: 'heroImage' }]), async (req, res) => {
  const { id } = req.params;
  const { navbar, count_title1, count_value1, count_title2, count_value2, count_title3, count_value3, count_title4, count_value4, headline, desc } = req.body;
  const logo = req.files['logo'] ? req.files['logo'][0].path : null;
  const heroImage = req.files['heroImage'] ? req.files['heroImage'][0].path : null;

  try {
    const updatedBasic = await Basic.findByIdAndUpdate(id, {
      logo,
      navbar: JSON.parse(navbar),
      count_title1,
      count_value1,
      count_title2,
      count_value2,
      count_title3,
      count_value3,
      count_title4,
      count_value4,
      headline,
      desc,
      heroImage
    }, { new: true });

    if (!updatedBasic) return res.status(404).send('Basic data not found');
    res.json(updatedBasic);
  } catch (error) {
    console.error('Error updating basic data:', error.message);
    res.status(500).send('Error updating basic data');
  }
});

// Delete a Basic document by ID
app.delete('/basic/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const basic = await Basic.findByIdAndDelete(id);
    if (!basic) return res.status(404).send('Basic data not found');
    res.send('Basic data deleted successfully');
  } catch (error) {
    console.error('Error deleting basic data:', error.message);
    res.status(500).send('Error deleting basic data');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
