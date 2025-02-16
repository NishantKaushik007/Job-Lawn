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
      html: 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #555;">Dear ${user.username},</p>
        <p style="font-size: 16px; color: #555;">
          Your one-time password (OTP) to reset your password is:
        </p>
        <!-- Centered OTP container -->
        <div style="position: relative; display: block; width: fit-content; margin: 0 auto;">
          <p id="otp" style="font-size: 24px; font-weight: bold; text-align: center; color: #2c3e50; background: #f4f4f4; padding: 10px 40px 10px 10px; border-radius: 4px; margin: 0;">
            ${otp}
          </p>
          <!-- Copy Icon positioned at the top-right corner -->
          <span onclick="copyOTP()" style="position: absolute; top: 5px; right: 5px; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 0 24 24" fill="#808080">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </span>
        </div>
        <p style="font-size: 16px; color: #555; margin-top: 15px;">
          This OTP is valid for <strong>2 minutes</strong>. Please do not share this code with anyone.
        </p>
        <p style="font-size: 16px; color: #555;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #888; text-align: center;">
          &copy; ${new Date().getFullYear()} Job Lawn. All rights reserved.
        </p>
        <script>
          function copyOTP() {
            const otpText = document.getElementById('otp').innerText;
            navigator.clipboard.writeText(otpText).then(() => {
              alert('OTP copied to clipboard!');
            }).catch(err => {
              console.error('Failed to copy OTP: ', err);
            });
          }
        </script>
      </div>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Password reset OTP sent" });
  } catch (error: any) {
    console.error("Error in forgot password request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
