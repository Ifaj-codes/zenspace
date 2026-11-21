'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import QuickAddModal from '../../components/QuickAddModal';
import TaskModal from '../../components/TaskModal';
import {
  Check,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Quick inline add
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('High');

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getTasks({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
      });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      const res = await api.toggleTask(taskId);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: res.data.status } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      const todayISO = new Date().toISOString().split('T')[0];
      const res = await api.createTask({
        title: quickTitle.trim(),
        priority: quickPriority,
        dueDate: todayISO,
        courseCode: 'CSE 324',
      });
      if (res.success) {
        setTasks((prev) => [res.data, ...prev]);
        setQuickTitle('');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadTasks} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle-light dark:border-border-subtle-dark pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-brand dark:text-brand-dark px-2 py-0.5 rounded bg-matcha-100/70 dark:bg-matcha-900/30">
                Action Items
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight">
              Coursework & Tasks
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5">
              Prioritized academic submissions, lab deliverables, and daily study items.
            </p>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light shadow-xs transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Inline Quick Capture */}
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Capture an academic task or assignment... (Enter to save)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark focus:border-brand dark:focus:border-brand-dark outline-none transition text-ink-primary-light dark:text-ink-primary-dark placeholder:text-ink-muted-light dark:placeholder:text-ink-muted-dark shadow-xs"
          />
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark outline-none text-ink-secondary-light dark:text-ink-secondary-dark shadow-xs"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-brand hover:bg-brand-light dark:bg-brand-dark dark:hover:bg-brand-dark/90 text-white dark:text-ink-primary-light disabled:opacity-30 transition shadow-xs"
          >
            Add
          </button>
        </form>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs bg-surface-muted-light/40 dark:bg-surface-muted-dark/40 p-2 rounded-xl border border-border-subtle-light dark:border-border-subtle-dark">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted-light dark:text-ink-muted-dark" />
            <input
              type="text"
              placeholder="Filter tasks by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark focus:border-brand dark:focus:border-brand-dark outline-none text-xs placeholder:text-ink-muted-light text-ink-primary-light dark:text-ink-primary-dark"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark outline-none text-ink-secondary-light dark:text-ink-secondary-dark font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-subtle-light dark:border-border-subtle-dark outline-none text-ink-secondary-light dark:text-ink-secondary-dark font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
        </div>

        {/* Active Task List */}
        <div className="space-y-2">
          {activeTasks.length > 0 && (
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary-light dark:text-ink-secondary-dark flex items-center gap-1.5 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand dark:text-brand-dark" />
              Active ({activeTasks.length})
            </div>
          )}

          <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark border border-border-subtle-light dark:border-border-subtle-dark rounded-xl bg-surface-light dark:bg-surface-dark overflow-hidden shadow-xs">
            {activeTasks.length === 0 ? (
              <p className="py-10 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark">
                No active tasks under current filter.
              </p>
            ) : (
              activeTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => {
                    setSelectedTask(task);
                    setTaskModalOpen(true);
                  }}
                  className="py-3.5 px-4 flex items-start justify-between gap-3 group cursor-pointer hover:bg-surface-muted-light/40 dark:hover:bg-surface-muted-dark/40 transition"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => handleToggleTask(task._id, e)}
                      title="Mark complete"
                      className="mt-0.5 w-4 h-4 rounded-full border border-matcha-400 dark:border-matcha-600 flex items-center justify-center hover:bg-matcha-100 dark:hover:bg-matcha-900/50 hover:border-brand transition shrink-0 group-hover:scale-105"
                    >
                      {task.status === 'completed' && <Check className="w-2.5 h-2.5 text-brand dark:text-brand-dark" />}
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand dark:group-hover:text-brand-dark transition">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark line-clamp-1 mt-0.5 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-muted-light dark:text-ink-muted-dark font-mono">
                        <span>Due {task.dueDate}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-muted-light dark:bg-surface-muted-dark text-[10px]">
                          {task.courseCode || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'High'
                        ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40'
                        : task.priority === 'Medium'
                        ? 'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40'
                        : 'text-matcha-800 bg-matcha-50 dark:bg-matcha-900/30 dark:text-matcha-300 border border-matcha-200/60 dark:border-matcha-800/40'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Task Section */}
        {completedTasks.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted-light dark:text-ink-muted-dark font-mono">
              Completed Tasks ({completedTasks.length})
            </div>

            <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark border border-border-subtle-light dark:border-border-subtle-dark rounded-xl bg-surface-light/60 dark:bg-surface-dark/60 overflow-hidden">
              {completedTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => {
                    setSelectedTask(task);
                    setTaskModalOpen(true);
                  }}
                  className="py-3 px-4 flex items-center justify-between gap-3 group cursor-pointer hover:bg-surface-muted-light/30 transition opacity-70 hover:opacity-100"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => handleToggleTask(task._id, e)}
                      title="Mark pending"
                      className="w-4 h-4 rounded-full bg-brand dark:bg-brand-dark text-white flex items-center justify-center shrink-0"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </button>
                    <p className="text-xs line-through text-ink-muted-light dark:text-ink-muted-dark truncate">
                      {task.title}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted-light dark:text-ink-muted-dark shrink-0">
                    {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        initialTab="task"
        onCreated={() => loadTasks()}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        onUpdated={() => loadTasks()}
        onDeleted={() => loadTasks()}
      />
    </div>
  );
}
