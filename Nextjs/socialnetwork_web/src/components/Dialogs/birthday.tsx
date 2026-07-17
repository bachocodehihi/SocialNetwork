'use client';
import { useState, useEffect, useRef } from 'react';

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);

interface BirthdayDialogProps {
  isOpen: boolean;
  initialDate: string;
  onClose: () => void;
  onConfirm: (year: number, month: number, day: number) => void;
}

export default function BirthdayDialog({
  isOpen,
  initialDate,
  onClose,
  onConfirm
}: BirthdayDialogProps) {

  const [localDay, setLocalDay] = useState(17);
  const [localMonth, setLocalMonth] = useState(5);
  const [localYear, setLocalYear] = useState(2026);

  const dayScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  const isProgrammaticScroll = useRef(false);

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

  const maxDays = getDaysInMonth(localYear, localMonth);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  useEffect(() => {
    if (localDay > maxDays) {
      setLocalDay(maxDays);
    }
  }, [localMonth, localYear, maxDays, localDay]);

  useEffect(() => {
    if (isOpen) {
      isProgrammaticScroll.current = true;
      const timer = setTimeout(() => {

        const dayIdx = days.indexOf(localDay);
        if (dayScrollRef.current && dayIdx !== -1) {
          dayScrollRef.current.scrollTop = dayIdx * 40;
        }

        const monthIdx = localMonth - 1;
        if (monthScrollRef.current && monthIdx !== -1) {
          monthScrollRef.current.scrollTop = monthIdx * 40;
        }

        const yearIdx = YEARS.indexOf(localYear);
        if (yearScrollRef.current && yearIdx !== -1) {
          yearScrollRef.current.scrollTop = yearIdx * 40;
        }

        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 100);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, localYear, localMonth, localDay]);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'day' | 'month' | 'year') => {
    if (isProgrammaticScroll.current) return;

    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    
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
    }, 120);
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
      <div className='bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[24px] shadow-2xl p-6 border border-grey/10 dark:border-zinc-800 flex flex-col items-center animate-scale-up'>
        
        <h3 className='text-lg font-bold text-grey-hover dark:text-zinc-100 text-center mb-4'>
          Select birthday
        </h3>

        <div className='w-full grid grid-cols-3 text-center mb-2 px-2'>
          <span className='text-sm font-semibold text-blue'>Day</span>
          <span className='text-sm font-semibold text-blue'>Month</span>
          <span className='text-sm font-semibold text-blue'>Year</span>
        </div>

        <div className='w-full h-40 bg-grey/5 dark:bg-zinc-800/40 rounded-2xl relative flex overflow-hidden border border-grey/10 dark:border-zinc-800 mb-6 select-none'>
          
          <div className='absolute inset-x-2 top-[60px] h-10 bg-blue/10 border-t border-b border-blue/20 rounded-xl pointer-events-none' />

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
                  localDay === d ? 'text-blue font-bold text-[16px]' : 'text-grey/60 dark:text-zinc-400 font-medium'
                }`}
              >
                {String(d).padStart(2, '0')}
              </button>
            ))}
            <div className='h-[60px] shrink-0 pointer-events-none' />
          </div>

          <div
            ref={monthScrollRef}
            onScroll={(e) => handleScroll(e, 'month')}
            className='flex-1 overflow-y-auto scrollbar-none snap-y snap-mandatory py-[60px] flex flex-col items-center border-l border-r border-grey/10 dark:border-zinc-800/60 cursor-ns-resize scroll-smooth overscroll-contain'
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
                    localMonth === mNum ? 'text-blue font-bold text-[16px]' : 'text-grey/60 dark:text-zinc-400 font-medium'
                  }`}
                >
                  {m}
                </button>
              );
            })}
            <div className='h-[60px] shrink-0 pointer-events-none' />
          </div>

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
                  localYear === y ? 'text-blue font-bold text-[16px]' : 'text-grey/60 dark:text-zinc-400 font-medium'
                }`}
              >
                {y}
              </button>
            ))}
            <div className='h-[60px] shrink-0 pointer-events-none' />
          </div>

        </div>

        <div className='w-full flex gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-grey/20 dark:border-zinc-700 hover:bg-grey/5 dark:hover:bg-zinc-800 active:scale-95 text-grey-hover dark:text-zinc-300 font-medium py-3 rounded-full text-sm transition-all'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            className='flex-1 bg-blue hover:bg-blue-hover active:scale-95 text-white font-medium py-3 rounded-full text-sm shadow-md shadow-blue/20 transition-all'
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
