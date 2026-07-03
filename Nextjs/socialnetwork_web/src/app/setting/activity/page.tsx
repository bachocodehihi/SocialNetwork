'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountService } from '../../../services/accout.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { ArrowLeft, Clock, RefreshCw, BarChart2, Loader2 } from 'lucide-react';

export default function ActivityPage() {
  const router = useRouter();
  const { showError } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [weekDayMinutes, setWeekDayMinutes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const todayIndex = (() => {
    // JS: 0 is Sunday, 1 is Monday ... 6 is Saturday
    // Convert to: 0 is Mon, 1 is Tue ... 6 is Sun
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  })();

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const res = await accountService.getActivity();
      // res is expected to be success: true, data: [ { minutes }, ... ]
      if (res && res.success && Array.isArray(res.data)) {
        const mins = [0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < res.data.length && i < 7; i++) {
          mins[i] = res.data[i].minutes || 0;
        }
        setWeekDayMinutes(mins);
      } else if (Array.isArray(res)) {
        const mins = [0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < res.length && i < 7; i++) {
          mins[i] = res[i].minutes || 0;
        }
        setWeekDayMinutes(mins);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      showError('Không thể tải nhật ký hoạt động');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const totalMinutes = weekDayMinutes.reduce((a, b) => a + b, 0);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const maxMinutes = Math.max(...weekDayMinutes, 10); // avoid division by 0

  return (
    <div className="min-h-screen bg-grey/5 pb-16 font-sans text-grey-hover">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-grey/20 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => router.push('/setting')}
              className="w-10 h-10 rounded-full hover:bg-grey/10 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Thời gian sử dụng</h1>
          </div>
          <button 
            onClick={fetchActivity}
            disabled={isLoading}
            className="w-9 h-9 rounded-full hover:bg-grey/10 flex items-center justify-center text-grey-hover active:scale-95 transition border-0 bg-transparent cursor-pointer"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue" />
          </div>
        ) : (
          <>
            {/* Today Card */}
            <div className="bg-gradient-to-br from-blue to-blue-hover text-white rounded-3xl p-6 shadow-md border-0 text-left">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 opacity-90" />
                <span className="text-sm font-bold opacity-90 uppercase tracking-wider">Hôm nay</span>
              </div>
              <h2 className="text-4xl font-extrabold mt-3 tracking-tight">
                {formatDuration(weekDayMinutes[todayIndex])}
              </h2>
              <p className="text-xs mt-2 font-medium opacity-80">
                Thời gian hoạt động trên thiết bị này được ghi nhận hôm nay.
              </p>
            </div>

            {/* This Week Section */}
            <div className="bg-white rounded-2xl p-6 border border-grey/20 shadow-sm text-left">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-base text-black">Tuần này</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-grey font-medium">Tổng cộng:</span>
                    <span className="text-sm font-bold text-blue">{formatDuration(totalMinutes)}</span>
                  </div>
                </div>
                <BarChart2 className="w-5 h-5 text-grey" />
              </div>

              {/* Chart Grid */}
              <div className="flex justify-between items-end h-56 pt-4 px-2 border-b border-grey/10">
                {weekDayMinutes.map((mins, idx) => {
                  const percent = (mins / maxMinutes) * 100;
                  const isToday = idx === todayIndex;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer">
                      {/* Bar Container */}
                      <div className="relative w-7 sm:w-9 h-40 flex items-end justify-center rounded-t-lg overflow-hidden bg-grey/5">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-1 bg-black/85 text-white text-[10px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow z-10">
                          {formatDuration(mins)}
                        </div>
                        {/* Fill bar */}
                        <div 
                          style={{ height: `${percent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ease-out origin-bottom ${
                            isToday ? 'bg-blue' : 'bg-grey/30 group-hover:bg-grey/40'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-bold mt-2.5 ${isToday ? 'text-blue' : 'text-grey'}`}>
                        {weekDays[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-grey font-medium">
                <span>T2: Thứ Hai</span>
                <span>CN: Chủ Nhật</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
