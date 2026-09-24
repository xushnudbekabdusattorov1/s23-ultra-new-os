import React, { useRef, useState, useEffect } from 'react';
import { Pen, Highlighter, Edit2, Eraser, RotateCcw, Download, Save, Trash2, Sparkles } from 'lucide-react';
import { PenType, SavedNote, Language } from '../types';
import { translations } from '../utils/i18n';
import { sound } from '../utils/audio';

interface SPenCanvasProps {
  savedNotes: SavedNote[];
  onNotesChange: (notes: SavedNote[]) => void;
  lang: Language;
  spenEjected: boolean;
  onSpenToggle: () => void;
}

const PALETTE = [
  { name: 'Oltin S-Pen', value: '#fbbf24' },
  { name: 'Oq Phantom', value: '#ffffff' },
  { name: 'Botanik Yashil', value: '#10b981' },
  { name: 'Ko‘k Safir', value: '#38bdf8' },
  { name: 'Binafsha', value: '#c084fc' },
  { name: 'Qizil Marjon', value: '#f87171' },
];

export const SPenCanvas: React.FC<SPenCanvasProps> = ({
  savedNotes,
  onNotesChange,
  lang,
  spenEjected,
  onSpenToggle,
}) => {
  const t = translations[lang].spen;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeTool, setActiveTool] = useState<PenType>('fountain');
  const [currentColor, setCurrentColor] = useState<string>('#fbbf24');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial background: OLED deep black
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Subtle S-Pen grid dots (Samsung Notes style)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const gap = 24;
    for (let x = gap; x < rect.width; x += gap) {
      for (let y = gap; y < rect.height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Save initial state to history
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([state]);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    lastPoint.current = coords;

    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = activeTool === 'eraser' ? '#0a0a0a' : currentColor;
    ctx.fill();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    if (!lastPoint.current) {
      lastPoint.current = coords;
      return;
    }

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = brushSize * 4;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = currentColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = brushSize * 3.5;
    } else if (activeTool === 'pencil') {
      ctx.strokeStyle = currentColor;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = brushSize * 0.8;
    } else {
      // Fountain Pen
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }

    // Smooth quadratic curve interpolation
    const midX = (lastPoint.current.x + coords.x) / 2;
    const midY = (lastPoint.current.y + coords.y) / 2;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();

    lastPoint.current = coords;
    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPoint.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    sound.playHapticTick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop(); // remove current
    const prevState = nextHistory[nextHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(nextHistory);
  };

  const handleClear = () => {
    sound.playHapticTick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const gap = 24;
    for (let x = gap; x < rect.width; x += gap) {
      for (let y = gap; y < rect.height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([state]);
  };

  const handleSaveNote = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playZenChime();

    const dataUrl = canvas.toDataURL('image/png');
    const newNote: SavedNote = {
      id: `memo-${Date.now()}`,
      title: `S-Pen Eskiz #${savedNotes.length + 1}`,
      imageData: dataUrl,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    onNotesChange([newNote, ...savedNotes]);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playHapticTick();

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `s23-ultra-spen-note-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDeleteSavedNote = (id: string) => {
    sound.playHapticTick();
    onNotesChange(savedNotes.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24 px-4 pt-1">
      {/* S-Pen Hardware Action Header */}
      <div className="p-3 mb-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight">{t.title}</h3>
            <p className="text-[10px] text-neutral-400">{t.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playSpenClick();
            onSpenToggle();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors active:scale-95 ${
            spenEjected
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:text-white'
          }`}
        >
          <span>{spenEjected ? t.insertSpen : t.ejectSpen}</span>
        </button>
      </div>

      {/* Canvas Drawing Surface */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800/90 shadow-2xl bg-neutral-950 mb-3 touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[280px] cursor-crosshair block"
        />

        {/* Floating Quick Action Overlay on Canvas */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-neutral-900/80 backdrop-blur-md p-1 rounded-lg border border-neutral-800/80">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            title={t.undo}
            className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            title={t.clear}
            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tool & Brush Controls */}
      <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 mb-3 space-y-3">
        {/* Tool Selector */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => {
              sound.playHapticTick();
              setActiveTool('fountain');
            }}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTool === 'fountain' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t.fountain}</span>
          </button>
          <button
            onClick={() => {
              sound.playHapticTick();
              setActiveTool('highlighter');
            }}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTool === 'highlighter' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t.highlighter}</span>
          </button>
          <button
            onClick={() => {
              sound.playHapticTick();
              setActiveTool('pencil');
            }}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTool === 'pencil' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t.pencil}</span>
          </button>
          <button
            onClick={() => {
              sound.playHapticTick();
              setActiveTool('eraser');
            }}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTool === 'eraser' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t.eraser}</span>
          </button>
        </div>

        {/* Color Palette & Stroke Thickness */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
          <div className="flex items-center gap-2">
            {PALETTE.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  sound.playHapticTick();
                  setCurrentColor(c.value);
                  if (activeTool === 'eraser') setActiveTool('fountain');
                }}
                title={c.name}
                className={`w-6 h-6 rounded-full transition-transform ${
                  currentColor === c.value && activeTool !== 'eraser' ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-neutral-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          {/* Stroke Width Buttons */}
          <div className="flex items-center gap-1.5">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => {
                  sound.playHapticTick();
                  setBrushSize(size);
                }}
                className={`w-6 h-6 rounded-md text-[10px] font-mono flex items-center justify-center transition-colors ${
                  brushSize === size ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Save & Export Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSaveNote}
            className="h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.save}</span>
          </button>
          <button
            onClick={handleExportPng}
            className="h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportPng}</span>
          </button>
        </div>
      </div>

      {/* Saved Memos Shelf */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-neutral-300 tracking-tight flex items-center justify-between">
          <span>{t.savedMemos}</span>
          <span className="text-[10px] text-neutral-400 tabular-nums">{savedNotes.length} ta</span>
        </h4>

        {savedNotes.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center leading-relaxed">
            {t.noMemos}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="group relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/60 p-2"
              >
                <img
                  src={note.imageData}
                  alt={note.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-24 object-cover rounded-lg bg-neutral-950"
                />
                <div className="flex items-center justify-between mt-1.5 px-0.5">
                  <span className="text-[10px] text-neutral-400 tabular-nums">{note.date}</span>
                  <button
                    onClick={() => handleDeleteSavedNote(note.id)}
                    aria-label="Delete memo"
                    className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
