//import('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index1.js";
import {app} from "./app.js"

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
    path:'./.env'
})
connectDB().
then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server is running at port:${process.env.PORT}`)
    })
})