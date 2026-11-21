'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Calendar,
  CheckSquare,
  FileText,
  LayoutGrid,
  Moon,
  Sun,
  Plus,
  LogOut,
  RotateCcw,
  Command,
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
    { label: 'Workspace', href: '/', icon: LayoutGrid },
    { label: 'Timetable', href: '/calendar', icon: Calendar },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Notebook', href: '/notes', icon: FileText },
  ];

  const handleReseed = async () => {
    try {
      setReseeding(true);
      await api.reseedDemo();
      if (onDataRefresh) onDataRefresh();
      alert('Academic demo data re-synchronized.');
    } catch (e) {
      alert('Failed to reset: ' + e.message);
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
    <header className="sticky top-0 z-40 w-full bg-surface-light/95 dark:bg-surface-dark/95 border-b border-hairline-light dark:border-hairline-dark backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Academic Index */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-6 h-6 rounded bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark flex items-center justify-center font-mono font-bold text-xs">
              Z
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm tracking-tight text-ink-primary-light dark:text-ink-primary-dark">
                ZenSpace
              </span>
              <span className="hidden sm:inline font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark tracking-wider">
                CSE 324 // BAIUST
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 border-l border-hairline-light dark:border-hairline-dark pl-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-surface-subtle-light dark:bg-surface-subtle-dark text-ink-primary-light dark:text-ink-primary-dark font-semibold'
                        : 'text-ink-secondary-light dark:text-ink-secondary-dark hover:text-ink-primary-light dark:hover:text-ink-primary-dark hover:bg-surface-subtle-light/60 dark:hover:bg-surface-subtle-dark/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Quick Add Button */}
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-ink-primary-light hover:bg-black dark:bg-ink-primary-dark dark:hover:bg-white text-canvas-light dark:text-canvas-dark text-xs font-medium shadow-tactile transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Item</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light' : 'Switch to Dark'}
                className="p-1.5 rounded-md text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-ochre-dark" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition border border-transparent hover:border-hairline-light dark:hover:border-hairline-dark"
                >
                  <div className="w-7 h-7 rounded bg-surface-subtle-light dark:bg-surface-subtle-dark border border-hairline-light dark:border-hairline-dark flex items-center justify-center font-mono text-[11px] font-semibold text-ink-primary-light dark:text-ink-primary-dark">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'IF'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold leading-tight text-ink-primary-light dark:text-ink-primary-dark">
                      {user?.name || 'Nesar Uddin Ifag'}
                    </p>
                    <p className="font-mono text-[10px] text-ink-muted-light dark:text-ink-muted-dark">
                      ID: {user?.studentId || '1119004'}
                    </p>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 rounded-lg bg-surface-light dark:bg-surface-dark shadow-lg border border-hairline-light dark:border-hairline-dark py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-hairline-light dark:border-hairline-dark">
                      <p className="font-semibold text-ink-primary-light dark:text-ink-primary-dark">{user?.name}</p>
                      <p className="font-mono text-[11px] text-ink-muted-light dark:text-ink-muted-dark mt-0.5">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-surface-subtle-light dark:bg-surface-subtle-dark border border-hairline-light dark:border-hairline-dark">
                          ID: {user?.studentId || '1119004'}
                        </span>
                        <span className="text-pine-dark dark:text-pine-dark font-medium">
                          CSE // BAIUST
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleReseed}
                        disabled={reseeding}
                        className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark transition text-xs"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
                        <span>Reset Sample Data</span>
                      </button>
                    </div>

                    <div className="border-t border-hairline-light dark:border-hairline-dark pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-vermilion hover:bg-vermilion-bg dark:hover:bg-vermilion-bg-dark transition text-xs font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
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
                className="p-1.5 rounded text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <Link
                href="/login"
                className="px-3 py-1 text-xs font-medium rounded-md border border-hairline-light dark:border-hairline-dark hover:bg-surface-subtle-light dark:hover:bg-surface-subtle-dark"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {isAuthenticated && (
        <div className="md:hidden flex items-center justify-around border-t border-hairline-light dark:border-hairline-dark bg-surface-light dark:bg-surface-dark py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[11px] font-medium ${
                  isActive
                    ? 'text-ink-primary-light dark:text-ink-primary-dark font-bold'
                    : 'text-ink-muted-light dark:text-ink-muted-dark'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
