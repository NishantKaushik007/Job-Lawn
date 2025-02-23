'use client';

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <img src="/one.png" alt="arrow" className="animate-bounce w-8 mt-2" />
      <p className="mt-4 text-lg md:text-2xl drop-shadow-md text-white">
        Let's find you a job. Start by selecting a company.
      </p>
    </div>
  );
}
