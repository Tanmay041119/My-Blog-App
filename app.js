const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
require("dotenv").config();
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT|| 8015;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";


const API_KEY = process.env.GEMINI_API_KEY; 
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogify').then(() => {
    console.log('MongoDB Connected');
});

// Import routes & middleware
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const checkForLogin = require('./middleware/authentication');

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForLogin('token'));
app.use(express.static(path.resolve('./public')));

// Import models
const Blog = require('./models/blog');

// Routes
app.use('/user', userRoute);
app.use('/blog', blogRoute);

// Home Route
app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({}).sort();
    res.render('home', { user: req.user, blogs: allBlogs });
});

// Logout Route
app.get('/user/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Improve Description Route
app.post('/improve-description',async (req, res) => {
    let { body } = req.body; 

    const response = await axios.post(
        `${GEMINI_API_URL}?key=${API_KEY}`,
        {
            contents: [{ parts: [{ text: `Improvise this and dont include anything extra as my backend is fixed i will directly paste this in description so only send 1 option without bolding letters  : ${body}` }] }]
        }
    );
    const txt = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
    let improvedText = txt;
    res.json({ improvedText }); 
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server started at PORT=${PORT}`);
});
