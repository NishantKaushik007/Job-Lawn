"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(49);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (res.ok) {
      // Redirect to Razorpay checkout in a real scenario
      router.push("/dashboard");
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Subscription Payment</h1>
      {error && <p className="text-red-500">{error}</p>}
      <p>Amount: ₹{amount}</p>
      <Button onClick={handlePayment}>Pay Now</Button>
    </div>
  );
}
