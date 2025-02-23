import Link from "next/link";
import { TypingAnimation } from "@/components/magicui/typing-animation";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#1c1c1c] overflow-hidden">
      {/* Decorative Blurs */}
      <div className="fixed top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#6366f1]/20 rounded-full blur-[128px] animate-glow pointer-events-none" />
      <div className="fixed -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#f59e0b]/20 rounded-full blur-[128px] animate-glow-delayed pointer-events-none" />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
        Welcome to <TypingAnimation as="span" className="text-4xl md:text-6xl font-bold drop-shadow-lg">Job Lawn</TypingAnimation>
      </h1>
        <p className="mt-4 text-lg md:text-2xl drop-shadow-md">
          Discover the best job opportunities at top companies.
        </p>
        <Link href="/dashboard">
          <button className="mt-8 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-lg font-medium hover:from-green-600 hover:to-blue-700 transition">
            Explore Now
          </button>
        </Link>
      </div>
    </div>
  );
}
