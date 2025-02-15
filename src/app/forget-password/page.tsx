"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forget-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setOtpSent(true);
    } else {
      setError(data.error || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forget-password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/login");
    } else {
      if (data.error === "OTP expired. Please request a new one." || 
          data.error === "Too many attempts. Please request a new OTP.") {
        setOtpSent(false);
        setEmail(""); // Optional: clear email if you want them to start fresh
        window.location.reload();
      }
      setError(data.error || "Invalid OTP or password reset failed.");
    }
  };

  useEffect(() => {
    if (error && (error.includes("OTP expired") || error.includes("Too many attempts"))) {
      window.location.reload();
    }
  }, [error]);

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]{1}$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if valid number
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center p-4">
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#6366f1]/20 rounded-full blur-[128px] animate-glow" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#f59e0b]/20 rounded-full blur-[128px] animate-glow-delayed" />

      <div className="w-full max-w-md p-8 bg-[#2a2a2a]/50 rounded-2xl backdrop-blur-xl border border-zinc-800 relative z-10">
        <h1 className="text-2xl font-semibold text-white text-center mb-8">Forget Password</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!otpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-400">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full h-12 px-4 py-2 rounded-md bg-[#2a2a2a]/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#f59e0b] text-white hover:to-[#f59e0b] relative overflow-hidden h-12"
            >
              <span className="relative z-10">{loading ? "Sending OTP..." : "Request OTP"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/50 to-[#f59e0b]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-between space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  maxLength={1}
                  className="w-14 h-14 text-center text-white bg-[#2a2a2a] border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="-"
                />
              ))}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm text-zinc-400">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                className="w-full h-12 px-4 py-2 rounded-md bg-[#2a2a2a]/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#f59e0b] text-white hover:to-[#f59e0b] relative overflow-hidden h-12"
            >
              <span className="relative z-10">{loading ? "Verifying..." : "Reset Password"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/50 to-[#f59e0b]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
