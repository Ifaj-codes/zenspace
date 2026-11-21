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
  GraduationCap,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'CSE',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(form);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-matcha-100 dark:bg-matcha-900/40 text-brand dark:text-brand-dark inline-block mb-2">
              BAIUST · Student Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              Create ZenSpace Account
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-1">
              Begin your calm, clutter-free academic semester
            </p>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 sm:p-7 border border-border-subtle-light dark:border-border-subtle-dark shadow-xs space-y-4">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nesar Uddin Ifag"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1119004"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark outline-none transition font-medium"
                  >
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="CE">CE</option>
                    <option value="BBA">BBA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Academic Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@baiust.edu.bd"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle-light dark:border-border-subtle-dark bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark focus:border-brand dark:focus:border-brand-dark outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-3 rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light text-xs font-medium shadow-xs transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-brand dark:text-brand-dark hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark border-t border-border-subtle-light dark:border-border-subtle-dark font-mono text-[11px]">
        CSE 324 Web Technologies Sessional · BAIUST, Cumilla
      </footer>
    </div>
  );
}
