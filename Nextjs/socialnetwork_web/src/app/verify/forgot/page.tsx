'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { Loader2 } from 'lucide-react';
import Alert from '../../../components/Alert/alert';

function VerifyForgotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess } = useAlert();
  
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setFormError(null);
    try {
      const res = await authService.sendOtp(email);
      if (res.success) {
        showSuccess('Mã OTP khôi phục đã được gửi lại thành công!');
        setResendCooldown(60);
        setOtp('');
        inputRef.current?.focus();
      } else {
        setFormError('Không thể gửi mã OTP. Vui lòng thử lại!');
      }
    } catch (err: any) {
      setFormError('Lỗi gửi lại OTP. Vui lòng thử lại sau!');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (otp.length !== 6) {
      setFormError('Vui lòng nhập đủ 6 chữ số của mã OTP!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.verifyOtp(email, otp);
      if (res.success) {
        
        sessionStorage.setItem('forgot_otp_verified', 'true');
        
        showSuccess('Xác thực email thành công! Đang chuyển hướng nhập mật khẩu mới...');
        setTimeout(() => {
          router.replace(`/forgot/password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setFormError('Mã OTP không hợp lệ hoặc đã hết hạn!');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      const code = err.response?.data?.code || err.message;
      if (code === 'OTP_INVALID') {
        setFormError('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
      } else if (code === 'OTP_EXPIRED') {
        setFormError('Mã OTP đã hết hạn. Vui lòng nhấn gửi lại!');
      } else {
        setFormError('Lỗi hệ thống. Vui lòng thử lại sau!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i] || '';
      const isFocused = otp.length === i;
      boxes.push(
        <div
          key={i}
          onClick={() => inputRef.current?.focus()}
          className={`w-12 h-14 md:w-14 md:h-16 flex items-center justify-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 cursor-pointer ${
            char
              ? 'border-blue bg-blue/20 text-black dark:text-zinc-100 shadow-md'
              : isFocused
              ? 'border-blue bg-white dark:bg-zinc-800 ring-4 ring-blue/10 scale-105'
              : 'border-grey/20 dark:border-zinc-700 bg-grey/5 dark:bg-zinc-800/50 text-black dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600'
          }`}
        >
          {char}
        </div>
      );
    }
    return boxes;
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900 p-4 font-sans'>
      <div className='w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-sm p-8 border border-grey/20 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200'>
        
        <div className='text-center mb-8'>
          <div className='w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 border border-grey/10 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-800 p-1'>
            <img
              src='/assets/logo/logo.png'
              alt='SocialNetwork Logo'
              className='w-full h-full object-cover rounded-xl'
            />
          </div>
          <h2 className='text-xl font-bold text-black dark:text-zinc-100 tracking-tight'>
            Account verification
          </h2>
          <p className='text-grey dark:text-zinc-400 mt-2 text-sm px-4'>
            OTP has been sent to your recovery email:
          </p>
          <p className='text-blue font-semibold text-sm break-all mt-1'>
            {email || 'Email của bạn'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6' noValidate>
          
          <div className='relative'>

            <input
              ref={inputRef}
              type='text'
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setOtp(val);
                if (formError) setFormError(null);
              }}
              className='absolute inset-0 w-full h-full opacity-0 cursor-default select-none'
              autoFocus
            />
            
            <div className='flex justify-between gap-2 max-w-xs mx-auto py-2'>
              {renderOtpBoxes()}
            </div>
          </div>

          {formError && (
            <Alert 
              message={formError} 
              type="error" 
              isInline={true} 
              onClose={() => setFormError(null)} 
            />
          )}

          <button
            type='submit'
            disabled={isLoading || otp.length !== 6}
            className='w-full bg-blue hover:bg-blue-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue/25 flex items-center justify-center gap-2'
          >
            {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
            <span>Verify</span>
          </button>

        </form>

        <div className='mt-8 text-center text-sm text-grey dark:text-zinc-400'>
          Didn't receive the code?{' '}
          {resendCooldown > 0 ? (
            <span className='text-blue font-semibold'>Resend in ({resendCooldown}s)</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className='text-blue hover:text-blue-hover font-bold transition-all disabled:opacity-50'
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function VerifyForgot() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900">
        <Loader2 className="animate-spin h-10 w-10 text-blue" />
      </div>
    }>
      <VerifyForgotContent />
    </Suspense>
  );
}
