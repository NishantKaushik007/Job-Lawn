"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes
  const [timerActive, setTimerActive] = useState(true);

  // Handle OTP input change: Always overwrite the value even if one already exists
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let value = e.target.value;

    // If user types more than one digit (e.g. paste without triggering onPaste)
    if (value.length > 1) {
      if (/^\d+$/.test(value)) {
        const digits = value.split("").slice(0, 6);
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (index + i < 6) {
            newOtp[index + i] = digit;
          }
        });
        setOtp(newOtp);
        // Move focus to the next input after the pasted segment
        const nextIndex = index + digits.length;
        if (nextIndex < 6) {
          document.getElementById(`otp-input-${nextIndex}`)?.focus();
        }
      }
      return;
    }

    // Accept only a valid digit or empty string, and overwrite current value.
    if (value === "" || /^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  // Handle paste event for OTP inputs (attached to all inputs)
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteDigits = pasteData.split("");
      setOtp(pasteDigits);
      // Focus the last input after pasting
      document.getElementById("otp-input-5")?.focus();
    }
  };

  // Handle key down event for left/right arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < otp.length - 1) {
      e.preventDefault();
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp.join("") }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(data.error);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendMessage("");
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setResendMessage("OTP resent successfully.");
      setTimer(120);        // Reset timer to 2 minutes
      setTimerActive(true); // Restart the timer
    } else {
      setError(data.error);
    }
  };

  // Resend OTP automatically when the page loads
  useEffect(() => {
    handleResendOtp();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  return (
    <div className="min-h-screen bg-[#1c1c1c] flex items-center justify-center p-4">
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#6366f1]/20 rounded-full blur-[128px] animate-glow" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#f59e0b]/20 rounded-full blur-[128px] animate-glow-delayed" />

      <div className="w-full max-w-md p-8 bg-[#2a2a2a]/50 rounded-2xl backdrop-blur-xl border border-zinc-800 relative z-10">
        <h1 className="text-2xl font-semibold text-white text-center mb-8">Verify OTP</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {resendMessage && <p className="text-green-500 text-center mb-4">{resendMessage}</p>}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-between space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onPaste={handleOtpPaste}
                onKeyDown={(e) => handleKeyDown(e, index)}
                // Auto-select the input content on focus to enable overwriting
                onFocus={(e) => e.target.select()}
                maxLength={1}
                className="w-14 h-14 text-center text-white bg-[#2a2a2a] border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-"
              />
            ))}
          </div>

          {timerActive && (
            <p className="mt-4 text-center text-sm text-zinc-400">
              OTP expires in {Math.floor(timer / 60)}:
              {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#f59e0b] text-white hover:to-[#f59e0b] relative overflow-hidden h-12"
          >
            <span className="relative z-10">Verify OTP</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/50 to-[#f59e0b]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </Button>
        </form>

        <div className="mt-4">
          <Button
            onClick={handleResendOtp}
            disabled={timer > 0} // Disable the button while timer is active
            className={`w-full ${timer > 0 ? "text-blue-500 hover:bg-blue-50 border border-blue-500" : "bg-gradient-to-r from-[#6366f1] to-[#f59e0b] text-white hover:to-[#f59e0b]"}`}
          >
            {timer > 0 ? "Resend OTP" : "Reset OTP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
