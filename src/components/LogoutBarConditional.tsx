'use client';

import { usePathname } from 'next/navigation';
import LogoutBar from './logoutBar';

export default function LogoutBarConditional() {
  const pathname = usePathname();

  // Render LogoutBar only if the path starts with "/dashboard"
  if (!pathname.startsWith('/dashboard')) {
    return null;
  }

  return <LogoutBar />;
}
