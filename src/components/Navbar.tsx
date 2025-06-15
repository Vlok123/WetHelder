'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-3 p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link href="/" className="text-xl font-bold">
                WetHelder
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                  '/'
                )}`}
              >
                Home
              </Link>
              <Link
                href="/ask"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                  '/ask'
                )}`}
              >
                Vraag stellen
              </Link>

              {session ? (
                <>
                  <Link
                    href="/history"
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                      '/history'
                    )}`}
                  >
                    Geschiedenis
                  </Link>
                  <Link
                    href="/favorites"
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                      '/favorites'
                    )}`}
                  >
                    Favorieten
                  </Link>
                  <Link
                    href="/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                      '/profile'
                    )}`}
                  >
                    Profiel
                  </Link>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                        '/admin'
                      )}`}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                      '/login'
                    )}`}
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/register"
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                      '/register'
                    )}`}
                  >
                    Registreren
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-600 text-white transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-xl font-bold" onClick={closeSidebar}>
              WetHelder
            </Link>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            <Link
              href="/"
              onClick={closeSidebar}
              className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                '/'
              )}`}
            >
              Home
            </Link>
            <Link
              href="/ask"
              onClick={closeSidebar}
              className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                '/ask'
              )}`}
            >
              Vraag stellen
            </Link>

            {session ? (
              <>
                <Link
                  href="/history"
                  onClick={closeSidebar}
                  className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                    '/history'
                  )}`}
                >
                  Geschiedenis
                </Link>
                <Link
                  href="/favorites"
                  onClick={closeSidebar}
                  className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                    '/favorites'
                  )}`}
                >
                  Favorieten
                </Link>
                <Link
                  href="/profile"
                  onClick={closeSidebar}
                  className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                    '/profile'
                  )}`}
                >
                  Profiel
                </Link>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={closeSidebar}
                    className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                      '/admin'
                    )}`}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    closeSidebar();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeSidebar}
                  className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                    '/login'
                  )}`}
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  onClick={closeSidebar}
                  className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(
                    '/register'
                  )}`}
                >
                  Registreren
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
} 