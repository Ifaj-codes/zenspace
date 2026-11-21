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
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

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

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-ink-primary-light dark:text-ink-primary-dark flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadTasks} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle-light dark:border-border-subtle-dark pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight">
              Tasks
            </h1>
            <p className="text-xs text-ink-secondary-light dark:text-ink-secondary-dark mt-0.5">
              Prioritized academic submissions and to-dos.
            </p>
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-ink-primary-light dark:bg-ink-primary-dark text-canvas-light dark:text-canvas-dark hover:opacity-90 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted-light dark:text-ink-muted-dark" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-muted-light dark:bg-surface-muted-dark border border-transparent focus:border-border-strong-light dark:focus:border-border-strong-dark outline-none text-xs placeholder:text-ink-muted-light"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-surface-muted-light dark:bg-surface-muted-dark border border-transparent outline-none text-ink-secondary-light dark:text-ink-secondary-dark"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-surface-muted-light dark:bg-surface-muted-dark border border-transparent outline-none text-ink-secondary-light dark:text-ink-secondary-dark"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="divide-y divide-border-subtle-light dark:divide-border-subtle-dark border-t border-border-subtle-light dark:border-border-subtle-dark">
          {tasks.length === 0 ? (
            <p className="py-12 text-center text-xs text-ink-muted-light dark:text-ink-muted-dark">
              No tasks found.
            </p>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task._id}
                  onClick={() => {
                    setSelectedTask(task);
                    setTaskModalOpen(true);
                  }}
                  className="py-3 flex items-start justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => handleToggleTask(task._id, e)}
                      className="mt-0.5 w-4 h-4 rounded-full border border-border-strong-light dark:border-border-strong-dark flex items-center justify-center hover:border-ink-primary-light transition shrink-0"
                    >
                      {isDone && <Check className="w-2.5 h-2.5 text-brand" />}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium ${
                          isDone
                            ? 'line-through text-ink-muted-light dark:text-ink-muted-dark'
                            : 'text-ink-primary-light dark:text-ink-primary-dark group-hover:text-brand'
                        } transition`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-ink-muted-light dark:text-ink-muted-dark line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-muted-light dark:text-ink-muted-dark">
                        <span>Due {task.dueDate}</span>
                        <span>•</span>
                        <span>{task.courseCode || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                      task.priority === 'High'
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                        : task.priority === 'Medium'
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              );
            })
          )}
        </div>
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
