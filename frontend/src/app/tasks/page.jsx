'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import QuickAddModal from '../../components/QuickAddModal';
import TaskModal from '../../components/TaskModal';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Kanban,
  List as ListIcon,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | pending | completed
  const [priorityFilter, setPriorityFilter] = useState('All'); // All | High | Medium | Low
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modals
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
    } catch (err) {
      console.error('Failed to load tasks:', err);
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
      console.error('Failed to toggle task:', err);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const highTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'completed');
  const mediumTasks = tasks.filter((t) => t.priority === 'Medium' && t.status !== 'completed');
  const lowTasks = tasks.filter((t) => t.priority === 'Low' && t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onOpenQuickAdd={() => setQuickAddOpen(true)} onDataRefresh={loadTasks} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Prioritized Academic Tasks
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                High • Medium • Low Levels
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track deadlines, organize coursework submissions, and maintain progress with one-click toggles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Priority Columns</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            <button
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or course (e.g. CSE 324)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {/* Status Filter */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl">
              {['All', 'pending', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-medium capitalize transition ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>
          </div>
        </div>

        {/* KANBAN PRIORITY COLUMNS VIEW */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: High Priority */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      High Priority
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    {highTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {highTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onSelect={(task) => {
                        setSelectedTask(task);
                        setTaskModalOpen(true);
                      }}
                      onToggle={handleToggleTask}
                    />
                  ))}
                  {highTasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8 italic">No high priority tasks</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setQuickAddOpen(true)}
                className="mt-4 w-full py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-400 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add High Task
              </button>
            </div>

            {/* Column 2: Medium Priority */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Medium Priority
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    {mediumTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {mediumTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onSelect={(task) => {
                        setSelectedTask(task);
                        setTaskModalOpen(true);
                      }}
                      onToggle={handleToggleTask}
                    />
                  ))}
                  {mediumTasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8 italic">No medium priority tasks</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setQuickAddOpen(true)}
                className="mt-4 w-full py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-400 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medium Task
              </button>
            </div>

            {/* Column 3: Low Priority */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Low Priority
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    {lowTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {lowTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onSelect={(task) => {
                        setSelectedTask(task);
                        setTaskModalOpen(true);
                      }}
                      onToggle={handleToggleTask}
                    />
                  ))}
                  {lowTasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8 italic">No low priority tasks</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setQuickAddOpen(true)}
                className="mt-4 w-full py-2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-400 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Low Task
              </button>
            </div>

            {/* Column 4: Completed */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Completed
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {completedTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {completedTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onSelect={(task) => {
                        setSelectedTask(task);
                        setTaskModalOpen(true);
                      }}
                      onToggle={handleToggleTask}
                    />
                  ))}
                  {completedTasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8 italic">No completed tasks yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No tasks match your query.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => {
                    setSelectedTask(t);
                    setTaskModalOpen(true);
                  }}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    <button
                      onClick={(e) => handleToggleTask(t._id, e)}
                      className="text-slate-400 hover:text-emerald-500 transition shrink-0"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          t.status === 'completed'
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      📅 {t.dueDate}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeClass(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.courseCode || 'General'}
                    </span>
                  </div>
                </div>
              ))
            )}
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

// Subcomponent: Task Card for Kanban
function TaskCard({ task, onSelect, onToggle }) {
  const isDone = task.status === 'completed';

  return (
    <div
      onClick={() => onSelect(task)}
      className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition cursor-pointer group space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            onClick={(e) => onToggle(task._id, e)}
            className="mt-0.5 text-slate-400 hover:text-emerald-500 transition shrink-0"
          >
            {isDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
          <p
            className={`text-xs font-semibold leading-snug ${
              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {task.title}
          </p>
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-6 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 pl-6 text-[10px] text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3" />
          {task.dueDate}
        </span>
        <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
          {task.courseCode || 'General'}
        </span>
      </div>
    </div>
  );
}
