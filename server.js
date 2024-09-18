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


// Define Expert schema and model
const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  fb_link: { type: String },
  linkedin_link: { type: String },
  x_link: { type: String },
  other_link: { type: String },
  image: { type: String }  // Add this field for storing the image URL or path
});
const Expert = mongoose.model('Expert', expertSchema);


// Define RequestQuote schema and model
const requestQuoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  method: { type: String, required: true }
});
const RequestQuote = mongoose.model('RequestQuote', requestQuoteSchema);

// Define Feature schema and model
const featureSchema = new mongoose.Schema({
  subTitle: { type: String, required: true },
  title: { type: String, required: true },
  cardTitle1: { type: String, required: true },
  cardDesc1: { type: String, required: true },
  cardTitle2: { type: String, required: true },
  cardDesc2: { type: String, required: true },
  cardTitle3: { type: String, required: true },
  cardDesc3: { type: String, required: true },
  email: { type: String, required: true }
});

const Feature = mongoose.model('Feature', featureSchema);


// Define Consulting schema and model
const consultingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  cardTitle1: { type: String, required: true },
  cardDesc1: { type: String, required: true },
  cardTitle2: { type: String, required: true },
  cardDesc2: { type: String, required: true },
  cardTitle3: { type: String, required: true },
  cardDesc3: { type: String, required: true },
  sponsorImg: [{ type: String }] // Array of image paths or URLs
});
const Consulting = mongoose.model('Consulting', consultingSchema);


const faqHeaderSchema = new mongoose.Schema({
  FaqTitle: { type: String, required: true },
  FaqSubTitle: { type: String, required: true }
});
const FAQHeader = mongoose.model('FAQHeader', faqHeaderSchema);


// Define Testimonial schema and model
const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientDesignation: { type: String, required: true },
  message: { type: String, required: true }
});
const Testimonial = mongoose.model('Testimonial', testimonialSchema);


// Define TestimonialsHeader schema and model
const testimonialsHeaderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true }
});
const TestimonialsHeader = mongoose.model('TestimonialsHeader', testimonialsHeaderSchema);


// Define FAQ schema and model
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});
const FAQ = mongoose.model('FAQ', faqSchema);


const newsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String },
  discountDesc: { type: String },
  desc: { type: String },
  ButtonText: { type: String },
  Img: { type: String } // URL or path to the image
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);


// Define Footer schema and model
const footerSchema = new mongoose.Schema({
  InfoMsg: { type: String, required: true },
  email: { type: String, required: true },
  phoneNo: { type: String, required: true },
  Tag: { type: String },
  TagDesc: { type: String },
  ButtonText: { type: String }
});

const Footer = mongoose.model('Footer', footerSchema);

const aboutSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Add title field
  subtitle: { type: String }, // Add subtitle field (optional)
  description: { type: String, required: true },
  tags: [{ type: String }], // Array of strings for tags
  image: { type: String } // URL or path to the image
});

const About = mongoose.model('About', aboutSchema);



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


app.post('/basic', upload.fields([{ name: 'logo' }, { name: 'heroImage' }]), async (req, res) => {
  const { navbar, count_title1, count_value1, count_title2, count_value2, count_title3, count_value3, count_title4, count_value4, headline, desc } = req.body;
  const logo = req.files['logo'] ? req.files['logo'][0].path : null;
  const heroImage = req.files['heroImage'] ? req.files['heroImage'][0].path : null;

  try {
    const newBasic = new Basic({
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
    });

    const savedBasic = await newBasic.save();
    res.status(201).json(savedBasic); // Return the created document
  } catch (error) {
    console.error('Error creating basic data:', error.message);
    res.status(500).send('Error creating basic data');
  }
});



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

  try {
    const existingBasic = await Basic.findById(id);
    if (!existingBasic) return res.status(404).send('Basic data not found');

    // Handle logo and heroImage
    const logo = req.files['logo'] ? req.files['logo'][0].path : existingBasic.logo;
    const heroImage = req.files['heroImage'] ? req.files['heroImage'][0].path : existingBasic.heroImage;

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


// Request a quote endpoint with validation
app.post('/request-quote', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('method').notEmpty().withMessage('Method is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phoneNumber, method } = req.body;
  try {
    // Create a new requestQuote document
    const requestQuote = new RequestQuote({ name, email, phoneNumber, method });
    await requestQuote.save();
    res.status(201).send('Quote request submitted successfully');
  } catch (error) {
    console.error('Error requesting quote:', error);
    res.status(500).send('Error requesting quote');
  }
});

// Endpoint to get all quote requests
app.get('/quote-requests', async (req, res) => {
  try {
    // Find all quote requests
    const quoteRequests = await RequestQuote.find();
    res.json(quoteRequests);
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    res.status(500).send('Error fetching quote requests');
  }
});

// Create a new expert
app.post('/experts', upload.single('image'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, designation, phone, email, fb_link, linkedin_link, x_link, other_link } = req.body;
  const image = req.file ? req.file.path : null; // Get the image path from the request

  try {
    // Create a new expert document
    const expert = new Expert({ name, designation, phone, email, fb_link, linkedin_link, x_link, other_link, image });
    await expert.save();
    res.status(201).send('Expert added successfully');
  } catch (error) {
    console.error('Error adding expert:', error);
    res.status(500).send('Error adding expert');
  }
});

