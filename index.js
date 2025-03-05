import dotenv from 'dotenv';
import dbConnection from "./db/dbConnection.js"
import userRoutes from './routes/user.route.js'
import dashboardRoutes from './routes/dashboard.route.js'
import travelRequestRoutes from './routes/travelreq.route.js'
import bookingManagementRoutes from './routes/booking.route.js'

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config()
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'itiner0.netlify.app',
    methods:'GET,POST,PUT,DELETE',
    allowedHeaders:'Content-Type, Authorization',
    credentials:true
}))




dbConnection()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log('DB connection failed', err)
    })

app.use('/api/users', userRoutes)
app.use('/api/dashboard',dashboardRoutes)
app.use('/api/travel-request',travelRequestRoutes)
app.use('/api/booking-management',bookingManagementRoutes)
