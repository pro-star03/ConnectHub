require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Story = require('./models/Story');
const Notification = require('./models/Notification');
const connectDB = require('./config/db');

const demoUsers = [
  { name: 'Aarav Sharma', username: 'aarav_sharma', gender: 'male' },
  { name: 'Aditya Patil', username: 'aditya_patil', gender: 'male' },
  { name: 'Rohan Deshmukh', username: 'rohan_desh', gender: 'male' },
  { name: 'Kunal Shah', username: 'kunal_shah', gender: 'male' },
  { name: 'Rahul Joshi', username: 'rahul_joshi', gender: 'male' },
  { name: 'Akash Kulkarni', username: 'akash_kulkarni', gender: 'male' },
  { name: 'Yash Mehta', username: 'yash_mehta', gender: 'male' },
  { name: 'Arjun Nair', username: 'arjun_nair', gender: 'male' },
  { name: 'Omkar Jadhav', username: 'omkar_jadhav', gender: 'male' },
  { name: 'Siddharth More', username: 'siddharth_more', gender: 'male' },
  { name: 'Prathamesh Kaduskar', username: 'prathamesh_k', gender: 'male' },
  { name: 'Atharva Pawar', username: 'atharva_pawar', gender: 'male' },
  { name: 'Vedant Gupta', username: 'vedant_gupta', gender: 'male' },
  { name: 'Harsh Verma', username: 'harsh_verma', gender: 'male' },
  { name: 'Vivek Mishra', username: 'vivek_mishra', gender: 'male' },
  { name: 'Ananya Sharma', username: 'ananya_sharma', gender: 'female' },
  { name: 'Priya Patil', username: 'priya_patil', gender: 'female' },
  { name: 'Sneha Kulkarni', username: 'sneha_kulkarni', gender: 'female' },
  { name: 'Isha Mehta', username: 'isha_mehta', gender: 'female' },
  { name: 'Riya Deshmukh', username: 'riya_desh', gender: 'female' },
  { name: 'Aditi Joshi', username: 'aditi_joshi', gender: 'female' },
  { name: 'Neha Shah', username: 'neha_shah', gender: 'female' },
  { name: 'Kavya Nair', username: 'kavya_nair', gender: 'female' },
  { name: 'Shreya More', username: 'shreya_more', gender: 'female' },
  { name: 'Pooja Jadhav', username: 'pooja_jadhav', gender: 'female' },
  { name: 'Tanvi Gupta', username: 'tanvi_gupta', gender: 'female' },
  { name: 'Sakshi Pawar', username: 'sakshi_pawar', gender: 'female' },
  { name: 'Diya Verma', username: 'diya_verma', gender: 'female' },
  { name: 'Mansi Kulkarni', username: 'mansi_kulkarni', gender: 'female' },
  { name: 'Simran Singh', username: 'simran_singh', gender: 'female' },
  { name: 'Demo User', username: 'demo', email: 'demo@connecthub.test' }
];

const captions = [
  "Weekend vibes ✨",
  "Exploring Mumbai today!",
  "College memories 📸",
  "New setup finally ready 🎮",
  "Beautiful sunset 🌅",
  "Trying something new today.",
  "Good food, good mood 🍕",
  "Late night coding session 💻",
  "Just another day in Pune",
  "Goa diaries 🌴",
  "Coffee is my fuel ☕",
  "Missing these days..."
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to Database');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    let createdUsers = [];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const email = userData.email || `${userData.username}@example.com`;
        const profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&size=200`;
        
        const user = await User.create({
          name: userData.name,
          username: userData.username,
          email,
          password: hashedPassword,
          profilePicture,
          bio: `Hello! I'm ${userData.name}. Welcome to my profile!`,
          isAdmin: userData.username === 'demo'
        });
        createdUsers.push(user);
        console.log(`Created user: ${user.username}`);
      } else {
        createdUsers.push(existingUser);
      }
    }

    console.log('Demo users seeded successfully.');

    // Seed Posts
    for (const user of createdUsers) {
      const existingPosts = await Post.countDocuments({ user: user._id });
      if (existingPosts === 0 && Math.random() > 0.3) {
        const numPosts = Math.floor(Math.random() * 3) + 1; // 1 to 3 posts
        for (let i = 0; i < numPosts; i++) {
          const caption = captions[Math.floor(Math.random() * captions.length)];
          // Using a placeholder image generator for posts
          const image = `https://picsum.photos/seed/${user._id}${i}/600/400`;
          
          await Post.create({
            user: user._id,
            content: caption,
            image
          });
        }
      }
    }
    console.log('Demo posts seeded successfully.');

    // Seed Stories
    for (const user of createdUsers) {
      const existingStories = await Story.countDocuments({ user: user._id });
      if (existingStories === 0) {
        // Create 1 story for every user to test follower stories reliably
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        await Story.create({
          user: user._id,
          image: `https://picsum.photos/seed/story_${user._id}/400/700`,
          caption: "Enjoying the day! ✨",
          expiresAt
        });
      }
    }
    console.log('Demo stories seeded successfully.');

    // Seed Relationships
    for (const user of createdUsers) {
      if (user.following.length === 0) {
        // Follow 5-10 random users
        const numFollows = Math.floor(Math.random() * 5) + 5;
        const shuffled = [...createdUsers].sort(() => 0.5 - Math.random());
        const toFollow = shuffled.slice(0, numFollows).filter(u => u._id.toString() !== user._id.toString());
        
        for (const targetUser of toFollow) {
          if (!user.following.includes(targetUser._id)) {
            user.following.push(targetUser._id);
            targetUser.followers.push(user._id);
            await targetUser.save();
            
            // Create follow notification occasionally to not bloat DB too much initially
            if (Math.random() > 0.5) {
              await Notification.create({
                recipient: targetUser._id,
                sender: user._id,
                type: 'follow',
                message: `${user.name} started following you.`
              });
            }
          }
        }
        await user.save();
      }
    }
    console.log('Demo relationships seeded successfully.');

    // Seed Likes & Comments
    const allPosts = await Post.find().limit(50);
    for (const post of allPosts) {
      if (post.likes.length === 0) {
        const numLikes = Math.floor(Math.random() * 5);
        const shuffled = [...createdUsers].sort(() => 0.5 - Math.random());
        const likers = shuffled.slice(0, numLikes);
        
        for (const liker of likers) {
          post.likes.push(liker._id);
          if (post.user.toString() !== liker._id.toString()) {
            await Notification.create({
              recipient: post.user,
              sender: liker._id,
              type: 'like',
              relatedPost: post._id,
              message: `${liker.name} liked your post.`
            });
          }
        }
        await post.save();
      }
    }
    console.log('Demo likes seeded successfully.');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
