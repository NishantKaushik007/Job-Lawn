// components/NavbarConditional.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function NavbarConditional() {
  const pathname = usePathname();

  // Render Navbar only if the current path is "/"
  if (pathname !== '/') {
    return null;
  }

  return <Navbar />;
}
