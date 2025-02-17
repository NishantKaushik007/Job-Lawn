import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/UserModel";
import { registerSchema } from "@/utils/validators";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    await dbConnect();

    // Check if user exists by email or mobile
    const existingUser = await User.findOne({
      $or: [{ email: parsed.email }, { mobile: parsed.mobile }],
    });

    if (existingUser) {
      let errorMsg = "";
      if (existingUser.email === parsed.email) {
        errorMsg = "Email already exists";
      } else if (existingUser.mobile === parsed.mobile) {
        errorMsg = "Mobile number already exists";
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(parsed.password, 10);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    // Create new user
    await User.create({
      username: parsed.username,
      email: parsed.email,
      password: hashedPassword,
      mobile: parsed.mobile,
      countryCode: parsed.countryCode,
      otp,
      otpExpires,
      otpAttempts: 0,
    });

    // Send OTP email
    const mailOptions = {
      from: `"Job Lawn" <${process.env.SMTP_USER}>`,
      to: parsed.email,
      subject: "Your OTP Code",
      html: 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #555;">Dear ${parsed.username},</p>
        <p style="font-size: 16px; color: #555;">
          Your one-time password (OTP) to verify your account is:
        </p>
        <!-- Centered OTP container -->
        <div style="position: relative; display: block; width: fit-content; margin: 0 auto;">
          <p id="otp" style="font-size: 24px; font-weight: bold; text-align: center; color: #2c3e50; background: #f4f4f4; padding: 10px 40px 10px 10px; border-radius: 4px; margin: 0;">
            ${otp}
          </p>
        </div>
        <p style="font-size: 16px; color: #555; margin-top: 15px;">
          This OTP is valid for <strong>2 minutes</strong>. Please do not share this code with anyone.
        </p>
        <p style="font-size: 16px; color: #555;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #888; text-align: center;">
          &copy; ${new Date().getFullYear()} Job Lawn. All rights reserved.
        </p>
      </div>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "User registered. Please verify your email with the OTP sent.",
    });
  } catch (error: any) {
    console.error("Error in registration:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
