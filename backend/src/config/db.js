require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// On Windows / environments where c-ares defaults to 127.0.0.1 without a local DNS server,
// SRV lookups for mongodb+srv:// fail with querySrv ECONNREFUSED.
// Set fallback public DNS servers (Google / Cloudflare) to ensure reliable SRV resolution.
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.includes('127.0.0.1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (e) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI ? 'MONGO_URI FOUND' : 'MONGO_URI MISSING');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
