'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Jobs', path: '/dashboard/companies' },
    { name: 'Support', path: '/support' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/aboutUs' },
    { name: 'Contact Us', path: '/contactUs' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-black w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 cursor-pointer">
            <Image src="/favicon.ico" alt="Logo" width={62} height={15} />
          </Link>
          
          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <li
                key={link.name}
                className="relative group hidden lg:block"
              >
                <Link
                  href={link.path}
                  className="block py-3 text-white hover:text-zinc-500 transition-all duration-200"
                >
                  {link.name}
                </Link>
                <div className="absolute rounded-lg bottom-0 w-full h-1 bg-gradient-to-r from-[#00b5ad] via-[#1e40af] to-[#6b21a8] hidden group-hover:block transition-all duration-200"></div>
              </li>
            ))}
          </ul>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-base px-5 py-2.5"
            >
              Log in
            </button>
            <button
              onClick={() => router.push('/register')}
              className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-base px-5 py-2.5"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-zinc-500 transition"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-3 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/login');
              }}
              className="block w-full text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-base px-3 py-2 text-center"
            >
              Log in
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/register');
              }}
              className="block w-full text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-base px-3 py-2 text-center"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
