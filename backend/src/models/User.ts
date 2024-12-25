// models/User.ts

import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: {
        data: Buffer;
        contentType: string;
    };
    resetPasswordToken?: string;
    resetPasswordExpires?: number;
}

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        data: Buffer,
        contentType: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

export default mongoose.model<IUser>("User", UserSchema, "Users");
