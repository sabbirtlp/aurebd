import dbConnect from "../src/lib/db";
import User from "../src/models/User";

async function checkUsers() {
  try {
    await dbConnect();
    const users = await User.find({}).limit(5);
    console.log("Users found:", users.map(u => ({ name: u.name, email: u.email })));
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

checkUsers();
