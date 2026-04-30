import dbConnect from "../src/lib/db";
import User from "../src/models/User";

async function listUsers() {
  try {
    await dbConnect();
    const users = await User.find({});
    console.log("Total users:", users.length);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [ID: ${u._id}] Phone: ${u.phone || 'N/A'}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
