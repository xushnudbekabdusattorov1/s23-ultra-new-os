import React from 'react';
import { Smartphone, Cpu, Eye, Volume2, Globe, Check, Layers } from 'lucide-react';
import { WallpaperStyle, Language } from '../types';
import { translations } from '../utils/i18n';
import { sound } from '../utils/audio';

interface DeviceViewProps {
  currentWallpaper: WallpaperStyle;
  onWallpaperChange: (w: WallpaperStyle) => void;
  lang: Language;
  onLangChange: (l: Language) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  frameMode: boolean;
  onFrameToggle: (enabled: boolean) => void;
}

export const DeviceView: React.FC<DeviceViewProps> = ({
  currentWallpaper,
  onWallpaperChange,
  lang,
  onLangChange,
  soundEnabled,
  onSoundToggle,
  frameMode,
  onFrameToggle,
}) => {
  const t = translations[lang].device;

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24 px-4 pt-1 space-y-4">
      {/* S23 Ultra Architecture Overview */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-white tracking-tight">{t.specsHeader}</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-200">{t.processor}</p>
              <p className="text-[10px] text-neutral-400">Adreno 740 GPU & NPU tezlatgichi</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <Eye className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-200">{t.display}</p>
              <p className="text-[10px] text-neutral-400">1750 nit maksimal yorqinlik, Vision Booster</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-200">{t.spenLatency}</p>
              <p className="text-[10px] text-neutral-400">4,096 bosim darajasi va Air Actions harakatlari</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallpaper & Theme Picker */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <h4 className="text-xs font-semibold text-neutral-200 mb-3">{t.themeTitle}</h4>

        <div className="grid grid-cols-2 gap-2">
          {/* OLED Black */}
          <button
            onClick={() => {
              sound.playHapticTick();
              onWallpaperChange('oled');
            }}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
              currentWallpaper === 'oled'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40'
            }`}
          >
            <div>
              <div className="w-5 h-5 rounded-full bg-black border border-neutral-700 mb-1" />
              <p className="text-xs font-medium text-white">{t.themeOled}</p>
            </div>
            {currentWallpaper === 'oled' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Obsidian Mineral */}
          <button
            onClick={() => {
              sound.playHapticTick();
              onWallpaperChange('mineral');
            }}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
              currentWallpaper === 'mineral'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40'
            }`}
          >
            <div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-slate-900 via-neutral-800 to-emerald-950 border border-neutral-700 mb-1" />
              <p className="text-xs font-medium text-white">{t.themeMineral}</p>
            </div>
            {currentWallpaper === 'mineral' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Botanic Green */}
          <button
            onClick={() => {
              sound.playHapticTick();
              onWallpaperChange('botanic');
            }}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
              currentWallpaper === 'botanic'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40'
            }`}
          >
            <div>
              <div className="w-5 h-5 rounded-full bg-[#1b3022] border border-neutral-700 mb-1" />
              <p className="text-xs font-medium text-white">{t.themeBotanic}</p>
            </div>
            {currentWallpaper === 'botanic' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Ceramic Cream */}
          <button
            onClick={() => {
              sound.playHapticTick();
              onWallpaperChange('cream');
            }}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
              currentWallpaper === 'cream'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40'
            }`}
          >
            <div>
              <div className="w-5 h-5 rounded-full bg-[#e8e4dc] border border-neutral-400 mb-1" />
              <p className="text-xs font-medium text-white">{t.themeCream}</p>
            </div>
            {currentWallpaper === 'cream' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-neutral-200">{t.language}</h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['uz', 'en', 'ru'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                sound.playHapticTick();
                onLangChange(l);
              }}
              className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                lang === l
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
              }`}
            >
              {l === 'uz' ? "O'zbekcha" : l === 'en' ? 'English' : 'Русский'}
            </button>
          ))}
        </div>
      </div>

      {/* Tactile Haptic Audio Toggle */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-neutral-200">{t.hapticTitle}</p>
            <p className="text-[10px] text-neutral-400">{t.hapticDesc}</p>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !soundEnabled;
            sound.setSoundEnabled(next);
            onSoundToggle(next);
            if (next) sound.playHapticTick();
          }}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
            soundEnabled ? 'bg-emerald-600' : 'bg-neutral-800'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              soundEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Frame Mode Toggle (S23 Ultra Case vs Fullscreen) */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-neutral-200">{t.viewModeTitle}</p>
            <p className="text-[10px] text-neutral-400">{t.frameToggle}</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playHapticTick();
            onFrameToggle(!frameMode);
          }}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
            frameMode ? 'bg-emerald-600' : 'bg-neutral-800'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              frameMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
