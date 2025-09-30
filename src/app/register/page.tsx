'use client';

import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options:{
        data: {
            full_name: fullName
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Daftar Akun Baru
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Buat akun untuk mulai menggunakan sistem.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              // BARIS INI YANG MEMPERBAIKI ERRORNYA
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Daftar
          </button>
        </form>

        {message && (
          <div className="p-4 text-sm text-center text-green-700 bg-green-100 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 text-sm text-center text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}