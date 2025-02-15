import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string
});

export async function createRazorpayOrder(amount: number, currency: string = "INR") {
  const options = {
    amount: amount * 100, // convert to paisa
    currency,
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  };
  return await razorpayInstance.orders.create(options);
}
