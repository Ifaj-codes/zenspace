'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Plus,
  LogOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';

export default function Navbar({ onOpenQuickAdd, onDataRefresh }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const navItems = [
    { label: 'Today', href: '/' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Notes', href: '/notes' },
  ];

  const handleReseed = async () => {
    try {
      setReseeding(true);
      await api.reseedDemo();
      if (onDataRefresh) onDataRefresh();
      alert('Demo data reloaded successfully.');
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setReseeding(false);
      setProfileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-light/85 dark:bg-surface-dark/85 backdrop-blur-md border-b border-border-subtle-light dark:border-border-subtle-dark transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Clean Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Subtle matcha icon leaf mark */}
            <span className="w-6 h-6 rounded-md bg-matcha-100 dark:bg-matcha-900/40 text-brand dark:text-brand-dark flex items-center justify-center font-serif font-bold text-xs shadow-xs border border-matcha-200 dark:border-matcha-800/50 group-hover:scale-105 transition-transform">
              Z
            </span>
            <span className="font-serif text-lg font-medium tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
              ZenSpace<span className="text-brand dark:text-brand-dark">.</span>
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition ${
                      isActive
                        ? 'text-brand dark:text-brand-dark bg-matcha-100/70 dark:bg-matcha-900/30 font-semibold'
                        : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-muted-light/60 dark:hover:bg-surface-muted-dark/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Quick capture button */}
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to light paper' : 'Switch to dark slate'}
                className="p-1.5 rounded-md text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-matcha-700" />}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-7 h-7 rounded-full bg-matcha-50 dark:bg-matcha-900/30 border border-matcha-200 dark:border-matcha-800/40 flex items-center justify-center text-xs font-semibold text-brand dark:text-brand-dark hover:border-brand dark:hover:border-brand-dark transition"
                >
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : 'I'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-border-subtle-light dark:border-border-subtle-dark">
                      <p className="font-medium text-ink-primary-light dark:text-ink-primary-dark">
                        {user?.name || 'Nesar Uddin Ifag'}
                      </p>
                      <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark truncate mt-0.5">
                        {user?.email || 'student@baiust.edu.bd'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-matcha-100 dark:bg-matcha-900/40 text-brand dark:text-brand-dark">
                          BAIUST
                        </span>
                        <span className="text-[10px] font-mono text-ink-muted-light dark:text-ink-muted-dark">
                          ID: {user?.studentId || '1119004'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleReseed}
                      disabled={reseeding}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin text-brand' : ''}`} />
                      <span>Reload sample data</span>
                    </button>

                    <div className="border-t border-border-subtle-light dark:border-border-subtle-dark pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded text-ink-secondary-light dark:text-ink-secondary-dark"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {isAuthenticated && (
        <div className="md:hidden flex items-center justify-around border-t border-border-subtle-light dark:border-border-subtle-dark py-2 bg-surface-light dark:bg-surface-dark">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1 px-3 text-xs font-medium rounded ${
                  isActive
                    ? 'text-brand dark:text-brand-dark bg-matcha-100/70 dark:bg-matcha-900/30 font-semibold'
                    : 'text-ink-muted-light dark:text-ink-muted-dark'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
