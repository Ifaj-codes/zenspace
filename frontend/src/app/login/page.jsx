'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  Sparkles,
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
      <header className="px-6 py-4 flex items-center justify-between border-b border-border-subtle-light dark:border-border-subtle-dark">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-6 h-6 rounded-md bg-matcha-100 dark:bg-matcha-900/40 text-brand dark:text-brand-dark flex items-center justify-center font-serif font-bold text-xs border border-matcha-200 dark:border-matcha-800/50">
            Z
          </span>
          <span className="font-serif text-lg font-medium tracking-tight">
            ZenSpace<span className="text-brand dark:text-brand-dark">.</span>
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-matcha-700" />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-matcha-100 dark:bg-matcha-900/40 text-brand dark:text-brand-dark inline-block mb-2">
              BAIUST · CSE 324 Web Technologies
            </span>
            <h1 className="text-2xl font-serif font-medium tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              Sign in to ZenSpace
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-1">
              Minimalist academic timetable, task manager & notebook
            </p>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-subtle-light dark:border-border-subtle-dark shadow-xs space-y-4">
            {/* 1-Click Fast Student Demo Access */}
            <div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light font-medium text-xs shadow-xs transition active:scale-[0.98] disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5 text-matcha-200" />
                <span>1-Click Student Demo Access</span>
              </button>
              <p className="font-mono text-[10px] text-center text-ink-muted-light dark:text-ink-muted-dark mt-1.5">
                Nesar Uddin Ifag · ID: 1119004 · BAIUST CSE
              </p>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-border-subtle-light dark:border-border-subtle-dark w-full" />
              <span className="bg-surface-light dark:bg-surface-dark px-2 font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                OR WITH CREDENTIALS
              </span>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Academic Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@baiust.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-3 rounded-lg border border-border-subtle-light dark:border-border-subtle-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark text-ink-primary-light dark:text-ink-primary-dark text-xs font-medium transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <span>{submitting ? 'Verifying...' : 'Sign in'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Need an account?{' '}
              <Link href="/register" className="font-semibold text-brand dark:text-brand-dark hover:underline">
                Create one here
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark border-t border-border-subtle-light dark:border-border-subtle-dark font-mono text-[11px]">
        CSE 324 Web Technologies Sessional · BAIUST, Cumilla · Yeakob Ali · Nesar Uddin Ifag (1119004)
      </footer>
    </div>
  );
}
