"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    mobile: "",
    countryCode: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } else {
      setError(data.error);
    }
  };

  return (
    // Outer container: min-h-screen & overflow-auto prevents extra scrolling if card is small.
    <div className="relative min-h-screen w-screen bg-[#1c1c1c] overflow-auto">
      {/* Glow effects as fixed elements (do not affect layout) */}
      <div className="fixed top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#6366f1]/20 rounded-full blur-[128px] animate-glow pointer-events-none" />
      <div className="fixed -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#f59e0b]/20 rounded-full blur-[128px] animate-glow-delayed pointer-events-none" />

      {/* Centering container */}
      <div className="relative z-10 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-md p-6 sm:p-8 md:p-10 bg-[#2a2a2a]/50 rounded-2xl backdrop-blur-xl border border-zinc-800">
          <h1 className="text-2xl font-semibold text-white text-center mb-8">
            Register
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-zinc-400">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 rounded-md bg-[#2a2a2a]/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 rounded-md bg-[#2a2a2a]/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-zinc-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 rounded-md bg-[#2a2a2a]/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="sm:w-1/3">
                <label htmlFor="countryCode" className="text-sm text-zinc-400">
                  Country Code
                </label>
                <input
                  id="countryCode"
                  type="text"
                  name="countryCode"
                  placeholder="+91"
                  value={form.countryCode}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-md bg-[#2a2a2a]/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:w-2/3">
                <label htmlFor="mobile" className="text-sm text-zinc-400">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 rounded-md bg-[#2a2a2a]/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00b5ad] via-[#1e40af] to-[#6b21a8] text-white relative overflow-hidden h-12 transition-all duration-1000 ease-in-out hover:from-[#6b21a8] hover:via-[#00b5ad] hover:to-[#1e40af]"
            >
              <span className="relative z-10">Register</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00b5ad]/50 via-[#1e40af]/50 to-[#6b21a8]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
