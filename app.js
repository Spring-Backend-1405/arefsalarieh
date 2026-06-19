import express from "express";
import cors from 'cors'
import helmet from "helmet";
import errorMiddleware from "./middlewares/errorMiddleware.js";

export const createApp = () => {

  const app = express();
  app.use(express.json());
  app.use(cors())
  app.use(helmet())

  app.get('/health' , (req , res)=>{
    res.send('it`s healthy')
  })

  app.use(errorMiddleware)

  return app
};
