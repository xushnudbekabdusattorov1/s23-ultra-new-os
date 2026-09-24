import React, { useState } from 'react';
import { Plus, Check, Trash2, Calendar, Target } from 'lucide-react';
import { Task, TaskCategory, Language } from '../types';
import { translations } from '../utils/i18n';
import { sound } from '../utils/audio';

interface DailyFocusProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  lang: Language;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ tasks, onTasksChange, lang }) => {
  const t = translations[lang].focus;
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('ish');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sound.playHapticTick();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: inputText.trim(),
      completed: false,
      category: selectedCategory,
      createdAt: Date.now(),
    };

    onTasksChange([newTask, ...tasks]);
    setInputText('');
  };

  const handleToggleTask = (id: string) => {
    sound.playHapticTick();
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) sound.playZenChime();
        return { ...t, completed: nextState };
      }
      return t;
    });
    onTasksChange(updated);
  };

  const handleDeleteTask = (id: string) => {
    sound.playHapticTick();
    onTasksChange(tasks.filter((t) => t.id !== id));
  };

  // Calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24 px-4 pt-1">
      {/* Upper Area: Progress & Daily Intention Ring */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 mb-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.progress}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-mono">{completedCount}/{totalCount}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              {progressPercent}%
            </h2>
          </div>

          {/* SVG Progress Circle */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-500"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-mono tabular-nums text-neutral-300">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Task Creation Input */}
      <form onSubmit={handleAddTask} className="mb-4">
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-xl p-1.5 focus-within:border-emerald-500/60 transition-colors shadow-sm">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 px-3 py-2 text-xs text-neutral-100 bg-transparent placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="min-h-[38px] px-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addBtn}</span>
          </button>
        </div>

        {/* Category Picker (Zero Pill Rule: Clean Segmented Bar) */}
        <div className="flex items-center gap-2 mt-2 px-1 text-[11px] text-neutral-400">
          <span>Kategoriya:</span>
          {(['ish', 'shaxsiy', 'fikr', 'maqsad'] as TaskCategory[]).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => {
                sound.playHapticTick();
                setSelectedCategory(cat);
              }}
              className={`transition-colors capitalize ${
                selectedCategory === cat
                  ? 'text-emerald-400 font-semibold underline underline-offset-4 decoration-emerald-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t.categories[cat]}
            </button>
          ))}
        </div>
      </form>

      {/* Filter Tabs (Interactive Segmented Control) */}
      <div className="flex items-center justify-between mb-3 border-b border-neutral-800/80 pb-2">
        <div className="flex items-center gap-1 bg-neutral-900/60 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => {
              sound.playHapticTick();
              setFilter('all');
            }}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => {
              sound.playHapticTick();
              setFilter('active');
            }}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'active' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.active}
          </button>
          <button
            onClick={() => {
              sound.playHapticTick();
              setFilter('completed');
            }}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'completed' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.completed}
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 tabular-nums">
          {filteredTasks.length} ta
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
            <p>{t.noTasks}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`min-h-[52px] px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-neutral-900/30 border-neutral-800/50 opacity-60'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Checkbox & Text */}
              <div
                onClick={() => handleToggleTask(task.id)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                    task.completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-neutral-700 bg-neutral-800/40 hover:border-neutral-500'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium leading-relaxed truncate ${
                      task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                    }`}
                  >
                    {task.text}
                  </p>
                  {/* Zero-Pill Metadata Discipline: Clean unboxed text with dot separator */}
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                    <span>{t.categories[task.category]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                aria-label="Delete task"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-neutral-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-neutral-800/50 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
