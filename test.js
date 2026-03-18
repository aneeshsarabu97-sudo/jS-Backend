import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("URI:", process.env.MONGODB_URL);

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ MongoDB CONNECTED");
  })
  .catch((err) => {
    console.log("❌ ERROR:", err.message);
  });