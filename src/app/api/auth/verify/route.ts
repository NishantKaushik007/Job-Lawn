// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/UserModel";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.verified) {
      return NextResponse.json({ message: "User already verified" });
    }
    if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Mark user as verified and set subscription period (30 days)
    user.verified = true;
    user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return NextResponse.json({ message: "User verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
