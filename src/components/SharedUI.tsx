import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Settings2 } from 'lucide-react';

export const MetricCard = ({ icon, title, value, trend, trendUp }: any) => (
  <div className="bg-white rounded-3xl p-5 flex items-center gap-5 shadow-sm border border-zinc-200/60 flex-1 min-w-[260px]">
    <div className="w-14 h-14 rounded-[18px] border border-zinc-100 flex items-center justify-center bg-zinc-50 shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-[13px] font-semibold text-zinc-500 mb-1 tracking-wide">{title}</div>
      <div className="flex items-baseline gap-3">
        <span className="text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{value}</span>
        <span className={`text-[13px] font-bold flex items-center ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={14} className="mr-0.5" strokeWidth={2.5} /> : <ArrowDownRight size={14} className="mr-0.5" strokeWidth={2.5} />}
          {trend}
        </span>
      </div>
    </div>
  </div>
);

export const ColumnDropdown = ({ columns, visibleCols, setVisibleCols }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 hover:text-zinc-900 transition-colors"
      >
        <Settings2 size={16} />
        Personalizar Colunas
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200/80 rounded-xl shadow-lg z-[50] py-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-zinc-100 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Alternar Colunas</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {columns.map((col: any) => (
              <label key={col.id} className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={visibleCols[col.id]} 
                  onChange={() => setVisibleCols({...visibleCols, [col.id]: !visibleCols[col.id]})} 
                  className="w-4 h-4 rounded border-zinc-300 text-[#3B5BDB] focus:ring-[#3B5BDB] transition-all" 
                />
                <span className="text-[13px] font-medium text-zinc-700 select-none">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};