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
      <div className='bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 border border-gray-100 flex flex-col items-center animate-scale-up'>
        
        <h3 className='text-lg font-bold text-gray-800 text-center mb-6'>
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
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tempGender === 'Male' ? 'bg-blue/80 text-blue' : 'bg-gray-100 text-gray-400'
              }`}>
                ♂
              </div>
              <span className='text-[15px]'>Male</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              tempGender === 'Male' ? 'border-blue' : 'border-gray-300'
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
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tempGender === 'Female' ? 'bg-pink/80 text-pink' : 'bg-gray-100 text-gray-400'
              }`}>
                ♀
              </div>
              <span className='text-[15px]'>Female</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              tempGender === 'Female' ? 'border-pink' : 'border-gray-300'
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
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className='flex items-center gap-3.5'>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tempGender === 'Other' ? 'bg-purple-100/80 text-purple-600' : 'bg-gray-100 text-gray-400'
              }`}>
                ⚨
              </div>
              <span className='text-[15px]'>Other</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              tempGender === 'Other' ? 'border-purple-500' : 'border-gray-300'
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
            className='flex-1 border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-600 font-medium py-3 rounded-full text-sm transition-all'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            className='flex-1 bg-blue hover:bg-blue active:scale-95 text-white font-medium py-3 rounded-full text-sm shadow-md shadow-blue/20 transition-all'
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}
