'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowRight,
  Lock,
  Mail,
  Sun,
  Moon,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await loginDemo();
      if (res.success) {
        router.push('/');
      } else {
        setError(res.message || 'Demo login failed');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark transition-colors">
      <header className="px-6 py-4 flex items-center justify-between border-b border-hairline-light dark:border-hairline-dark">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark flex items-center justify-center font-mono font-bold text-xs">
            Z
          </span>
          <span className="font-bold text-sm tracking-tight">ZenSpace</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-ochre-dark" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted-light dark:text-ink-muted-dark block mb-1">
              CSE 324 // Sessional Platform
            </span>
            <h1 className="text-xl font-bold tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              ZenSpace Workstation
            </h1>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-hairline-light dark:border-hairline-dark shadow-tactile space-y-4">
            {/* 1-Click Fast Student Demo Access */}
            <div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-ink-primary-light hover:bg-black dark:bg-ink-primary-dark dark:hover:bg-white text-canvas-light dark:text-canvas-dark font-mono text-xs font-semibold shadow-tactile transition active:scale-[0.98] disabled:opacity-60"
              >
                <Zap className="w-3.5 h-3.5 text-ochre-dark" />
                <span>1-Click Demo Login (Nesar Uddin)</span>
              </button>
              <p className="font-mono text-[10px] text-center text-ink-muted-light dark:text-ink-muted-dark mt-1.5">
                BAIUST CSE • ID: 1119004 • Pre-seeded dataset
              </p>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-hairline-light dark:border-hairline-dark w-full" />
              <span className="bg-surface-light dark:bg-surface-dark px-2 font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                OR
              </span>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-vermilion-bg dark:bg-vermilion-bg-dark border border-vermilion/30 text-vermilion dark:text-vermilion-dark text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Academic Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@baiust.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-ink-primary-light outline-none transition font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-ink-primary-light outline-none transition font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-3 rounded-md border border-hairline-strong-light dark:border-hairline-strong-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark text-ink-primary-light dark:text-ink-primary-dark font-mono text-xs font-semibold transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <span>{submitting ? 'Verifying...' : 'Sign In'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Need an account?{' '}
              <Link href="/register" className="font-semibold text-ink-primary-light dark:text-ink-primary-dark hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-3 text-center font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark border-t border-hairline-light dark:border-hairline-dark">
        BAIUST CSE 324 • Supervisor: Yeakob Ali • Student: Nesar Uddin Ifag (1119004)
      </footer>
    </div>
  );
}
