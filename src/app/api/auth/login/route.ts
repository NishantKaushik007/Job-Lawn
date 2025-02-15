// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { loginSchema } from "@/utils/validators";
import { User } from "@/lib/UserModel";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
import logger from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimiter";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip)) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      logger.info(`Login failed for email: ${email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.info(`Password mismatch for email: ${email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Check if email is verified
    if (!user.verified) {
      logger.info(`Unverified login attempt for email: ${email}`);
      return NextResponse.json(
        { 
          error: "Email not verified. Please verify your email.",
          redirect: "/verify-otp",
          email: email 
        },
        { status: 403 }
      );
    }

    if (!user.subscriptionExpires || user.subscriptionExpires < new Date()) {
      logger.info(`Subscription expired for email: ${email}`);
      return NextResponse.json({ error: "Subscription expired. Please make payment." }, { status: 403 });
    }

    const deviceId = uuidv4();
    user.currentDevice = deviceId;
    await user.save();

    const token = signJwt({
      userId: user._id,
      deviceId: deviceId,
      subscriptionExpires: user.subscriptionExpires.toISOString(),
    });
    logger.info(`User ${email} logged in successfully`);

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch (error: any) {
    logger.error(`Login error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}