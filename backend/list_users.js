require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne(
    { email: 'alok@gmail.com' },
    { $set: { role: 'admin', isAdmin: true } }
  );
  
  const updatedUser = await User.findOne({ email: 'alok@gmail.com' }, 'email username role isAdmin');
  console.log('Update result:', result);
  console.log('Updated user in DB:', JSON.stringify(updatedUser, null, 2));
  process.exit(0);
};
run();
