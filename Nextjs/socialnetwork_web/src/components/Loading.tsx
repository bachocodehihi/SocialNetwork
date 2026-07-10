'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Đang tải...' }: LoadingProps) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-200">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-blue animate-spin" />
        <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm select-none">
          {message}
        </p>
      </div>
    </div>
  );
}
