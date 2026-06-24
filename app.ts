import express from "express";
import cors from 'cors'
import helmet from "helmet";
import errorMiddleware from "./middlewares/errorMiddleware";
import authRouter from "./modules/auth/auth.routes";

export const createApp = () => {

  const app = express();
  app.use(express.json());
  app.use(cors())
  app.use(helmet())

  app.get('/health' , (req , res)=>{
    res.send('it`s healthy')
  })

  app.use('/api/auth' , authRouter)

  app.use(errorMiddleware)

  return app
};
