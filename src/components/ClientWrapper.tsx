"use client";

import { usePathname } from "next/navigation";
import SelectedCompany from "../app/dashboard/components/SelectCompany";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Check if the current route is /dashboard or any of its children
  const showSelectedCompany = pathname.startsWith("/dashboard");

  return (
    <>
      {showSelectedCompany && <SelectedCompany />}
      {children}
    </>
  );
};

export default ClientWrapper;
