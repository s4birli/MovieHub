import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from "dotenv";

import usersRoute from "./routes/users";


dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || "";
// Connect to MongoDB
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.get('/', (req: Request, res: Response): void => {
    res.send('API Running');
});
app.use("/api/users", usersRoute);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));