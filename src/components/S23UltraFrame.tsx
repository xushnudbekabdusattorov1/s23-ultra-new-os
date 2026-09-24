import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';

interface S23UltraFrameProps {
  children: React.ReactNode;
  frameMode: boolean;
  spenEjected: boolean;
  onSpenToggle: () => void;
  wallpaperUrl: string | null;
  wallpaperStyle: string;
}

export const S23UltraFrame: React.FC<S23UltraFrameProps> = ({
  children,
  frameMode,
  spenEjected,
  onSpenToggle,
  wallpaperUrl,
  wallpaperStyle,
}) => {
  // If frame mode is disabled, render cleanly full screen
  if (!frameMode) {
    return (
      <div className="relative w-full h-screen max-w-md mx-auto overflow-hidden bg-black text-neutral-100 flex flex-col">
        {/* Dynamic Wallpaper Backdrop */}
        {wallpaperUrl && wallpaperStyle !== 'oled' && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none transition-opacity duration-700"
            style={{ backgroundImage: `url(${wallpaperUrl})` }}
          />
        )}
        {wallpaperStyle === 'botanic' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e1d14] via-[#09120c] to-black opacity-90 pointer-events-none" />
        )}
        <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
      </div>
    );
  }

  // Realistic Samsung Galaxy S23 Ultra Physical Frame
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-6 bg-[#0a0a0f] text-neutral-100 select-none overflow-x-hidden">
      {/* Outer Phone Enclosure (Iconic S23 Ultra squared corners) */}
      <div className="relative w-full max-w-[420px] h-[890px] max-h-[96vh] rounded-[30px] p-[10px] bg-gradient-to-b from-[#2e3136] via-[#1b1c1e] to-[#25282d] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col border border-neutral-700/60 transition-all">
        {/* Physical Right-Side Hardware Buttons */}
        <div className="absolute -right-[3px] top-[180px] w-[3px] h-[72px] bg-neutral-600 rounded-r-sm" title="Volume Keys" />
        <div className="absolute -right-[3px] top-[280px] w-[3px] h-[48px] bg-neutral-600 rounded-r-sm" title="Power / Bixby Key" />

        {/* Top Speaker Earpiece Slit */}
        <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-14 h-[2.5px] bg-neutral-800 rounded-full z-40 border border-neutral-700/40" />

        {/* Screen Bezel (S23 Ultra 6.8-inch Edge AMOLED Frame) */}
        <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-black flex flex-col border border-neutral-800/90 shadow-inner">
          {/* Centered Infinity-O Camera Cutout */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[13px] h-[13px] rounded-full bg-black border border-neutral-800/80 flex items-center justify-center pointer-events-none">
            <div className="w-[5px] h-[5px] rounded-full bg-[#0a192f] shadow-inner" />
          </div>

          {/* Wallpaper Layer */}
          {wallpaperUrl && wallpaperStyle !== 'oled' && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none transition-opacity duration-700"
              style={{ backgroundImage: `url(${wallpaperUrl})` }}
            />
          )}
          {wallpaperStyle === 'botanic' && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f2418] via-[#09150e] to-black opacity-90 pointer-events-none" />
          )}

          {/* Screen Glass Reflection Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-transparent pointer-events-none z-20" />

          {/* Core Interactive Screen Content */}
          <div className="relative z-30 w-full h-full flex flex-col">
            {children}
          </div>
        </div>

        {/* Bottom Hardware Bezel with S-Pen Ejector Click Slot */}
        <div className="absolute bottom-[2px] left-8 z-40">
          <button
            onClick={() => {
              sound.playSpenClick();
              onSpenToggle();
            }}
            title={spenEjected ? "S-Penni joylashtirish" : "S-Penni chiqarish (Bosish orqali)"}
            className="flex items-center gap-1.5 py-0.5 px-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 rounded-t text-[9px] text-amber-400 font-mono tracking-tight transition-transform active:scale-95"
          >
            {/* Animated S-Pen End Cap */}
            <motion.div
              animate={{ y: spenEjected ? 4 : 0 }}
              className="w-2.5 h-1.5 bg-neutral-400 rounded-sm border border-neutral-300"
            />
            <span>{spenEjected ? 'S-Pen Chiqarildi' : 'S-Pen Slot (Chiqarish)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