// Get all experts
app.get('/experts', async (req, res) => {
  try {
    // Find all experts
    const experts = await Expert.find();
    res.json(experts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).send('Error fetching experts');
  }
});

// Get a single expert by ID
app.get('/experts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Find expert by ID
    const expert = await Expert.findById(id);
    if (!expert) return res.status(404).send('Expert not found');
    res.json(expert);
  } catch (error) {
    console.error('Error fetching expert:', error);
    res.status(500).send('Error fetching expert');
  }
});

app.put('/experts/:id', upload.single('image'), async (req, res) => {
  const expertId = req.params.id;
  const { name, designation, phone, fb_link, x_link, linkedin_link } = req.body;
  const image = req.file ? req.file.path : undefined;

  try {
    // Update the expert record in the database
    const updatedExpert = await Expert.findByIdAndUpdate(expertId, {
      name,
      designation,
      phone,
      fb_link,
      x_link,
      linkedin_link,
      image
    }, { new: true });

    res.json(updatedExpert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update expert' });
  }
});
// Delete an expert by ID
app.delete('/experts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete expert
    const expert = await Expert.findByIdAndDelete(id);
    if (!expert) return res.status(404).send('Expert not found');
    res.send('Expert deleted successfully');
  } catch (error) {
    console.error('Error deleting expert:', error);
    res.status(500).send('Error deleting expert');
  }
});

// Create a new feature
app.post('/features', [
  body('subTitle').notEmpty().withMessage('SubTitle is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('cardTitle1').notEmpty().withMessage('Card Title 1 is required'),
  body('cardDesc1').notEmpty().withMessage('Card Description 1 is required'),
  body('cardTitle2').notEmpty().withMessage('Card Title 2 is required'),
  body('cardDesc2').notEmpty().withMessage('Card Description 2 is required'),
  body('cardTitle3').notEmpty().withMessage('Card Title 3 is required'),
  body('cardDesc3').notEmpty().withMessage('Card Description 3 is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { subTitle, title, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3, email } = req.body;

  try {
    // Create a new feature document
    const feature = new Feature({ subTitle, title, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3, email });
    await feature.save();
    res.status(201).send('Feature created successfully');
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).send('Error creating feature');
  }
});

// Get all features
app.get('/features', async (req, res) => {
  try {
    const features = await Feature.find();
    res.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).send('Error fetching features');
  }
});
// Update a feature by ID
app.put('/features/:id', [
  body('subTitle').notEmpty().withMessage('SubTitle is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('cardTitle1').notEmpty().withMessage('Card Title 1 is required'),
  body('cardDesc1').notEmpty().withMessage('Card Description 1 is required'),
  body('cardTitle2').notEmpty().withMessage('Card Title 2 is required'),
  body('cardDesc2').notEmpty().withMessage('Card Description 2 is required'),
  body('cardTitle3').notEmpty().withMessage('Card Title 3 is required'),
  body('cardDesc3').notEmpty().withMessage('Card Description 3 is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const { id } = req.params;
  const { subTitle, title, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3, email } = req.body;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedFeature = await Feature.findByIdAndUpdate(id, { subTitle, title, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3, email }, { new: true });
    if (!updatedFeature) return res.status(404).send('Feature not found');
    res.json(updatedFeature);
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).send('Error updating feature');
  }
});
// Delete a feature by ID
app.delete('/features/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const feature = await Feature.findByIdAndDelete(id);
    if (!feature) return res.status(404).send('Feature not found');
    res.send('Feature deleted successfully');
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).send('Error deleting feature');
  }
});


