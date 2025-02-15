import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { signJwt } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    const order = await createRazorpayOrder(amount);
    const token = signJwt({ orderId: order.id });
    return NextResponse.json({ order, token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
