import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Droplets, Radio } from 'lucide-react';
import { AmbientSound, Language } from '../types';
import { translations } from '../utils/i18n';
import { sound } from '../utils/audio';

interface ZenTimerProps {
  lang: Language;
}

export const ZenTimer: React.FC<ZenTimerProps> = ({ lang }) => {
  const t = translations[lang].zen;

  // Mode: 'pomodoro' | 'breathe'
  const [mode, setMode] = useState<'pomodoro' | 'breathe'>('pomodoro');

  // Pomodoro state
  const [isFocusPhase, setIsFocusPhase] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // 4-7-8 Breathing state
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Soundscape state
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');

  // Pomodoro timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      sound.playZenChime();
      if (isFocusPhase) {
        setIsFocusPhase(false);
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setIsFocusPhase(true);
        setTimeLeft(25 * 60); // 25 min work
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isFocusPhase]);

  // Breathing loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            sound.playHapticTick();
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  // Ambient sound handler
  const handleAmbientChange = (type: AmbientSound) => {
    sound.playHapticTick();
    if (ambientSound === type) {
      sound.stopAmbient();
      setAmbientSound('none');
    } else {
      setAmbientSound(type);
      if (type !== 'none') {
        sound.startAmbient(type);
      } else {
        sound.stopAmbient();
      }
    }
  };

  // Stop ambient sound on unmount
  useEffect(() => {
    return () => {
      sound.stopAmbient();
    };
  }, []);

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalPhaseTime = isFocusPhase ? 25 * 60 : 5 * 60;
  const pomodoroPercent = Math.round(((totalPhaseTime - timeLeft) / totalPhaseTime) * 100);

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24 px-4 pt-1">
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-4">
        <button
          onClick={() => {
            sound.playHapticTick();
            setMode('pomodoro');
            setIsBreathingActive(false);
          }}
          className={`py-2 text-xs font-medium rounded-lg transition-colors ${
            mode === 'pomodoro' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {t.pomodoro}
        </button>
        <button
          onClick={() => {
            sound.playHapticTick();
            setMode('breathe');
            setIsRunning(false);
          }}
          className={`py-2 text-xs font-medium rounded-lg transition-colors ${
            mode === 'breathe' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {t.breathe}
        </button>
      </div>

      {/* Main Focus / Breathing Arena */}
      {mode === 'pomodoro' ? (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col items-center justify-center mb-4 relative overflow-hidden backdrop-blur-md">
          {/* Phase Badge */}
          <div className="text-xs font-medium text-emerald-400 mb-4 tracking-wide uppercase">
            {isFocusPhase ? t.focusPhase : t.breakPhase}
          </div>

          {/* Minimalist Clock Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-neutral-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-emerald-500 transition-all duration-300"
                strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * pomodoroPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-bold font-mono tracking-tight tabular-nums text-white">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1">
                {pomodoroPercent}% yakunlandi
              </p>
            </div>
          </div>

          {/* Play/Pause Controls */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => {
                sound.playHapticTick();
                setIsRunning(!isRunning);
              }}
              className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={() => {
                sound.playHapticTick();
                setIsRunning(false);
                setTimeLeft(25 * 60);
                setIsFocusPhase(true);
              }}
              className="w-12 h-12 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col items-center justify-center mb-4 relative overflow-hidden backdrop-blur-md min-h-[300px]">
          {/* Breathing Visualizer */}
          <div className="relative w-48 h-48 flex items-center justify-center my-3">
            <motion.div
              animate={{
                scale: isBreathingActive
                  ? breathPhase === 'inhale'
                    ? [1, 1.45]
                    : breathPhase === 'hold'
                    ? 1.45
                    : [1.45, 1]
                  : 1,
                opacity: isBreathingActive ? [0.4, 0.9, 0.4] : 0.3,
              }}
              transition={{
                duration:
                  breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 7 : 8,
                ease: 'easeInOut',
              }}
              className="absolute w-32 h-32 rounded-full bg-emerald-500/20 border border-emerald-500/40 blur-sm"
            />
            <div className="relative z-10 text-center">
              <span className="text-3xl font-bold font-mono tabular-nums text-white">
                {breathSeconds}s
              </span>
              <p className="text-xs font-medium text-emerald-400 mt-1">
                {breathPhase === 'inhale'
                  ? t.inhale
                  : breathPhase === 'hold'
                  ? t.hold
                  : t.exhale}
              </p>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={() => {
              sound.playHapticTick();
              setIsBreathingActive(!isBreathingActive);
              if (!isBreathingActive) {
                setBreathPhase('inhale');
                setBreathSeconds(4);
              }
            }}
            className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md"
          >
            {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isBreathingActive ? t.pause : t.start}</span>
          </button>
        </div>
      )}

      {/* Procedural Ambient Sound Generator */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-200">{t.ambientSound}</span>
          </div>
          {ambientSound !== 'none' && (
            <span className="text-[10px] text-emerald-400 animate-pulse">
              Ijro etilmoqda...
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAmbientChange('rain')}
            className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-colors ${
              ambientSound === 'rain'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-neutral-800 bg-neutral-800/40 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span className="text-[10px]">{t.sounds.rain}</span>
          </button>

          <button
            onClick={() => handleAmbientChange('binaural')}
            className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-colors ${
              ambientSound === 'binaural'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-neutral-800 bg-neutral-800/40 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span className="text-[10px]">{t.sounds.binaural}</span>
          </button>

          <button
            onClick={() => handleAmbientChange('forest')}
            className={`py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-colors ${
              ambientSound === 'forest'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-neutral-800 bg-neutral-800/40 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span className="text-[10px]">{t.sounds.forest}</span>
          </button>
        </div>

        {ambientSound !== 'none' && (
          <button
            onClick={() => handleAmbientChange('none')}
            className="w-full mt-2.5 py-1.5 rounded-lg bg-neutral-800/80 text-[11px] text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Sadolarni to‘xtatish</span>
          </button>
        )}
      </div>
    </div>
  );
};
