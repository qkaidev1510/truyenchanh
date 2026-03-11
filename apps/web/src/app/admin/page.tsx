'use client';

import React from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useMangaList } from '../../hooks/useManga.js';

export default function AdminPage() {
  const { user } = useAuthStore();
  const { data } = useMangaList();

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required.</p>
        </div>
      </div>
    );
  }

  const mangas = data?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CMS Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-indigo-600">{mangas.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Manga</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600">
            {mangas.filter((m) => m.status === 'ONGOING').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Ongoing</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600">
            {mangas.filter((m) => m.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Completed</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Manga List</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mangas.map((manga) => (
              <tr key={manga.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{manga.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{manga.status}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {manga.viewCount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
