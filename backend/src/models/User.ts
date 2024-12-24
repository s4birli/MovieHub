// models/User.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: number;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: false },
    resetPasswordToken: String,
    resetPasswordExpires: Number,
});

export default mongoose.model<IUser>("User", UserSchema, "Users");
