'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, signup } from '@/app/actions/auth';
import ThreeCanvas from '@/components/ThreeCanvas';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="relative z-10 w-full max-w-md bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Campus Portal
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {mode === 'signin' ? 'Campus Login' : 'Create Student Account'}
        </h1>
        <p className="text-xs text-zinc-400">
          {mode === 'signin'
            ? 'Sign in to access your portal'
            : 'Enter your name, email, and password to register'}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            mode === 'signin'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`py-2 text-xs font-bold rounded-lg transition ${
            mode === 'signup'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form action={mode === 'signup' ? signup : login} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Full Name</label>
            <input
              name="fullName"
              type="text"
              required
              placeholder="e.g. Tanushree S N"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Email Address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@campus.edu"
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition"
        >
          {mode === 'signup' ? 'Create Student Account →' : 'Sign In →'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-6 selection:bg-indigo-500 selection:text-white">
      <ThreeCanvas />
      <Suspense fallback={<div className="relative z-10 text-xs font-mono text-zinc-500">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
