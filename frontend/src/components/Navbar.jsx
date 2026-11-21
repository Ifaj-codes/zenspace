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
      alert('Demo data reloaded.');
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
    <header className="sticky top-0 z-40 w-full bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-subtle-light dark:border-border-subtle-dark transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between py-2.5">
        {/* Brand & Clean Nav */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif italic text-lg font-medium text-ink-primary-light dark:text-ink-primary-dark tracking-tight">
              ZenSpace
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
                    className={`px-3 py-1 text-[13px] font-medium rounded-md transition ${
                      isActive
                        ? 'text-ink-primary-light dark:text-ink-primary-dark bg-surface-muted-light dark:bg-surface-muted-dark'
                        : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark'
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
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              <button
                onClick={toggleTheme}
                title={isDark ? 'Light' : 'Dark'}
                className="p-1.5 rounded-md text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-7 h-7 rounded-full bg-surface-muted-light dark:bg-surface-muted-dark border border-border-subtle-light dark:border-border-subtle-dark flex items-center justify-center text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:border-border-strong-light dark:hover:border-border-strong-dark transition"
                >
                  {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark shadow-lg py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-border-subtle-light dark:border-border-subtle-dark">
                      <p className="font-medium text-ink-primary-light dark:text-ink-primary-dark">{user?.name}</p>
                      <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark truncate mt-0.5">{user?.email}</p>
                      <p className="font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark mt-1">
                        BAIUST • ID {user?.studentId || '1119004'}
                      </p>
                    </div>

                    <button
                      onClick={handleReseed}
                      disabled={reseeding}
                      className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-muted-light dark:hover:bg-surface-muted-dark transition"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
                      <span>Reload sample data</span>
                    </button>

                    <div className="border-t border-border-subtle-light dark:border-border-subtle-dark pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
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
                className="px-3 py-1 text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {isAuthenticated && (
        <div className="md:hidden flex items-center justify-around border-t border-border-subtle-light dark:border-border-subtle-dark py-1.5 bg-surface-light dark:bg-surface-dark">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1 px-3 text-xs font-medium ${
                  isActive
                    ? 'text-ink-primary-light dark:text-ink-primary-dark font-semibold'
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