// Create a new Consulting document
app.post('/consulting', upload.array('sponsorImg'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('subTitle').notEmpty().withMessage('SubTitle is required'),
  body('cardTitle1').notEmpty().withMessage('Card Title 1 is required'),
  body('cardDesc1').notEmpty().withMessage('Card Description 1 is required'),
  body('cardTitle2').notEmpty().withMessage('Card Title 2 is required'),
  body('cardDesc2').notEmpty().withMessage('Card Description 2 is required'),
  body('cardTitle3').notEmpty().withMessage('Card Title 3 is required'),
  body('cardDesc3').notEmpty().withMessage('Card Description 3 is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, subTitle, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3 } = req.body;
  const sponsorImg = req.files ? req.files.map(file => file.path) : []; // Get the image paths from the request

  try {
    // Create a new Consulting document
    const consulting = new Consulting({ title, subTitle, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3, sponsorImg });
    await consulting.save();
    res.status(201).send('Consulting data created successfully');
  } catch (error) {
    console.error('Error creating consulting data:', error);
    res.status(500).send('Error creating consulting data');
  }
});

// Get all Consulting documents
app.get('/consulting', async (req, res) => {
  try {
    const consultings = await Consulting.find();
    res.json(consultings);
  } catch (error) {
    console.error('Error fetching consulting data:', error);
    res.status(500).send('Error fetching consulting data');
  }
});

// Get a single Consulting document by ID
app.get('/consulting/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const consulting = await Consulting.findById(id);
    if (!consulting) return res.status(404).send('Consulting data not found');
    res.json(consulting);
  } catch (error) {
    console.error('Error fetching consulting data:', error);
    res.status(500).send('Error fetching consulting data');
  }
});

// Update a Consulting document by ID
app.put('/consulting/:id', upload.array('sponsorImg'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('subTitle').notEmpty().withMessage('SubTitle is required'),
  body('cardTitle1').notEmpty().withMessage('Card Title 1 is required'),
  body('cardDesc1').notEmpty().withMessage('Card Description 1 is required'),
  body('cardTitle2').notEmpty().withMessage('Card Title 2 is required'),
  body('cardDesc2').notEmpty().withMessage('Card Description 2 is required'),
  body('cardTitle3').notEmpty().withMessage('Card Title 3 is required'),
  body('cardDesc3').notEmpty().withMessage('Card Description 3 is required')
], async (req, res) => {
  const { id } = req.params;
  const { title, subTitle, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3 } = req.body;
  const sponsorImg = req.files ? req.files.map(file => file.path) : []; // Get the image paths from the request

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedConsulting = await Consulting.findByIdAndUpdate(id, { title, subTitle, cardTitle1, cardDesc1, cardTitle2, cardDesc2, cardTitle3, cardDesc3, sponsorImg }, { new: true });
    if (!updatedConsulting) return res.status(404).send('Consulting data not found');
    res.json(updatedConsulting);
  } catch (error) {
    console.error('Error updating consulting data:', error);
    res.status(500).send('Error updating consulting data');
  }
});

// Delete a Consulting document by ID
app.delete('/consulting/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const consulting = await Consulting.findByIdAndDelete(id);
    if (!consulting) return res.status(404).send('Consulting data not found');
    res.send('Consulting data deleted successfully');
  } catch (error) {
    console.error('Error deleting consulting data:', error);
    res.status(500).send('Error deleting consulting data');
  }
});

// Create a new FAQ
app.post('/faqs', [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { question, answer } = req.body;
  try {
    // Create a new FAQ document
    const faq = new FAQ({ question, answer });
    await faq.save();
    res.status(201).send('FAQ created successfully');
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).send('Error creating FAQ');
  }
});

