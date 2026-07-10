'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '../../components/Alert/alertcontext';
import { Loader2 } from 'lucide-react';
import Alert from '../../components/Alert/alert';
import { authService } from '../../services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { showSuccess } = useAlert();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Vui lòng nhập Email để khôi phục mật khẩu!');
      return;
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Địa chỉ Email không hợp lệ!');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if email exists in database
      const checkRes = await authService.checkEmail(trimmedEmail);
      if (!checkRes.exists) {
        setFormError('Email này chưa được đăng ký trong hệ thống!');
        setIsLoading(false);
        return;
      }

      // 2. If exists, send OTP for password reset
      const otpRes = await authService.sendOtp(trimmedEmail);
      if (otpRes.success) {
        showSuccess('Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn.');
        router.push(`/verify/forgot?email=${encodeURIComponent(trimmedEmail)}`);
      } else {
        setFormError('Không thể gửi mã OTP. Vui lòng thử lại!');
      }
    } catch (error: any) {
      console.error('Lỗi khi khôi phục mật khẩu:', error);
      setFormError('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
    } finally {
      setIsLoading(false);
    }
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
            Forgot password?
          </h2>
          <p className='text-grey dark:text-zinc-400 mt-2 text-sm px-6'>
            Enter your registered email below to receive a verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6' noValidate>
          <div>
            <label htmlFor='email' className='block text-sm font-bold text-black dark:text-zinc-200 tracking-wider mb-2 ml-1'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError(null);
              }}
              className={`w-full px-4 py-3 bg-grey/5 dark:bg-zinc-800/50 border rounded-xl focus:ring-2 outline-none transition-all text-black dark:text-zinc-100 ${
                formError ? 'border-red focus:ring-red/20' : 'border-grey/20 dark:border-zinc-700/60 focus:ring-blue/20 focus:border-blue'
              }`}
              placeholder='Email@example.com'
            />
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
            disabled={isLoading}
            className='w-full bg-blue hover:bg-blue-hover active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue/25 flex items-center justify-center gap-2'
          >
            {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
            <span>Continue</span>
          </button>
        </form>

        <div className='mt-8 text-center text-sm text-grey dark:text-zinc-400'>
          Remembered your password?{' '}
          <a href='/signin' className='text-blue hover:text-blue-hover font-bold transition-colors'>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
