'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Define the expected structure of your token payload.
interface MyJwtPayload {
  exp: number; // Expiration time in seconds (Unix timestamp)
  userId: string;
  deviceId: string;
  subscriptionExpires: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  // Memoized logout handler.
  const handleLogout = useCallback(async () => {
    console.log('Logging out automatically...');
    localStorage.removeItem('token');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Check the user's session status on mount.
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) throw new Error(`Failed to fetch session: ${response.status}`);
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

    // Set up an interval to verify token expiration every second.
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

  return (
    <div>
      {/* You can add your dashboard's header, sidebar, etc. here */}
      {children}
    </div>
  );
}
