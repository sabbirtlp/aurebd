const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/aureabd";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("Users found:", JSON.stringify(users.map(u => ({ name: u.name, email: u.email, phone: u.phone })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