// Get all FAQs
app.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).send('Error fetching FAQs');
  }
});

// Get a single FAQ by ID
app.get('/faqs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).send('FAQ not found');
    res.json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).send('Error fetching FAQ');
  }
});

// Update an FAQ by ID
app.put('/faqs/:id', [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const faq = await FAQ.findByIdAndUpdate(id, { question, answer }, { new: true });
    if (!faq) return res.status(404).send('FAQ not found');
    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).send('Error updating FAQ');
  }
});

// Delete an FAQ by ID
app.delete('/faqs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) return res.status(404).send('FAQ not found');
    res.send('FAQ deleted successfully');
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).send('Error deleting FAQ');
  }
});


// Create a new FAQ Header
app.post('/faq-headers', [
  body('FaqTitle').notEmpty().withMessage('FAQ Title is required'),
  body('FaqSubTitle').notEmpty().withMessage('FAQ Subtitle is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { FaqTitle, FaqSubTitle } = req.body;
  try {
    // Create a new FAQ Header document
    const faqHeader = new FAQHeader({ FaqTitle, FaqSubTitle });
    await faqHeader.save();
    res.status(201).send('FAQ Header created successfully');
  } catch (error) {
    console.error('Error creating FAQ Header:', error);
    res.status(500).send('Error creating FAQ Header');
  }
});

// Get all FAQ Headers
app.get('/faq-headers', async (req, res) => {
  try {
    const faqHeaders = await FAQHeader.find();
    res.json(faqHeaders);
  } catch (error) {
    console.error('Error fetching FAQ Headers:', error);
    res.status(500).send('Error fetching FAQ Headers');
  }
});

// Get a single FAQ Header by ID
app.get('/faq-headers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const faqHeader = await FAQHeader.findById(id);
    if (!faqHeader) return res.status(404).send('FAQ Header not found');
    res.json(faqHeader);
  } catch (error) {
    console.error('Error fetching FAQ Header:', error);
    res.status(500).send('Error fetching FAQ Header');
  }
});

// Update an FAQ Header by ID
app.put('/faq-headers/:id', [
  body('FaqTitle').notEmpty().withMessage('FAQ Title is required'),
  body('FaqSubTitle').notEmpty().withMessage('FAQ Subtitle is required')
], async (req, res) => {
  const { id } = req.params;
  const { FaqTitle, FaqSubTitle } = req.body;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedFAQHeader = await FAQHeader.findByIdAndUpdate(id, { FaqTitle, FaqSubTitle }, { new: true });
    if (!updatedFAQHeader) return res.status(404).send('FAQ Header not found');
    res.json(updatedFAQHeader);
  } catch (error) {
    console.error('Error updating FAQ Header:', error);
    res.status(500).send('Error updating FAQ Header');
  }
});

// Delete an FAQ Header by ID
app.delete('/faq-headers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const faqHeader = await FAQHeader.findByIdAndDelete(id);
    if (!faqHeader) return res.status(404).send('FAQ Header not found');
    res.send('FAQ Header deleted successfully');
  } catch (error) {
    console.error('Error deleting FAQ Header:', error);
    res.status(500).send('Error deleting FAQ Header');
  }
});

// Create a new Testimonial
app.post('/testimonials', [
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('clientDesignation').notEmpty().withMessage('Client designation is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { clientName, clientDesignation, message } = req.body;
  try {
    // Create a new Testimonial document
    const testimonial = new Testimonial({ clientName, clientDesignation, message });
    await testimonial.save();
    res.status(201).send('Testimonial created successfully');
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).send('Error creating testimonial');
  }
});

// Get all Testimonials
app.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).send('Error fetching testimonials');
  }
});

// Get a single Testimonial by ID
app.get('/testimonials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return res.status(404).send('Testimonial not found');
    res.json(testimonial);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).send('Error fetching testimonial');
  }
});

// Update a Testimonial by ID
app.put('/testimonials/:id', [
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('clientDesignation').notEmpty().withMessage('Client designation is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  const { id } = req.params;
  const { clientName, clientDesignation, message } = req.body;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, { clientName, clientDesignation, message }, { new: true });
    if (!updatedTestimonial) return res.status(404).send('Testimonial not found');
    res.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).send('Error updating testimonial');
  }
});

