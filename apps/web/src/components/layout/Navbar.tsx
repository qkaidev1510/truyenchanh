'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore.js';

export function Navbar() {
  const { user, clearAuth } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-indigo-600">TruyenChanh</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-700 hover:text-indigo-600">
              Home
            </Link>

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm text-gray-700 hover:text-indigo-600">
                    Admin
                  </Link>
                )}
                <button
                  onClick={clearAuth}
                  className="text-sm text-gray-700 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
