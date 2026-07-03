'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '../../../components/Alert/alertcontext';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

export default function DarkmodePage() {
  const router = useRouter();
  const { showSuccess } = useAlert();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      showSuccess('Đã chuyển sang Chế độ tối!');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      showSuccess('Đã chuyển sang Chế độ sáng!');
    }
  };

  return (
    <div className="min-h-screen bg-grey/5 pb-16 font-sans text-grey-hover">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-grey/20 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3.5">
          <button 
            onClick={() => router.push('/setting')}
            className="w-10 h-10 rounded-full hover:bg-grey/10 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Chế độ tối</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-5 border border-grey/20 shadow-sm flex items-center justify-between">
          <div className="flex items-start gap-4 min-w-0 pr-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-50 text-purple-500`}>
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-black">Chế độ tối</h3>
              <p className="text-xs sm:text-sm text-grey font-medium mt-1 text-justify leading-relaxed">
                Giảm mỏi mắt, tiết kiệm pin cho thiết bị của bạn và cải thiện khả năng hiển thị trong môi trường ánh sáng yếu.
              </p>
            </div>
          </div>

          {/* Standard Switch Switcher */}
          <button 
            onClick={() => toggleDarkMode(!isDarkMode)}
            className={`w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${isDarkMode ? 'bg-blue' : 'bg-grey/30'}`}
          >
            <div 
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>

        </div>
      </main>
    </div>
  );
}
