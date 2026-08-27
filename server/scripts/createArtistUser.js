import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Artist from '../models/Artist.js';
import { connectDB } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createArtistUser() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artopus';
  console.log('Connecting to MongoDB Atlas at:', mongoUri);
  await connectDB(mongoUri);

  const email = 'layasree81103@gmail.com';
  const password = '12345678';
  const name = 'Layasree';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.role = 'artist';
    user.isVerified = true;
    user.password = hashedPassword;
    user.name = name;
    await user.save();
    console.log(`Updated existing user: ${user.email} (ID: ${user._id}) to role: 'artist'`);
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'artist',
      isVerified: true,
    });
    console.log(`Created new user: ${user.email} (ID: ${user._id}) with role: 'artist'`);
  }

  let artist = await Artist.findOne({ email: email.toLowerCase() });
  if (artist) {
    artist.userId = user._id;
    artist.artistName = name;
    artist.isActive = true;
    await artist.save();
    console.log(`Updated existing artist profile: ${artist.artistName} (ID: ${artist._id})`);
  } else {
    artist = await Artist.create({
      artistName: name,
      userId: user._id,
      email: email.toLowerCase(),
      bio: 'Featured artist profile on Artopus India.',
      isActive: true,
      commissionRate: 18,
    });
    console.log(`Created new artist profile: ${artist.artistName} (ID: ${artist._id})`);
  }

  console.log('Artist profile creation successful on MongoDB Atlas!');
  process.exit(0);
}

createArtistUser().catch((err) => {
  console.error('Error creating artist profile:', err);
  process.exit(1);
});
