import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/UserModel";
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
    const { email } = await request.json();
    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    // Store OTP details in user record
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    user.resetOtpAttempts = 0;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: `"Job Lawn" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your password reset OTP is <strong>${otp}</strong>. It expires in 2 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Password reset OTP sent" });
  } catch (error: any) {
    console.error("Error in forgot password request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
