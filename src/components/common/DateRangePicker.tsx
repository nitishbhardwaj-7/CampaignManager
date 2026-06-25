import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  className?: string;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DateRangePicker({ value, onChange, label, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
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

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

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

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = toDateStr(viewYear, viewMonth, d);
    const start = isStart(ds);
    const end = isEnd(ds);
    const inRange = isInRange(ds);
    cells.push(
      <button
        key={ds}
        onClick={() => handleDayClick(ds)}
        onMouseEnter={() => setHovered(ds)}
        onMouseLeave={() => setHovered(null)}
        className={cn(
          'h-8 w-8 text-sm rounded transition-colors duration-100 flex items-center justify-center',
          start || end
            ? 'bg-primary text-white font-semibold'
            : inRange
            ? 'bg-[hsl(211,91%,92%)] text-primary'
            : 'hover:bg-secondary text-foreground'
        )}
      >
        {d}
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-8 text-xs font-normal gap-1.5 px-3 border-border',
            className
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {label && <span className="text-muted-foreground">{label}:</span>}
          <span className="text-foreground">
            {formatDisplay(value.from)} – {formatDisplay(value.to)}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 ml-0.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <div className="p-3 min-w-[280px]">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-secondary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells}
          </div>

          {/* Selection hint */}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {selecting === 'from' ? 'Select start date' : 'Select end date'}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={cancel} className="h-7 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={apply}
              disabled={!tempFrom || !tempTo}
              className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
