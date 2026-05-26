'use client';
import { useState, useEffect } from 'react';
import { useAlert } from '../../components/Alert/alertcontext';
import { Loader2, UserPlus } from 'lucide-react';
import Alert from '../../components/Alert/alert';
import { authService } from '../../services/auth.service';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { showSuccess, showWarning } = useAlert();
  const router = useRouter();

  // Clear all temporary registration data on mount
  useEffect(() => {
    sessionStorage.removeItem('otp_verified');
    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('signup_username');
    sessionStorage.removeItem('signup_gender');
    sessionStorage.removeItem('signup_birthday');
    sessionStorage.removeItem('signup_password');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Vui lòng nhập Email để đăng ký!');
      return;
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Địa chỉ Email không hợp lệ!');
      return;
    }

    setIsLoading(true);

    try {
      const checkRes = await authService.checkEmail(trimmedEmail);
      if (checkRes.exists) {
        setFormError('Email đã tồn tại!');
        setIsLoading(false);
        return;
      }

      const otpRes = await authService.sendOtp(trimmedEmail);
      if (otpRes.success) {
        showSuccess('Mã OTP đã được gửi đến email của bạn.');
        router.push(`/verify/signup?email=${encodeURIComponent(trimmedEmail)}`);
      } else {
        setFormError('Không thể gửi mã OTP. Vui lòng thử lại!');
      }
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra đăng ký:', error);
      const errMsg = error.response?.data?.code || error.message || '';
      if (errMsg === 'EMAIL_REGISTERED') {
        setFormError('Email đã tồn tại!');
      } else {
        setFormError('Lỗi kết nối máy chủ. Vui lòng thử lại sau!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    showWarning('Đang chuyển hướng đến Google...');
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4 font-sans'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm'>

        <div className='text-center mb-8'>
          <div className='bg-blue w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <UserPlus className='w-8 h-8 text-blue' />
          </div>
          <h2 className='text-xl font-extrabold text-gray-900 tracking-tight'>
            Create Account
          </h2>
          <p className='text-gray-500 mt-2'>Join our community today</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6' noValidate>

          <div>
            <label htmlFor='email' className='block text-sm font-bold text-gray-500 tracking-wider mb-2 ml-1'>
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
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all ${formError && !email ? 'border-red focus:ring-red/20' : 'border-gray-200 focus:ring-blue/20 focus:border-blue'
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

          <div className='relative py-4'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-100'></div>
            </div>
            <div className='relative flex justify-center text-sm tracking-widest'>
              <span className='px-4 bg-white text-gray-500 font-medium'>Or continue with</span>
            </div>
          </div>

          <button
            type='button'
            onClick={handleGoogleSignup}
            className='w-full bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-bold py-3 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-3'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
              <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
              <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
              <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
            </svg>
            Sign up with Google
          </button>

        </form>

        <div className='mt-8 text-center text-sm text-gray-500'>
          Already have an account?{' '}
          <a href='/signin' className='text-blue hover:text-blue-hover font-bold transition-colors'>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
