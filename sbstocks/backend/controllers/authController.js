const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sbstocks_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });

    // Create portfolio and watchlist for new user
    await Portfolio.create({ user: user._id });
    await Watchlist.create({ user: user._id, stocks: [] });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      virtualBalance: user.virtualBalance,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      virtualBalance: user.virtualBalance,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (password) user.password = password;
    await user.save();
    res.json({ message: 'Profile updated', name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
