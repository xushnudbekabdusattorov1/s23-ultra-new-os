/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Target, PenTool, Wind, Cpu } from 'lucide-react';
import { TabType, Task, SavedNote, WallpaperStyle, Language } from './types';
import { StatusBar } from './components/StatusBar';
import { EdgePanel } from './components/EdgePanel';
import { DailyFocus } from './components/DailyFocus';
import { SPenCanvas } from './components/SPenCanvas';
import { ZenTimer } from './components/ZenTimer';
import { DeviceView } from './components/DeviceView';
import { S23UltraFrame } from './components/S23UltraFrame';
import { sound } from './utils/audio';
import { translations } from './utils/i18n';
import {
  getSavedTasks,
  saveTasks,
  getSavedNotes,
  saveNotes,
  getAppSettings,
  saveAppSettings,
} from './utils/storage';

import mineralWallpaper from './assets/images/s23_ultra_mineral_wallpaper_1790226609333.jpg';
import creamWallpaper from './assets/images/s23_ultra_cream_wallpaper_1790226627311.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('focus');
  const [tasks, setTasks] = useState<Task[]>(getSavedTasks);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(getSavedNotes);
  const [settings, setSettings] = useState(getAppSettings);
  const [edgeOpen, setEdgeOpen] = useState(false);
  const [spenEjected, setSpenEjected] = useState(false);

  // Dynamic Time & Date for Samsung Viewing Zone
  const [currentTime, setCurrentTime] = useState<{ hours: string; mins: string; dateStr: string }>({
    hours: '12',
    mins: '00',
    dateStr: '',
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      
      const locale = settings.language === 'uz' ? 'uz-UZ' : settings.language === 'ru' ? 'ru-RU' : 'en-US';
      const dateStr = now.toLocaleDateString(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      setCurrentTime({ hours, mins, dateStr });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [settings.language]);

  // Sync state to storage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveNotes(savedNotes);
  }, [savedNotes]);

  useEffect(() => {
    saveAppSettings(settings);
    sound.setSoundEnabled(settings.soundEnabled);
  }, [settings]);

  // S-Pen Toggle Handler
  const handleSpenToggle = () => {
    setSpenEjected((prev) => {
      const next = !prev;
      if (next) {
        sound.playSpenClick();
        // If S-Pen is ejected, automatically take user to S-Pen memo pad (Samsung Screen-Off Memo behavior!)
        setActiveTab('spen');
      } else {
        sound.playSpenClick();
      }
      return next;
    });
  };

  const handleTabChange = (tab: TabType) => {
    sound.playHapticTick();
    setActiveTab(tab);
  };

  // Wallpaper selection URL
  const getWallpaperUrl = () => {
    if (settings.wallpaper === 'mineral') return mineralWallpaper;
    if (settings.wallpaper === 'cream') return creamWallpaper;
    return null;
  };

  const t = translations[settings.language];
  const isLightMode = settings.wallpaper === 'cream';

  return (
    <S23UltraFrame
      frameMode={settings.frameMode}
      spenEjected={spenEjected}
      onSpenToggle={handleSpenToggle}
      wallpaperUrl={getWallpaperUrl()}
      wallpaperStyle={settings.wallpaper}
    >
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        {/* TOP ZONE: One UI Status Bar */}
        <StatusBar
          spenEjected={spenEjected}
          onSpenToggle={handleSpenToggle}
          isLightMode={isLightMode}
        />

        {/* ONE UI VIEWING ZONE: Minimalist AMOLED Clock & Date */}
        <div className="px-6 pt-1 pb-3 flex items-end justify-between select-none">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tighter tabular-nums font-mono text-white">
                {currentTime.hours}:{currentTime.mins}
              </span>
            </div>
            {/* Zero-Pill Typography Metadata: clean unboxed with separator */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
              <span className="capitalize">{currentTime.dateStr}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">+22°C Ochiq</span>
            </div>
          </div>

          {/* Quick Subtitle Indicator */}
          <div className="text-right">
            <span className="text-[11px] font-medium text-neutral-400">
              {t.tabs[activeTab]}
            </span>
          </div>
        </div>

        {/* MIDDLE CONTENT ZONE: Active Screen Router */}
        <div className="flex-1 min-h-0 relative">
          {activeTab === 'focus' && (
            <DailyFocus
              tasks={tasks}
              onTasksChange={setTasks}
              lang={settings.language}
            />
          )}

          {activeTab === 'spen' && (
            <SPenCanvas
              savedNotes={savedNotes}
              onNotesChange={setSavedNotes}
              lang={settings.language}
              spenEjected={spenEjected}
              onSpenToggle={handleSpenToggle}
            />
          )}

          {activeTab === 'zen' && <ZenTimer lang={settings.language} />}

          {activeTab === 'device' && (
            <DeviceView
              currentWallpaper={settings.wallpaper}
              onWallpaperChange={(w: WallpaperStyle) =>
                setSettings((s) => ({ ...s, wallpaper: w }))
              }
              lang={settings.language}
              onLangChange={(l: Language) =>
                setSettings((s) => ({ ...s, language: l }))
              }
              soundEnabled={settings.soundEnabled}
              onSoundToggle={(enabled: boolean) =>
                setSettings((s) => ({ ...s, soundEnabled: enabled }))
              }
              frameMode={settings.frameMode}
              onFrameToggle={(enabled: boolean) =>
                setSettings((s) => ({ ...s, frameMode: enabled }))
              }
            />
          )}
        </div>

        {/* GALAXY EDGE PANEL (Slide-out drawer from right side) */}
        <EdgePanel
          isOpen={edgeOpen}
          onToggle={() => setEdgeOpen(!edgeOpen)}
          lang={settings.language}
        />

        {/* BOTTOM THUMB NAVIGATION ZONE (One UI Ergonomics) */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-neutral-950/85 backdrop-blur-xl border-t border-neutral-800/80 px-4 py-2.5">
          <nav className="grid grid-cols-4 items-center">
            {/* Focus Tab */}
            <button
              onClick={() => handleTabChange('focus')}
              className={`min-h-[46px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
                activeTab === 'focus'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Target className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {t.tabs.focus}
              </span>
            </button>

            {/* S-Pen Tab */}
            <button
              onClick={() => handleTabChange('spen')}
              className={`min-h-[46px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
                activeTab === 'spen'
                  ? 'text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {t.tabs.spen}
              </span>
            </button>

            {/* Zen Breath & Timer Tab */}
            <button
              onClick={() => handleTabChange('zen')}
              className={`min-h-[46px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
                activeTab === 'zen'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Wind className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {t.tabs.zen}
              </span>
            </button>

            {/* S23 Ultra Specs & Settings Tab */}
            <button
              onClick={() => handleTabChange('device')}
              className={`min-h-[46px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
                activeTab === 'device'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Cpu className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {t.tabs.device}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </S23UltraFrame>
  );
}
