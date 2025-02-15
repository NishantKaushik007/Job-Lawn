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
      html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 2 minutes.</p>`,
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
