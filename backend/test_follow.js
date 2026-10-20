require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function test() {
  await connectDB();
  console.log('Connected to MongoDB');
  
  const users = await User.find({}).limit(5);
  console.log('Users found:', users.map(u => ({ id: u._id, name: u.name })));
  
  if(users.length >= 2) {
    const userA = users[0];
    const userB = users[1];
    
    console.log(`\nTesting: ${userA.name} following ${userB.name}`);
    
    // Alok follows Mansi
    if (!userA.following.includes(userB._id)) {
      userA.following.push(userB._id);
      userB.followers.push(userA._id);
      await userA.save();
      await userB.save();
      console.log('Added follow relationship');
    } else {
      console.log('Already following');
    }
    
    const checkA = await User.findById(userA._id);
    const checkB = await User.findById(userB._id);
    console.log(`${checkA.name} following count:`, checkA.following.length);
    console.log(`${checkB.name} followers count:`, checkB.followers.length);
    console.log(`Does ${checkA.name} follow ${checkB.name}?`, checkA.following.includes(checkB._id));
  }
  
  process.exit(0);
}

test();
