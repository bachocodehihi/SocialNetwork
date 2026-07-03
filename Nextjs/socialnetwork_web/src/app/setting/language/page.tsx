'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '../../../components/Alert/alertcontext';
import { ArrowLeft, Check } from 'lucide-react';

export default function LanguagePage() {
  const router = useRouter();
  const { showSuccess } = useAlert();
  const [currentLang, setCurrentLang] = useState('vi');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'vi';
    setCurrentLang(savedLang);
  }, []);

  const handleSelectLanguage = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('language', code);
    showSuccess(code === 'vi' ? 'Đã đổi ngôn ngữ sang Tiếng Việt!' : 'Language changed to English!');
  };

  const languages = [
    {
      flag: '🇻🇳',
      name: 'Tiếng Việt',
      subName: '(Vietnamese)',
      code: 'vi'
    },
    {
      flag: '🇺🇸',
      name: 'English',
      subName: '(Tiếng Anh)',
      code: 'en'
    }
  ];

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
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Ngôn ngữ</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <p className="text-sm font-semibold text-grey mb-4 px-1">
          Chọn ngôn ngữ bạn muốn sử dụng hiển thị trong hệ thống:
        </p>

        <div className="space-y-3">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-sm ${
                  isSelected 
                    ? 'border-blue bg-blue/5 text-blue' 
                    : 'border-grey/20 bg-white hover:bg-grey/5 hover:border-grey/30 text-black'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-grey/10 flex items-center justify-center text-2xl select-none">
                    {lang.flag}
                  </div>
                  <div className="text-left">
                    <h4 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-blue' : 'text-black'}`}>
                      {lang.name}
                    </h4>
                    <span className="text-xs text-grey font-medium mt-0.5 block">
                      {lang.subName}
                    </span>
                  </div>
                </div>

                <div 
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue bg-blue text-white scale-105' : 'border-grey/30 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
