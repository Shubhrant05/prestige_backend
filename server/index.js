import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from './routes/user-routes.js'
import listingRoutes from './routes/listing-routes.js'
import cors from 'cors'
import cookieParser from "cookie-parser";

dotenv.config() //used to load environment variables from a .env file into process.env

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const PORT = 4000;

//Connecting to MONGODB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('DB connected')
}).catch((err) => {
    console.log('DB connection error', err)
})

// routes definition
app.use('/api/user', userRoutes)
app.use('/api/listing', listingRoutes)

// server listening
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})

