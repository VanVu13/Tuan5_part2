const express = require('express');
const User = require('../models/User');

const router = express.Router();

// ===================== MIDDLEWARE =====================
function isAuthenticated(req, res, next) {
    if (req.session.userId) return next();
    // API trả JSON
    if (req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // View redirect login
    res.redirect('/login');
}

// ===================== VIEW ROUTES =====================

// Hiển thị login form
router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/profile-view');
    res.render('login', { title: 'Login' });
});

// Hiển thị register form
router.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/profile-view');
    res.render('register', { title: 'Register' });
});

// Hiển thị profile (protected)
router.get('/profile-view', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId).select('-password');
    res.render('profile', { title: 'Profile', user });
});

// Logout và redirect về login
router.get('/logout-view', isAuthenticated, (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// ===================== API ROUTES =====================
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists or missing fields
 */
// REGISTER
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: 'Username and password required' });

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Wrong password or user not found
 */

// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.render('login', { title: 'Login', error: 'Username and password required' });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.render('login', { title: 'Login', error: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.render('login', { title: 'Login', error: 'Wrong password' });

        req.session.userId = user._id;
        res.redirect('/profile-view');
    } catch (err) {
        console.error(err);
        res.render('login', { title: 'Login', error: 'Server error' });
    }
});
/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */

// LOGOUT
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid', { path: '/' });
        res.json({ message: 'Logout successful' });
    });
});
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
