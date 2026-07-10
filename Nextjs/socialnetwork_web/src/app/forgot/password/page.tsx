'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { Loader2 } from 'lucide-react';
import Alert from '../../../components/Alert/alert';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess } = useAlert();
  
  const email = searchParams.get('email') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const isVerified = sessionStorage.getItem('forgot_otp_verified');
    if (isVerified !== 'true' || !email) {
      router.replace('/forgot');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const pass = newPassword.trim();
    const conf = confirmPassword.trim();

    if (!pass) {
      setFormError('Vui lòng nhập mật khẩu mới!');
      return;
    }

    if (pass.length < 6) {
      setFormError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (pass !== conf) {
      setFormError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email, pass);
      if (res.success) {
        sessionStorage.removeItem('forgot_otp_verified');
        
        showSuccess('Khôi phục mật khẩu thành công! Đang chuyển hướng đăng nhập...');
        setTimeout(() => {
          router.replace('/signin');
        }, 2000);
      } else {
        setFormError('Khôi phục mật khẩu thất bại. Vui lòng thử lại!');
      }
    } catch (err: any) {
      console.error('Lỗi khi thiết lập mật khẩu mới:', err);
      setFormError('Lỗi máy chủ hoặc kết nối. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900 p-4 font-sans'>
      <div className='w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-zinc-800 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200'>
        
        <div className='text-center mb-8'>
          <div className='w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 border border-grey/10 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-800 p-1'>
            <img
              src='/assets/logo/logo.png'
              alt='SocialNetwork Logo'
              className='w-full h-full object-cover rounded-xl'
            />
          </div>
          <h2 className='text-2xl font-extrabold text-black dark:text-zinc-100 tracking-tight'>
            Thiết lập mật khẩu mới
          </h2>
          <p className='text-grey dark:text-zinc-400 mt-2 text-sm px-6'>
            Nhập mật khẩu mới cho tài khoản:
          </p>
          <p className='text-blue font-semibold text-sm break-all mt-1'>
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5' noValidate>
          <div>
            <label htmlFor='newPassword' className='block text-sm font-bold text-black dark:text-zinc-200 tracking-wider mb-2 ml-1'>
              Mật khẩu mới
            </label>
            <input
              id='newPassword'
              type='password'
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              className={`w-full px-4 py-3 bg-grey/5 dark:bg-zinc-800/50 border rounded-xl focus:ring-2 outline-none transition-all text-black dark:text-zinc-100 ${
                formError && !newPassword ? 'border-red focus:ring-red/20' : 'border-grey/20 dark:border-zinc-700/60 focus:ring-blue/20 focus:border-blue'
              }`}
              placeholder='Nhập mật khẩu mới (ít nhất 6 ký tự)'
            />
          </div>

          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-bold text-black dark:text-zinc-200 tracking-wider mb-2 ml-1'>
              Nhập lại mật khẩu mới
            </label>
            <input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              className={`w-full px-4 py-3 bg-grey/5 dark:bg-zinc-800/50 border rounded-xl focus:ring-2 outline-none transition-all text-black dark:text-zinc-100 ${
                formError && newPassword !== confirmPassword ? 'border-red focus:ring-red/20' : 'border-grey/20 dark:border-zinc-700/60 focus:ring-blue/20 focus:border-blue'
              }`}
              placeholder='Nhập lại mật khẩu mới'
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
            className='w-full bg-blue hover:bg-blue-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue/25 flex items-center justify-center gap-2 mt-2'
          >
            {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
            <span>Đổi mật khẩu</span>
          </button>
        </form>

      </div>
    </div>
  );
}

export default function ForgotPasswordReset() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900">
        <Loader2 className="animate-spin h-10 w-10 text-blue" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
