//import('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index1.js";


/* (async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`);
        app.on("error",(err)=>{
            console.log(err);
            throw err;
            })
        app.listen(process.env.PORT,()={
        console.log(app is listening on port${process.env.PORT})
        })
    } catch (error) {
        console.log("ERROR:",error)
        ;
    }
})() */
dotenv.config({
    path:'./env'
})
console.log("URI:", process.env.MONGODB_URL);
connectDB()