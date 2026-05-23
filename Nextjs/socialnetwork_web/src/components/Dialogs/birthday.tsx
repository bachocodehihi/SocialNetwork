'use client';
import { useState, useEffect, useRef } from 'react';

// Utility to get number of days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1900 to 2100

interface BirthdayDialogProps {
  isOpen: boolean;
  initialDate: string; // YYYY-MM-DD
  onClose: () => void;
  onConfirm: (year: number, month: number, day: number) => void;
}

export default function BirthdayDialog({
  isOpen,
  initialDate,
  onClose,
  onConfirm
}: BirthdayDialogProps) {
  // Local active selected states
  const [localDay, setLocalDay] = useState(17);
  const [localMonth, setLocalMonth] = useState(5);
  const [localYear, setLocalYear] = useState(2026);

  // Refs for scroll columns in Birthday Dialog
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  // Track if scrolling is initiated programmatically to avoid listener feedback loops
  const isProgrammaticScroll = useRef(false);

  // Sync state when dialog opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      let y = today.getFullYear();
      let m = today.getMonth() + 1;
      let d = today.getDate();

      if (initialDate) {
        const parts = initialDate.split('-').map(Number);
        if (parts.length === 3) {
          [y, m, d] = parts;
        }
      }

      setLocalYear(y);
      setLocalMonth(m);
      setLocalDay(d);
    }
  }, [isOpen, initialDate]);

  // Generate dynamic array values for days
  const maxDays = getDaysInMonth(localYear, localMonth);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Ensure day selection is never out of range when month/year changes
  useEffect(() => {
    if (localDay > maxDays) {
      setLocalDay(maxDays);
    }
  }, [localMonth, localYear, maxDays, localDay]);

  // Scroll active elements to center when Birthday dialog opens OR values change
  useEffect(() => {
    if (isOpen) {
      isProgrammaticScroll.current = true;
      const timer = setTimeout(() => {
        // Scroll Day
        const dayIdx = days.indexOf(localDay);
        if (dayScrollRef.current && dayIdx !== -1) {
          dayScrollRef.current.scrollTop = dayIdx * 40;
        }

        // Scroll Month
        const monthIdx = localMonth - 1;
        if (monthScrollRef.current && monthIdx !== -1) {
          monthScrollRef.current.scrollTop = monthIdx * 40;
        }

        // Scroll Year
        const yearIdx = YEARS.indexOf(localYear);
        if (yearScrollRef.current && yearIdx !== -1) {
          yearScrollRef.current.scrollTop = yearIdx * 40;
        }

        // Allow scroll listener to receive events again
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 100);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, localYear, localMonth, localDay]);

  if (!isOpen) return null;

  // Handle scroll events with smooth 120ms debounce to avoid render lag during momentum scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'day' | 'month' | 'year') => {
    if (isProgrammaticScroll.current) return;

    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    
    // Calculate snapped index (each item is 40px high)
    const index = Math.round(scrollTop / 40);

    const timeoutId = (container as any).scrollTimeout;
    if (timeoutId) clearTimeout(timeoutId);

    (container as any).scrollTimeout = setTimeout(() => {
      if (type === 'day') {
        const val = days[index];
        if (val && val !== localDay) {
          setLocalDay(val);
        }
      } else if (type === 'month') {
        const val = index + 1;
        if (val >= 1 && val <= 12 && val !== localMonth) {
          setLocalMonth(val);
        }
      } else if (type === 'year') {
        const val = YEARS[index];
        if (val && val !== localYear) {
          setLocalYear(val);
        }
      }
    }, 120); // Smooth debounce so mousewheel/touch scrolls buttery smooth
  };

  const selectDayClick = (d: number, idx: number) => {
    setLocalDay(d);
    if (dayScrollRef.current) {
      dayScrollRef.current.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  };

  const selectMonthClick = (mNum: number, idx: number) => {
    setLocalMonth(mNum);
    if (monthScrollRef.current) {
      monthScrollRef.current.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  };

  const selectYearClick = (y: number, idx: number) => {
    setLocalYear(y);
    if (yearScrollRef.current) {
      yearScrollRef.current.scrollTo({ top: idx * 40, behavior: 'smooth' });
    }
  };

  const handleConfirm = () => {
    onConfirm(localYear, localMonth, localDay);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 animate-fade-in'>
      <div className='bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 border border-gray-100 flex flex-col items-center animate-scale-up'>
        
        <h3 className='text-lg font-bold text-gray-800 text-center mb-4'>
          Select birthday
        </h3>

        {/* Wheel Headers */}
        <div className='w-full grid grid-cols-3 text-center mb-2 px-2'>
          <span className='text-sm font-semibold text-blue-500'>Day</span>
          <span className='text-sm font-semibold text-blue-500'>Month</span>
          <span className='text-sm font-semibold text-blue-500'>Year</span>
        </div>

        {/* Custom 3D Column Selectors with Center Active Highlight */}
        <div className='w-full h-40 bg-gray-50 rounded-2xl relative flex overflow-hidden border border-gray-100 mb-6 select-none'>
          
          {/* Highlight bar overlay for center selection */}
          <div className='absolute inset-x-2 top-[60px] h-10 bg-blue-500/10 border-t border-b border-blue-500/20 rounded-xl pointer-events-none' />

          {/* Day Scroll Column */}
          <div
            ref={dayScrollRef}
            onScroll={(e) => handleScroll(e, 'day')}
            className='flex-1 overflow-y-auto scrollbar-none snap-y snap-mandatory py-[60px] flex flex-col items-center cursor-ns-resize scroll-smooth overscroll-contain'
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className='h-[60px] shrink-0 pointer-events-none' />
            {days.map((d, idx) => (
              <button
                key={d}
                type='button'
                onClick={() => selectDayClick(d, idx)}
                className={`h-10 w-full flex items-center justify-center snap-center shrink-0 text-sm transition-all focus:outline-none ${
                  localDay === d ? 'text-blue-600 font-bold text-[16px]' : 'text-gray-400 font-medium'
                }`}
              >
                {String(d).padStart(2, '0')}
              </button>
            ))}
            <div className='h-[60px] shrink-0 pointer-events-none' />
          </div>

          {/* Month Scroll Column */}
          <div
            ref={monthScrollRef}
            onScroll={(e) => handleScroll(e, 'month')}
            className='flex-1 overflow-y-auto scrollbar-none snap-y snap-mandatory py-[60px] flex flex-col items-center border-l border-r border-gray-200/50 cursor-ns-resize scroll-smooth overscroll-contain'
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className='h-[60px] shrink-0 pointer-events-none' />
            {MONTHS.map((m, idx) => {
              const mNum = idx + 1;
              return (
                <button
                  key={m}
                  type='button'
                  onClick={() => selectMonthClick(mNum, idx)}
                  className={`h-10 w-full flex items-center justify-center snap-center shrink-0 text-sm transition-all focus:outline-none ${
                    localMonth === mNum ? 'text-blue-600 font-bold text-[16px]' : 'text-gray-400 font-medium'
                  }`}
                >
                  {m}
                </button>
              );
            })}
            <div className='h-[60px] shrink-0 pointer-events-none' />
          </div>

          {/* Year Scroll Column */}
          <div
            ref={yearScrollRef}
            onScroll={(e) => handleScroll(e, 'year')}
            className='flex-1 overflow-y-auto scrollbar-none snap-y snap-mandatory py-[60px] flex flex-col items-center cursor-ns-resize scroll-smooth overscroll-contain'
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className='h-[60px] shrink-0 pointer-events-none' />
            {YEARS.map((y, idx) => (
              <button
                key={y}
                type='button'
                onClick={() => selectYearClick(y, idx)}
                className={`h-10 w-full flex items-center justify-center snap-center shrink-0 text-sm transition-all focus:outline-none ${
                  localYear === y ? 'text-blue-600 font-bold text-[16px]' : 'text-gray-400 font-medium'
                }`}
              >
                {y}
              </button>
            ))}
            <div className='h-[60px] shrink-0 pointer-events-none' />
          </div>

        </div>

        {/* Modal Actions */}
        <div className='w-full flex gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-600 font-medium py-3 rounded-full text-sm transition-all'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            className='flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-medium py-3 rounded-full text-sm shadow-md shadow-blue-500/20 transition-all'
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
