const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sbstocks';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const User = require('./models/User');
  const Portfolio = require('./models/Portfolio');
  const Watchlist = require('./models/Watchlist');

  // Create admin
  const adminExists = await User.findOne({ email: 'admin@sbstocks.com' });
  if (!adminExists) {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sbstocks.com',
      password: 'admin123',
      role: 'admin',
      virtualBalance: 1000000
    });
    await Portfolio.create({ user: admin._id });
    await Watchlist.create({ user: admin._id, stocks: [] });
    console.log('✅ Admin user created: admin@sbstocks.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  await mongoose.disconnect();
  console.log('✅ Seeding complete!');
}

seed().catch(console.error);
