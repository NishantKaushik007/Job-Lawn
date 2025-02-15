//src/app/api/auth/forget-password/verify/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/UserModel";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.resetOtp || !user.resetOtpExpires) {
      return NextResponse.json({ error: "No password reset request found" }, { status: 400 });
    }
    if (user.resetOtpExpires < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }
    if (user.resetOtpAttempts >= 5) {
      return NextResponse.json({ error: "Too many attempts. Please request a new OTP." }, { status: 400 });
    }
    if (user.resetOtp !== otp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
