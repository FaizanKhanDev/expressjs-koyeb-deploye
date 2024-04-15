import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: false, trim: true },
  last_name: { type: String, required: false, trim: true },
  email: { type: String, required: false, trim: true },
  is_email_verified: { type: Boolean, default: false },
  password: { type: String, required: true, trim: true },
  resetOTP: {
    otp: { type: String, required: false, default: null },
    expiresAt: { type: Date, required: false, default: null }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

// Model
const UserModel = mongoose.model("user", userSchema)

export default UserModel