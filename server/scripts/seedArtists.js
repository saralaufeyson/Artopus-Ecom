import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Artist from '../models/Artist.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function seedArtists() {
  await connectDB(process.env.MONGO_URI);

  const sampleArtists = [
    {
      artistName: 'Sarah Johnson',
      penName: 'SJ Artistry',
      email: 'sarah@example.com',
      bio: 'Contemporary artist specializing in abstract paintings and digital art.',
      socialLinks: {
        instagram: 'https://instagram.com/sjartistry',
        website: 'https://sarahjohnson.art'
      }
    },
    {
      artistName: 'Michael Chen',
      penName: 'Chen Creations',
      email: 'michael@example.com',
      bio: 'Sculptor and mixed media artist with a passion for sustainable materials.',
      socialLinks: {
        instagram: 'https://instagram.com/chencreations',
        twitter: 'https://twitter.com/chencreations'
      }
    },
    {
      artistName: 'Emma Rodriguez',
      penName: 'Emma R.',
      email: 'emma@example.com',
      bio: 'Photographer and digital artist exploring themes of identity and culture.',
      socialLinks: {
        instagram: 'https://instagram.com/emma_r_art',
        website: 'https://emmarodriguez.photo'
      }
    }
  ];

  for (const artistData of sampleArtists) {
    const existing = await Artist.findOne({ email: artistData.email });
    if (!existing) {
      await Artist.create(artistData);
      console.log(`Created artist: ${artistData.artistName}`);
    } else {
      console.log(`Artist already exists: ${artistData.artistName}`);
    }
  }

  console.log('Artist seeding completed!');
  process.exit(0);
}

seedArtists().catch(err => {
  console.error(err);
  process.exit(1);
});
