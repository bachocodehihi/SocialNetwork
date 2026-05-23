'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { Loader2, ShieldCheck } from 'lucide-react';
import Alert from '../../../components/Alert/alert';

function VerifySignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Hidden text input ref to manage focus
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    // Start countdown
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
        showSuccess('Mã OTP mới đã được gửi thành công!');
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
        // Set the verification flag in sessionStorage
        sessionStorage.setItem('otp_verified', 'true');
        
        showSuccess('Xác thực email thành công! Đang chuyển hướng nhập thông tin cá nhân...');
        setTimeout(() => {
          router.replace(`/signup/information?email=${encodeURIComponent(email)}`);
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
              ? 'border-blue-500 bg-blue-50/20 text-gray-900 shadow-md'
              : isFocused
              ? 'border-blue-500 bg-white ring-4 ring-blue-500/10 scale-105'
              : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-gray-300'
          }`}
        >
          {char}
        </div>
      );
    }
    return boxes;
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4 font-sans'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm'>
        
        <div className='text-center mb-8'>
          <div className='bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <ShieldCheck className='w-8 h-8 text-blue-500' />
          </div>
          <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
            Xác thực tài khoản
          </h2>
          <p className='text-gray-500 mt-2 text-sm px-4'>
            Mã OTP gồm 6 chữ số đã được gửi tới email:
          </p>
          <p className='text-blue-600 font-semibold text-sm break-all mt-1'>
            {email || 'Email của bạn'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6' noValidate>
          
          <div className='relative'>
            {/* Hidden Input */}
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
            
            {/* Beautiful OTP Boxes */}
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
            className='w-full bg-blue-500 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2'
          >
            {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
            <span>Xác nhận</span>
          </button>

        </form>

        <div className='mt-8 text-center text-sm text-gray-500'>
          Không nhận được mã?{' '}
          {resendCooldown > 0 ? (
            <span className='text-blue-500 font-semibold'>Gửi lại sau ({resendCooldown}s)</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className='text-blue-500 hover:text-blue-700 font-bold transition-all disabled:opacity-50'
            >
              {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
          )}
        </div>

        <div className='mt-6 text-center text-xs'>
          <a href='/signup' className='text-gray-500 hover:text-gray-700 hover:underline transition-colors'>
            Quay lại trang Đăng ký
          </a>
        </div>

      </div>
    </div>
  );
}

export default function VerifySignUp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    }>
      <VerifySignUpContent />
    </Suspense>
  );
}
