import dotenv from "dotenv";
import { createApp } from "./app.js";



  dotenv.config();


const app = createApp()

app.listen(process.env.PORT , ()=>{
    console.log('server started at port = ' , process.env.PORT)
})