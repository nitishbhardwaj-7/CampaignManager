import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  className?: string;
  plain?: boolean;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DateRangePicker({ value, onChange, label, className, plain = false }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  
  const initDate = value.from ? new Date(value.from) : today;
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [tempFrom, setTempFrom] = useState(value.from);
  const [tempTo, setTempTo] = useState(value.to);
  const [hovered, setHovered] = useState<string | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const handleDayClick = (dateStr: string) => {
    if (selecting === 'from') {
      setTempFrom(dateStr);
      setTempTo('');
      setSelecting('to');
    } else {
      if (dateStr < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(dateStr);
      } else {
        setTempTo(dateStr);
      }
      setSelecting('from');
    }
  };

  const apply = () => {
    if (tempFrom && tempTo) {
      onChange({ from: tempFrom, to: tempTo });
      setOpen(false);
    }
  };

  const cancel = () => {
    setTempFrom(value.from);
    setTempTo(value.to);
    setSelecting('from');
    setOpen(false);
  };

  const isInRange = (dateStr: string) => {
    const end = tempTo || hovered || '';
    if (!tempFrom || !end) return false;
    const [lo, hi] = tempFrom <= end ? [tempFrom, end] : [end, tempFrom];
    return dateStr > lo && dateStr < hi;
  };
  const isStart = (dateStr: string) => dateStr === tempFrom;
  const isEnd = (dateStr: string) => !!tempTo && dateStr === tempTo;

  const renderCalendar = (year: number, month: number, isRight: boolean = false) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const cells: React.ReactNode[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = toDateStr(year, month, d);
      const start = isStart(ds);
      const end = isEnd(ds);
      const inRange = isInRange(ds);
      
      let bgLayer = null;
      if (inRange || start || end) {
         const actualStart = tempTo ? (tempFrom < tempTo ? tempFrom : tempTo) : (hovered ? (tempFrom < hovered ? tempFrom : hovered) : tempFrom);
         const actualEnd = tempTo ? (tempFrom > tempTo ? tempFrom : tempTo) : (hovered ? (tempFrom > hovered ? tempFrom : hovered) : tempFrom);

         if (ds > actualStart && ds < actualEnd) {
           bgLayer = <div className="absolute inset-0 bg-[#bbf3d6]" />;
         } else if (ds === actualStart && actualStart !== actualEnd) {
           bgLayer = <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#bbf3d6]" />;
         } else if (ds === actualEnd && actualStart !== actualEnd) {
           bgLayer = <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#bbf3d6]" />;
         }
      }
      
      cells.push(
        <div key={ds} className="relative h-7 flex items-center justify-center">
          {bgLayer}
          <button
            onClick={() => handleDayClick(ds)}
            onMouseEnter={() => setHovered(ds)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'relative z-10 h-6 w-6 text-[11px] rounded-full flex items-center justify-center focus:outline-none transition-colors',
              (start || end)
                ? 'bg-[#057642] text-white font-semibold'
                : inRange
                  ? 'text-[#000000e0] font-medium'
                  : 'text-[#00000099] hover:bg-[#0000000f] font-medium'
            )}
          >
            {d}
          </button>
        </div>
      );
    }

    return (
      <div className="w-[210px]">
        {/* Input fields */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-[#00000099] mb-1">
            {isRight ? 'End date' : 'Start date'}
          </label>
          <div className="relative">
             <Input 
                value={isRight ? formatDisplay(tempTo) : formatDisplay(tempFrom)} 
                readOnly
                className="h-7 text-[12px] border-[#00000099] text-[#000000e0] focus-visible:ring-0 focus-visible:border-black rounded-[4px]"
             />
          </div>
          <div className="text-[10px] text-[#00000099] mt-0.5">mm/dd/yyyy</div>
        </div>

        {/* Month Header */}
        <div className="flex items-center justify-between mb-2">
          {!isRight ? (
            <button onClick={prevMonth} className="h-6 w-6 rounded-full border-2 border-[#00000099] hover:bg-[#0000000f] flex items-center justify-center focus:outline-none">
              <ChevronLeft className="h-3 w-3 text-[#00000099]" />
            </button>
          ) : (
            <div className="h-6 w-6" />
          )}
          
          <span className="text-[13px] font-semibold text-[#000000e0]">
            {MONTHS[month]} {year}
          </span>
          
          {isRight ? (
            <button onClick={nextMonth} className="h-6 w-6 rounded-full border-2 border-[#00000099] hover:bg-[#0000000f] flex items-center justify-center focus:outline-none">
              <ChevronRight className="h-3 w-3 text-[#00000099]" />
            </button>
          ) : (
            <div className="h-6 w-6" />
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 mb-1.5">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-[11px] text-[#00000099] font-medium py-0.5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells}
        </div>
      </div>
    );
  };

  const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const rightYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const presetRanges = [
    { label: 'Prior time range' },
    { label: 'Last month' },
    { label: 'Last quarter' },
    { label: 'Last year' },
    { label: 'Custom', active: true },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {plain ? (
          <button
            className={cn(
              'flex items-center text-xs text-[#000000e0] hover:underline focus:outline-none select-none',
              className
            )}
          >
            {label && <span className="text-[#000000e0] mr-1">{label}:</span>}
            <span className="font-semibold text-[#000000e0]">
              {formatDisplay(value.from)} - {formatDisplay(value.to)}
            </span>
            <svg className="h-3.5 w-3.5 text-[#00000099] shrink-0 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
        ) : (
          <Button
            variant="outline"
            className={cn(
              'h-8 text-xs font-normal gap-1.5 px-3 border-border',
              className
            )}
          >
            <CalendarDays className="h-3.5 w-3.5 text-[#00000099] shrink-0" />
            {label && <span className="text-muted-foreground">{label}:</span>}
            <span className="text-foreground">
              {formatDisplay(value.from)} – {formatDisplay(value.to)}
            </span>
            <ChevronDown className="h-3 w-3 text-[#00000099] shrink-0 ml-0.5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-[#0000001f] rounded-lg mt-2" align="start">
        <div className="flex bg-white rounded-lg p-3">
           {/* Sidebar */}
           <div className="w-[100px] py-1 flex flex-col gap-3">
             {presetRanges.map(p => (
               <div key={p.label} className="relative flex items-center">
                 {p.active && <div className="absolute left-[-12px] w-[3px] h-full bg-black rounded-r-sm" />}
                 <button
                   className={cn(
                     "text-left text-[11px] font-semibold transition-colors focus:outline-none w-full",
                     p.active ? "text-[#000000e0]" : "text-[#00000099] hover:text-[#000000e0]"
                   )}
                 >
                   {p.label}
                 </button>
               </div>
             ))}
           </div>
           
           <div className="w-px bg-[#0000001f] mx-3" />
           
           <div className="flex flex-col">
             {/* Calendars Row */}
             <div className="flex gap-4">
               {renderCalendar(viewYear, viewMonth, false)}
               {renderCalendar(rightYear, rightMonth, true)}
             </div>

             {/* Footer */}
             <div className="flex items-center justify-between mt-3 pt-2">
               <div className="text-[11px] text-[#00000099] font-medium">Time in UTC</div>
               <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={cancel} className="h-7 px-3 rounded-full border-[#00000099] text-[#00000099] text-[11px] font-semibold hover:bg-[#0000000f] hover:text-[#000000e0]">
                   Cancel
                 </Button>
                 <Button onClick={apply} disabled={!tempFrom || !tempTo} className="h-7 px-3 rounded-full bg-[#0A66C2] text-[11px] text-white font-semibold hover:bg-[#004b8d]">
                   Update
                 </Button>
               </div>
             </div>
           </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
