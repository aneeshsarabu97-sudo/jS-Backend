import mongoose from "mongoose";
import { DBNAME } from "../constants.js";

const connectDB=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`)
        console.log("MONGODB CONNECTED1!")
    } catch (error) {
        console.log("ERROR:",error);
        process.exit(1);
    }
}
export default connectDB;