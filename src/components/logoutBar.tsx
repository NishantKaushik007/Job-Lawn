'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPower } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode'; // Adjust import as needed

// Define the expected structure of your token payload.
interface MyJwtPayload {
  exp: number; // Expiration time in seconds (Unix timestamp)
  userId: string;
  deviceId: string;
  subscriptionExpires: string;
}

const LogoutBar = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Memoized logout handler.
  const handleLogout = useCallback(async () => {
    console.log('Logging out automatically...');
    localStorage.removeItem('token');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Optionally, check the session from your server-side API.
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok)
          throw new Error(`Failed to fetch session: ${response.status}`);
        const data = await response.json();
        console.log('Session Data:', data);
        if (!data.session) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        router.push('/login');
      }
    };

    checkAuth();

    // Set up an interval to check for token expiration every second.
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode the token to read the expiration field.
          const decoded = jwtDecode<MyJwtPayload>(token);
          const currentTime = Date.now(); // current time in milliseconds
          const expirationTime = decoded.exp * 1000; // convert exp from seconds to milliseconds

          // If the current time is greater than or equal to expiration time, log out.
          if (currentTime >= expirationTime) {
            console.log('Token has expired. Initiating logout...');
            handleLogout();
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          // In case of any error, log out as a safety measure.
          handleLogout();
        }
      }
    }, 1000);

    // Cleanup the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [handleLogout, router]);

  // Always call hooks in the same order.
  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-[#1c1c1c]">
      <div className="relative max-w-[1080px] mx-auto flex items-center justify-between px-4">
        {/* Logo as a separate clickable element */}
        <Link href="/" className="flex flex-row cursor-pointer py-2 pr-7 gap-6">
          <Image src="/favicon.ico" alt="Logo" width={62} height={15} />
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Logout button for medium and larger screens */}
          <button
            onClick={handleLogout}
            className="hidden md:block px-6 py-3 rounded-md text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition"
          >
            Logout
          </button>
          {/* Power icon button for small screens */}
          <button
            onClick={handleLogout}
            className="md:hidden p-3 rounded-full text-red-500 bg-gray-800 hover:bg-gray-700 transition"
          >
            <FiPower size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LogoutBar;
