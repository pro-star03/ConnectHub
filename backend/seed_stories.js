const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Story = require('./src/models/Story');
const StoryView = require('./src/models/StoryView');
const bcrypt = require('bcryptjs');

const names = [
  'Aarav', 'Aditi', 'Aditya', 'Aman', 'Ananya',
  'Bhavya', 'Chetan', 'Dev', 'Diya', 'Esha',
  'Farhan', 'Gauri', 'Harsh', 'Ishita', 'Jay',
  'Karan', 'Meera', 'Neha', 'Om', 'Priya',
  'Rahul', 'Riya', 'Shreya', 'Sneha', 'Varun'
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // 1. Create 25 Users
    console.log('Creating 25 realistic demo users...');
    const createdUsers = [];
    for (const name of names) {
      const username = `${name.toLowerCase()}_official_${Math.floor(Math.random() * 1000)}`;
      
      let user = await User.findOne({ username });
      if (!user) {
        user = await User.create({
          name: `${name} Sharma`,
          username,
          email: `${username}@example.com`,
          password: await bcrypt.hash('password123', 10),
          bio: `Hello! I am ${name}. Love photography and coding!`,
          profilePicture: `https://ui-avatars.com/api/?name=${name}+Sharma&background=random&size=200`,
        });
      }
      createdUsers.push(user);
    }
    console.log(`Successfully created/retrieved ${createdUsers.length} demo users.`);

    // 2. Establish Follow Relationships for the current account
    const myAccount = await User.findOne({ email: 'demo@connecthub.test' });
    if (!myAccount) {
      console.error('Target account demo@connecthub.test not found. Please log in with an admin or adjust the script.');
      process.exit(1);
    }

    console.log('Setting up followers and following for myAccount...');
    let followersAdded = 0;
    let followingAdded = 0;

    for (let i = 0; i < createdUsers.length; i++) {
      const demoUser = createdUsers[i];
      
      // Follow Logic: 
      // i % 3 === 0 -> Mutual
      // i % 3 === 1 -> They follow me
      // i % 3 === 2 -> I follow them
      
      const type = i % 3;
      
      // Function to safely add relation
      const addFollow = async (follower, followed) => {
        if (!follower.following.includes(followed._id)) follower.following.push(followed._id);
        if (!followed.followers.includes(follower._id)) followed.followers.push(follower._id);
      };

      if (type === 0) {
        await addFollow(myAccount, demoUser);
        await addFollow(demoUser, myAccount);
        followersAdded++;
        followingAdded++;
      } else if (type === 1) {
        await addFollow(demoUser, myAccount);
        followersAdded++;
      } else if (type === 2) {
        await addFollow(myAccount, demoUser);
        followingAdded++;
      }
      
      await demoUser.save();
    }
    await myAccount.save();
    console.log(`Added ${followersAdded} followers and ${followingAdded} following to myAccount.`);

    // 3. Create Stories
    console.log('Creating multiple active stories per user...');
    await Story.deleteMany({});
    await StoryView.deleteMany({}); // Wipe previous views for clean slate
    
    let storyCount = 0;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

    const storyCounts = {
      'Shreya Sharma': 5,
      'Rahul Sharma': 4,
      'Priya Sharma': 3,
      'Aman Sharma': 4,
    };

    for (const user of createdUsers) {
      const count = storyCounts[user.name] || (Math.random() > 0.5 ? 2 : 0);
      
      for (let j = 0; j < count; j++) {
        await Story.create({
          user: user._id,
          image: `https://picsum.photos/seed/${user.username}_${j}/600/800`,
          caption: `${user.name}'s amazing story part ${j + 1}`,
          expiresAt
        });
        storyCount++;
      }
    }
    
    // Create a story for myAccount too
    await Story.create({
      user: myAccount._id,
      image: `https://picsum.photos/seed/myAccount_1/600/800`,
      caption: `My day is going great!`,
      expiresAt
    });
    storyCount++;

    console.log(`Successfully created ${storyCount} stories with unique story IDs.`);
    
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB();
