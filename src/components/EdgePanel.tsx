import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, Calculator, FileText, Timer, Play, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import { Language } from '../types';
import { translations } from '../utils/i18n';

interface EdgePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  lang: Language;
}

type EdgeTool = 'ruler' | 'calc' | 'memo' | 'timer';

export const EdgePanel: React.FC<EdgePanelProps> = ({ isOpen, onToggle, lang }) => {
  const t = translations[lang].edge;
  const [activeTool, setActiveTool] = useState<EdgeTool>('ruler');

  // Calculator state
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<string | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // Quick Memo state
  const [stickyNote, setStickyNote] = useState<string>(() => {
    return localStorage.getItem('szenith_sticky_memo') || '';
  });

  // Quick Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('szenith_sticky_memo', stickyNote);
  }, [stickyNote]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            sound.playZenChime();
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Calc handlers
  const handleCalcNum = (digit: string) => {
    sound.playHapticTick();
    setCalcInput((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleCalcOp = (op: string) => {
    sound.playHapticTick();
    setCalcPrev(calcInput);
    setCalcOp(op);
    setCalcInput('0');
  };

  const handleCalcEqual = () => {
    sound.playHapticTick();
    if (!calcPrev || !calcOp) return;
    const p = parseFloat(calcPrev);
    const c = parseFloat(calcInput);
    let result = 0;
    if (calcOp === '+') result = p + c;
    if (calcOp === '−') result = p - c;
    if (calcOp === '×') result = p * c;
    if (calcOp === '÷') result = c !== 0 ? p / c : 0;

    const formatted = parseFloat(result.toFixed(6)).toString();
    setCalcInput(formatted);
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    sound.playHapticTick();
    setCalcInput('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  return (
    <>
      {/* Draggable/Clickable Edge Tab Handle on right bezel */}
      <button
        onClick={() => {
          sound.playHapticTick();
          onToggle();
        }}
        aria-label="Samsung Edge Panel"
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-40 w-3.5 h-16 rounded-l-full bg-neutral-400/40 hover:bg-neutral-300/80 active:scale-95 backdrop-blur-md transition-all flex items-center justify-center shadow-lg ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'
        }`}
      >
        <div className="w-1 h-6 rounded-full bg-white/70" />
      </button>

      {/* Slide-out Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onToggle}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end"
          >
            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[280px] h-full bg-neutral-900/95 border-l border-neutral-800 text-neutral-100 flex flex-col shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-white">{t.title}</h3>
                  <p className="text-[11px] text-neutral-400">{t.subtitle}</p>
                </div>
                <button
                  onClick={() => {
                    sound.playHapticTick();
                    onToggle();
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tool Selector Tabs */}
              <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-950/60 border-b border-neutral-800/80">
                <button
                  onClick={() => {
                    sound.playHapticTick();
                    setActiveTool('ruler');
                  }}
                  className={`py-1.5 text-xs font-medium rounded flex flex-col items-center gap-1 transition-colors ${
                    activeTool === 'ruler' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{t.ruler}</span>
                </button>
                <button
                  onClick={() => {
                    sound.playHapticTick();
                    setActiveTool('calc');
                  }}
                  className={`py-1.5 text-xs font-medium rounded flex flex-col items-center gap-1 transition-colors ${
                    activeTool === 'calc' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{t.calc}</span>
                </button>
                <button
                  onClick={() => {
                    sound.playHapticTick();
                    setActiveTool('memo');
                  }}
                  className={`py-1.5 text-xs font-medium rounded flex flex-col items-center gap-1 transition-colors ${
                    activeTool === 'memo' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{t.memo}</span>
                </button>
                <button
                  onClick={() => {
                    sound.playHapticTick();
                    setActiveTool('timer');
                  }}
                  className={`py-1.5 text-xs font-medium rounded flex flex-col items-center gap-1 transition-colors ${
                    activeTool === 'timer' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{t.timer}</span>
                </button>
              </div>

              {/* Active Tool Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                {/* TOOL 1: RULER */}
                {activeTool === 'ruler' && (
                  <div className="h-full flex flex-row">
                    <div className="flex-1 pr-2 flex flex-col justify-center text-xs text-neutral-400 space-y-2">
                      <p className="font-semibold text-neutral-200">S23 Ultra Ekran Chizg‘ichi</p>
                      <p className="text-[11px] leading-relaxed">
                        Qurilmangiz ekraniga biror narsani qo‘yib, o‘lchamini millimetrda darhol aniqlang.
                      </p>
                      <div className="p-2 rounded bg-neutral-800/40 text-[10px] text-neutral-300">
                        1:1 aniqlikdagi metrik shkala
                      </div>
                    </div>

                    {/* Accurate Ruler Strip */}
                    <div className="w-16 h-full bg-neutral-950 border-l border-neutral-800 flex flex-col justify-between py-2 select-none">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-end pr-1 text-[9px] text-neutral-500 font-mono">
                          <span className="mr-1 tabular-nums">{i * 10}</span>
                          <div className="w-3 h-[1px] bg-neutral-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TOOL 2: CALCULATOR */}
                {activeTool === 'calc' && (
                  <div className="h-full flex flex-col justify-between">
                    {/* Display */}
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-right mb-3">
                      <div className="text-[11px] text-neutral-500 h-4 font-mono">
                        {calcPrev ? `${calcPrev} ${calcOp || ''}` : ''}
                      </div>
                      <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums truncate">
                        {calcInput}
                      </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-4 gap-1.5 flex-1">
                      {['C', '±', '%', '÷'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => {
                            if (btn === 'C') handleCalcClear();
                            else if (btn === '÷') handleCalcOp('÷');
                            else if (btn === '±') setCalcInput((p) => (parseFloat(p) * -1).toString());
                            else if (btn === '%') setCalcInput((p) => (parseFloat(p) / 100).toString());
                          }}
                          className="h-11 rounded-lg bg-neutral-800/80 text-emerald-400 font-medium text-xs hover:bg-neutral-800 active:scale-95 transition-colors"
                        >
                          {btn}
                        </button>
                      ))}

                      {['7', '8', '9', '×'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => (btn === '×' ? handleCalcOp('×') : handleCalcNum(btn))}
                          className={`h-11 rounded-lg font-medium text-xs active:scale-95 transition-colors ${
                            btn === '×' ? 'bg-neutral-800/80 text-emerald-400' : 'bg-neutral-800/40 text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          {btn}
                        </button>
                      ))}

                      {['4', '5', '6', '−'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => (btn === '−' ? handleCalcOp('−') : handleCalcNum(btn))}
                          className={`h-11 rounded-lg font-medium text-xs active:scale-95 transition-colors ${
                            btn === '−' ? 'bg-neutral-800/80 text-emerald-400' : 'bg-neutral-800/40 text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          {btn}
                        </button>
                      ))}

                      {['1', '2', '3', '+'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => (btn === '+' ? handleCalcOp('+') : handleCalcNum(btn))}
                          className={`h-11 rounded-lg font-medium text-xs active:scale-95 transition-colors ${
                            btn === '+' ? 'bg-neutral-800/80 text-emerald-400' : 'bg-neutral-800/40 text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          {btn}
                        </button>
                      ))}

                      <button
                        onClick={() => handleCalcNum('0')}
                        className="col-span-2 h-11 rounded-lg bg-neutral-800/40 text-neutral-200 font-medium text-xs hover:bg-neutral-800 active:scale-95 transition-colors"
                      >
                        0
                      </button>
                      <button
                        onClick={() => {
                          sound.playHapticTick();
                          if (!calcInput.includes('.')) setCalcInput((p) => p + '.');
                        }}
                        className="h-11 rounded-lg bg-neutral-800/40 text-neutral-200 font-medium text-xs hover:bg-neutral-800 active:scale-95 transition-colors"
                      >
                        .
                      </button>
                      <button
                        onClick={handleCalcEqual}
                        className="h-11 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 active:scale-95 transition-colors"
                      >
                        =
                      </button>
                    </div>
                  </div>
                )}

                {/* TOOL 3: QUICK STICKY MEMO */}
                {activeTool === 'memo' && (
                  <div className="h-full flex flex-col">
                    <p className="text-[11px] text-neutral-400 mb-2">
                      {t.memoPlaceholder}
                    </p>
                    <textarea
                      value={stickyNote}
                      onChange={(e) => setStickyNote(e.target.value)}
                      placeholder="Tezkor fikrlarni bu yerga yozing..."
                      className="w-full flex-1 p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 resize-none font-sans"
                    />
                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-neutral-500 tabular-nums">
                        {stickyNote.length} ta belgi
                      </span>
                    </div>
                  </div>
                )}

                {/* TOOL 4: QUICK TIMER */}
                {activeTool === 'timer' && (
                  <div className="h-full flex flex-col justify-between items-center py-4">
                    <div className="text-center">
                      <span className="text-4xl font-bold font-mono tracking-tight tabular-nums text-white">
                        {Math.floor(timerSeconds / 60)
                          .toString()
                          .padStart(2, '0')}
                        :
                        {(timerSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        {timerRunning ? 'Taymer ishlamoqda...' : 'Vaqtni tanlang'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full">
                      {[60, 180, 300, 600, 900, 1500].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => {
                            sound.playHapticTick();
                            setTimerSeconds(sec);
                            setTimerRunning(false);
                          }}
                          className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                            timerSeconds === sec
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-neutral-800 bg-neutral-800/40 text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          {sec >= 60 ? `${sec / 60} daq` : `${sec} son`}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 w-full">
                      <button
                        onClick={() => {
                          sound.playHapticTick();
                          if (timerSeconds > 0) {
                            setTimerRunning(!timerRunning);
                          }
                        }}
                        disabled={timerSeconds === 0}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-40 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{timerRunning ? 'To‘xtatish' : 'Boshlash'}</span>
                      </button>
                      <button
                        onClick={() => {
                          sound.playHapticTick();
                          setTimerRunning(false);
                          setTimerSeconds(0);
                        }}
                        className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