// Delete a Testimonial by ID
app.delete('/testimonials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) return res.status(404).send('Testimonial not found');
    res.send('Testimonial deleted successfully');
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).send('Error deleting testimonial');
  }
});


// Create a new TestimonialsHeader
app.post('/testimonials-header', [
  body('title').notEmpty().withMessage('Title is required'),
  body('subTitle').notEmpty().withMessage('Subtitle is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, subTitle } = req.body;
  try {
    // Create a new TestimonialsHeader document
    const testimonialsHeader = new TestimonialsHeader({ title, subTitle });
    await testimonialsHeader.save();
    res.status(201).send('TestimonialsHeader created successfully');
  } catch (error) {
    console.error('Error creating TestimonialsHeader:', error);
    res.status(500).send('Error creating TestimonialsHeader');
  }
});

// Get all TestimonialsHeaders
app.get('/testimonials-header', async (req, res) => {
  try {
    const testimonialsHeaders = await TestimonialsHeader.find();
    res.json(testimonialsHeaders);
  } catch (error) {
    console.error('Error fetching TestimonialsHeaders:', error);
    res.status(500).send('Error fetching TestimonialsHeaders');
  }
});

// Get a single TestimonialsHeader by ID
app.get('/testimonials-header/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const testimonialsHeader = await TestimonialsHeader.findById(id);
    if (!testimonialsHeader) return res.status(404).send('TestimonialsHeader not found');
    res.json(testimonialsHeader);
  } catch (error) {
    console.error('Error fetching TestimonialsHeader:', error);
    res.status(500).send('Error fetching TestimonialsHeader');
  }
});

// Update a TestimonialsHeader by ID
app.put('/testimonials-header/:id', [
  body('title').notEmpty().withMessage('Title is required'),
  body('subTitle').notEmpty().withMessage('Subtitle is required')
], async (req, res) => {
  const { id } = req.params;
  const { title, subTitle } = req.body;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedTestimonialsHeader = await TestimonialsHeader.findByIdAndUpdate(id, { title, subTitle }, { new: true });
    if (!updatedTestimonialsHeader) return res.status(404).send('TestimonialsHeader not found');
    res.json(updatedTestimonialsHeader);
  } catch (error) {
    console.error('Error updating TestimonialsHeader:', error);
    res.status(500).send('Error updating TestimonialsHeader');
  }
});

// Delete a TestimonialsHeader by ID
app.delete('/testimonials-header/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const testimonialsHeader = await TestimonialsHeader.findByIdAndDelete(id);
    if (!testimonialsHeader) return res.status(404).send('TestimonialsHeader not found');
    res.send('TestimonialsHeader deleted successfully');
  } catch (error) {
    console.error('Error deleting TestimonialsHeader:', error);
    res.status(500).send('Error deleting TestimonialsHeader');
  }
});


// Create a new Footer document
app.post('/footer', async (req, res) => {
  try {
    const { InfoMsg, email, phoneNo, Tag, TagDesc, ButtonText } = req.body;

    // Create a new Footer document
    const newFooter = new Footer({
      InfoMsg,
      email,
      phoneNo,
      Tag,
      TagDesc,
      ButtonText
    });

    // Save the document to the database
    const savedFooter = await newFooter.save();

    // Send a response with the saved document
    res.status(201).json({
      success: true,
      message: 'Footer created successfully',
      data: savedFooter
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({
      success: false,
      message: 'Error creating footer',
      error: error.message
    });
  }
});


// Express route to get all footers
app.get('/footer', async (req, res) => {
  try {
    // Fetch all footer documents from the database
    const footers = await Footer.find();

    // Send a successful response with the fetched data
    res.status(200).json({
      success: true,
      data: footers
    });
  } catch (error) {
    // Send an error response if something goes wrong
    res.status(500).json({
      success: false,
      message: 'Error fetching footers',
      error: error.message
    });
  }
});



// Get a single Footer document by ID
app.get('/footer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const footer = await Footer.findById(id);
    if (!footer) return res.status(404).send('Footer not found');
    res.json(footer);
  } catch (error) {
    console.error('Error fetching footer data:', error);
    res.status(500).send('Error fetching footer data');
  }
});

