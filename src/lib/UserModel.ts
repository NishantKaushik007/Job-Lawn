// src/lib/UserModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string; // Added username
  email: string;
  password?: string;
  mobile: string;
  countryCode: string;
  verified: boolean;
  otp?: string;
  otpExpires?: Date;
  otpAttempts: number;
  subscriptionExpires?: Date;
  currentDevice?: string; // For device management
  resetOtp?: string;
  resetOtpExpires?: Date;
  resetOtpAttempts: number;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true }, // Added username
  email: { 
    type: String, 
    unique: true, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /@(gmail|outlook|yahoo|protonmail|rediffmail)\./.test(v);
      },
      message: 'Email must be from Gmail, Outlook, Yahoo, ProtonMail or RediffMail'
    }
  },
  password: { type: String },
  mobile: { type: String, required: true, unique: true }, // Made unique
  countryCode: { type: String, required: true },
  verified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  subscriptionExpires: { type: Date },
  currentDevice: { type: String }, // For device management
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  resetOtpAttempts: { type: Number, default: 0 }
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);