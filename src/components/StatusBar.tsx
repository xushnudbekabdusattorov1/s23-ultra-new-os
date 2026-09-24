import React, { useEffect, useState } from 'react';
import { Wifi, BatteryMedium, PenTool } from 'lucide-react';

interface StatusBarProps {
  spenEjected: boolean;
  onSpenToggle: () => void;
  isLightMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  spenEjected,
  onSpenToggle,
  isLightMode,
}) => {
  const [time, setTime] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(84);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Try battery API if available
    const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number }> };
    if (nav.getBattery) {
      nav.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
      }).catch(() => {});
    }

    return () => clearInterval(interval);
  }, []);

  const textColor = isLightMode ? 'text-neutral-900' : 'text-neutral-200';

  return (
    <div className={`w-full px-7 pt-3 pb-1 flex items-center justify-between text-xs font-medium select-none z-30 transition-colors ${textColor}`}>
      {/* Left: Time and S-Pen status */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight text-[13px] tabular-nums">{time || '12:00'}</span>
        <button
          onClick={onSpenToggle}
          title={spenEjected ? "S-Penni joylashtirish" : "S-Penni chiqarish"}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
            spenEjected
              ? 'bg-amber-500/20 text-amber-400 font-medium'
              : 'hover:bg-white/10 opacity-75'
          }`}
        >
          <PenTool className="w-3 h-3" />
          <span className="text-[10px] tracking-wide">
            {spenEjected ? 'S-Pen Chiqarildi' : 'S-Pen 2.8ms'}
          </span>
        </button>
      </div>

      {/* Center: Punch-hole camera placeholder margin */}
      <div className="w-4 h-4 pointer-events-none" />

      {/* Right: Connectivity and Battery */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-semibold tracking-wider opacity-85">5G</span>
        <Wifi className="w-3.5 h-3.5 opacity-90" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] tabular-nums font-medium">{batteryLevel}%</span>
          <div className="relative flex items-center">
            <BatteryMedium className="w-4 h-4 opacity-90" />
            <div
              className={`absolute left-[2.5px] top-[4.5px] h-[5px] rounded-[1px] ${
                isLightMode ? 'bg-neutral-900' : 'bg-neutral-100'
              }`}
              style={{ width: `${Math.max(2, (batteryLevel / 100) * 8)}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
