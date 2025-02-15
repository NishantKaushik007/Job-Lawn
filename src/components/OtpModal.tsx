"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OtpModalProps {
  onSubmit: (otp: string) => void;
}

export default function OtpModal({ onSubmit }: OtpModalProps) {
  const [otp, setOtp] = useState("");
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Enter OTP</h2>
        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="input mb-4"
        />
        <Button onClick={() => onSubmit(otp)}>Submit</Button>
      </div>
    </div>
  );
}
