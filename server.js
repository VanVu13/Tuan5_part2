require('dotenv').config(); // load .env
const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const path = require('path');
const authRouter = require('./routes/auth');
const setupSwagger = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simpleAuth';
const SESSION_SECRET = process.env.SESSION_SECRET || 'secretKey123';
const expressLayouts = require('express-ejs-layouts');
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout'); // file layout.ejs trong views

// ===================== MIDDLEWARE =====================

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// CORS (nếu frontend riêng)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// Session setup với MongoStore
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
}));
// ===================== DATABASE =====================
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
// ===================== VIEW ROUTES =====================
// Redirect root -> login
app.get('/', (req, res) => res.redirect('/login'));
// Login view
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', user: null });
});
// Register view
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', user: null });
});
// Profile view (protected)
app.get('/profile-view', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const User = require('./models/User');
    const user = await User.findById(req.session.userId).select('-password');
    res.render('profile', { title: 'Profile', user });
});
// Logout view
app.get('/logout-view', (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});
// Dashboard (simple example)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.send(`<h2>Welcome user ${req.session.userId}</h2><a href="/logout-view">Logout</a>`);
});
// ===================== API ROUTES =====================
app.use('/api', authRouter);
// ===================== SWAGGER DOCS =====================
// API routes
// Cấu hình Swagger
setupSwagger(app, PORT);

// ===================== START SERVER =====================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