// Express route to update a footer by id
app.put('/footer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFooter = await Footer.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedFooter) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Footer updated successfully',
      data: updatedFooter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating footer',
      error: error.message,
    });
  }
});

// Delete a Footer document by ID
app.delete('/footer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const footer = await Footer.findByIdAndDelete(id);
    if (!footer) return res.status(404).send('Footer not found');
    res.send('Footer deleted successfully');
  } catch (error) {
    console.error('Error deleting footer:', error);
    res.status(500).send('Error deleting footer');
  }
});

// Create a new Newsletter
app.post('/newsletter', async (req, res) => {
  try {
    const { title, subTitle, discountDesc, desc, ButtonText, Img } = req.body;
    const newNewsletter = new Newsletter({ title, subTitle, discountDesc, desc, ButtonText, Img });
    const savedNewsletter = await newNewsletter.save();
    res.status(201).json({ success: true, message: 'Newsletter created successfully', data: savedNewsletter });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating newsletter', error: error.message });
  }
});

// Get all Newsletters
app.get('/newsletter', async (req, res) => {
  try {
    const newsletters = await Newsletter.find();
    res.status(200).json({ success: true, data: newsletters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching newsletters', error: error.message });
  }
});

// Update a Newsletter by ID
app.put('/newsletter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedNewsletter = await Newsletter.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedNewsletter) {
      return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }
    res.status(200).json({ success: true, message: 'Newsletter updated successfully', data: updatedNewsletter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating newsletter', error: error.message });
  }
});

// Delete a Newsletter by ID
app.delete('/newsletter/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Newsletter.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }
    res.status(200).json({ success: true, message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting newsletter', error: error.message });
  }
});

app.post('/about', upload.single('image'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('tags').custom((value) => {
    try {
      JSON.parse(value); // Verify if tags is a valid JSON string
      return true;
    } catch (e) {
      throw new Error('Tags must be an array');
    }
  }),
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, subtitle, description, tags } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    // Create a new About document
    const about = new About({ title, subtitle, description, tags: JSON.parse(tags), image });
    await about.save();
    res.status(201).send('About document created successfully');
  } catch (error) {
    console.error('Error creating About document:', error);
    res.status(500).send('Error creating About document');
  }
});

// Get all About documents
app.get('/about', async (req, res) => {
  try {
    const abouts = await About.find();
    res.json(abouts);
  } catch (error) {
    console.error('Error fetching About documents:', error);
    res.status(500).send('Error fetching About documents');
  }
});

app.put('/about/:id', upload.single('image'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('tags').optional().custom((value) => {
    try {
      JSON.parse(value); // Verify if tags is a valid JSON string
      return true;
    } catch (e) {
      throw new Error('Tags must be an array');
    }
  }),
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, subtitle, description, tags } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    // Find and update the document
    const updatedAbout = await About.findByIdAndUpdate(
      id,
      {
        title: title || undefined,
        subtitle: subtitle || undefined,
        description: description || undefined,
        tags: tags ? JSON.parse(tags) : undefined,
        image: image || undefined
      },
      { new: true } // Return the updated document
    );

    if (!updatedAbout) {
      return res.status(404).send('About document not found');
    }

    // Optionally, you might want to delete the old image file if it was replaced
    // const fs = require('fs');
    // if (image && updatedAbout.image) {
    //   fs.unlinkSync(updatedAbout.image); // Handle file deletion properly
    // }

    res.status(200).json(updatedAbout);
  } catch (error) {
    console.error('Error updating About document:', error);
    res.status(500).send('Error updating About document');
  }
});

// Define the DELETE endpoint
app.delete('/about/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the document
    const about = await About.findByIdAndDelete(id);

    if (!about) {
      return res.status(404).send('About document not found');
    }

    // Optionally, you might want to delete the image file if it exists
    // const fs = require('fs');
    // if (about.image) {
    //   fs.unlinkSync(about.image); // Make sure to handle file deletion properly
    // }

    res.status(200).send('About document deleted successfully');
  } catch (error) {
    console.error('Error deleting About document:', error);
    res.status(500).send('Error deleting About document');
  }
});




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
