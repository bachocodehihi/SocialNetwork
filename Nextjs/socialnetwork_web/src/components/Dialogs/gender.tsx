'use client';
import { useState, useEffect } from 'react';

interface GenderDialogProps {
  isOpen: boolean;
  initialGender: 'Male' | 'Female' | 'Other';
  onClose: () => void;
  onConfirm: (gender: 'Male' | 'Female' | 'Other') => void;
}

export default function GenderDialog({
  isOpen,
  initialGender,
  onClose,
  onConfirm
}: GenderDialogProps) {
  const [tempGender, setTempGender] = useState<'Male' | 'Female' | 'Other'>(initialGender);

  // Sync state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTempGender(initialGender);
    }
  }, [isOpen, initialGender]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(tempGender);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 animate-fade-in'>
      <div className='bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[24px] shadow-2xl p-6 border border-grey/10 dark:border-zinc-800 flex flex-col items-center animate-scale-up'>
        
        <h3 className='text-lg font-bold text-grey-hover dark:text-zinc-100 text-center mb-6'>
          Select gender
        </h3>

        {/* Custom Interactive Flutter-style Cards */}
        <div className='w-full space-y-3.5 mb-6'>
          
          {/* Male Card */}
          <button
            type='button'
            onClick={() => setTempGender('Male')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              tempGender === 'Male'
                ? 'border-blue bg-blue/20 text-blue font-semibold shadow-sm'
                : 'border-grey/20 dark:border-zinc-700 text-grey-hover dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tempGender === 'Male' ? 'bg-blue text-white' : 'bg-grey/10 dark:bg-zinc-800 text-grey/60 dark:text-zinc-400'
              }`}>
                ♂
              </div>
              <span className='text-[15px]'>Male</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              tempGender === 'Male' ? 'border-blue' : 'border-gray-300 dark:border-zinc-600'
            }`}>
              {tempGender === 'Male' && <div className='w-2.5 h-2.5 bg-blue rounded-full' />}
            </div>
          </button>

          {/* Female Card */}
          <button
            type='button'
            onClick={() => setTempGender('Female')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              tempGender === 'Female'
                ? 'border-pink bg-pink/20 text-pink font-semibold shadow-sm'
                : 'border-grey/20 dark:border-zinc-700 text-grey-hover dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tempGender === 'Female' ? 'bg-pink text-white' : 'bg-grey/10 dark:bg-zinc-800 text-grey/60 dark:text-zinc-400'
              }`}>
                ♀
              </div>
              <span className='text-[15px]'>Female</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              tempGender === 'Female' ? 'border-pink' : 'border-gray-300 dark:border-zinc-600'
            }`}>
              {tempGender === 'Female' && <div className='w-2.5 h-2.5 bg-pink rounded-full' />}
            </div>
          </button>

          {/* Other Card */}
          <button
            type='button'
            onClick={() => setTempGender('Other')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              tempGender === 'Other'
                ? 'border-purple-500 bg-purple-50/20 text-purple-600 font-semibold shadow-sm'
                : 'border-grey/20 dark:border-zinc-700 text-grey-hover dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tempGender === 'Other' ? 'bg-purple-500 text-white' : 'bg-grey/10 dark:bg-zinc-800 text-grey/60 dark:text-zinc-400'
              }`}>
                ⚨
              </div>
              <span className='text-[15px]'>Other</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              tempGender === 'Other' ? 'border-purple-500' : 'border-gray-300 dark:border-zinc-600'
            }`}>
              {tempGender === 'Other' && <div className='w-2.5 h-2.5 bg-purple-500 rounded-full' />}
            </div>
          </button>

        </div>

        {/* Modal Actions */}
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
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}
