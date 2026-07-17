'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { Loader2, Upload, Check } from 'lucide-react';
import Alert from '../../../components/Alert/alert';

const DEFAULT_AVATAR_PATH = '/assets/avatar/avatar.jpg';

function SignUpAvatarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError } = useAlert();
  
  const email = searchParams.get('email') || '';

  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');

  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(DEFAULT_AVATAR_PATH);
  const [customAvatarBase64, setCustomAvatarBase64] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  useEffect(() => {
    const isVerified = sessionStorage.getItem('otp_verified');
    const storedUsername = sessionStorage.getItem('signup_username');
    const storedGender = sessionStorage.getItem('signup_gender');
    const storedBirthday = sessionStorage.getItem('signup_birthday');
    const storedPassword = sessionStorage.getItem('signup_password');

    if (isVerified !== 'true' || !email || !storedUsername || !storedGender || !storedBirthday || !storedPassword) {
      showError('Thiếu dữ liệu đăng ký. Vui lòng thử lại!');
      router.push('/signup');
      return;
    }

    setUsername(storedUsername);
    setGender(storedGender);
    setBirthday(storedBirthday);
    setPassword(storedPassword);
  }, [email, router, showError]);

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Kích thước ảnh đại diện tối đa là 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Str = reader.result as string;
      setCustomAvatarBase64(base64Str);
      setSelectedAvatarUrl(base64Str);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {

      const registerPayload: any = {
        email,
        username,
        password,
        birthday,
        gender
      };

      if (customAvatarBase64) {
        registerPayload.avatar = customAvatarBase64;
      }

      const res = await authService.register(registerPayload);

      if (res.success || res.code === 'REGISTER_SUCCESS') {

        setIsSuccessDialogOpen(true);
        
        sessionStorage.removeItem('signup_username');
        sessionStorage.removeItem('signup_gender');
        sessionStorage.removeItem('signup_birthday');
        sessionStorage.removeItem('signup_password');
        sessionStorage.removeItem('otp_verified');

        setTimeout(() => {
          router.push('/signin');
        }, 2200);
      } else {
        setFormError('Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (err: any) {
      console.error('Registration API error:', err);
      const code = err.response?.data?.code || err.message;
      if (code === 'EMAIL_REGISTERED') {
        setFormError('Email này đã được sử dụng!');
      } else {
        setFormError('Lỗi hệ thống trong quá trình đăng ký. Vui lòng thử lại sau!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900 p-4 font-sans relative overflow-hidden'>
      <div className='w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-sm p-8 border border-grey/20 dark:border-zinc-800'>
        
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-extrabold text-grey-hover dark:text-zinc-100 tracking-tight select-none'>
            Choose your avatar
          </h2>
          <p className='text-grey dark:text-zinc-400 mt-2 text-sm px-4 select-none'>
            Confirm your profile avatar or upload a new photo from your device
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>

          <div className='flex flex-col items-center justify-center'>
            <div className='relative w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl shadow-blue/10 ring-4 ring-blue/20 bg-grey/5 dark:bg-zinc-800 flex items-center justify-center'>
              <img
                src={selectedAvatarUrl}
                alt='Profile Avatar'
                className='w-full h-full object-cover select-none'
              />
            </div>
            <span className='mt-2.5 text-xs text-grey/60 font-semibold uppercase tracking-wider select-none'>
              Avatar Preview
            </span>
          </div>

          <div>
            <span className='block text-sm font-bold text-grey dark:text-zinc-300 tracking-wider mb-2 ml-1 select-none'>
              Custom photo
            </span>
            <label className='flex items-center justify-center gap-2.5 w-full px-4 py-3 border-2 border-dashed border-grey/20 dark:border-zinc-700/60 hover:border-blue rounded-xl bg-grey/5 dark:bg-zinc-800/30 hover:bg-blue-hover/10 cursor-pointer transition-all duration-200 group text-grey dark:text-zinc-400 hover:text-blue-hover'>
              <Upload className='w-5 h-5 group-hover:scale-110 transition-transform' />
              <span className='text-sm font-bold tracking-wide'>
                {customAvatarBase64 ? 'Change custom photo' : 'Upload photo'}
              </span>
              <input
                type='file'
                accept='image/*'
                onChange={handleCustomAvatarUpload}
                className='hidden'
              />
            </label>
          </div>

          {formError && (
            <Alert 
              message={formError} 
              type="error" 
              isInline={true} 
              onClose={() => setFormError(null)} 
            />
          )}

          <div className='flex gap-3 mt-6'>
            <button
              type='button'
              onClick={() => router.back()}
              className='flex-1 border border-grey/20 dark:border-zinc-750 hover:bg-grey/5 dark:hover:bg-zinc-800 active:scale-[0.98] text-grey dark:text-zinc-400 hover:text-grey-hover dark:hover:text-zinc-200 font-bold py-3.5 rounded-xl transition-all duration-200'
            >
              Back
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 bg-blue hover:bg-blue-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue/25 flex items-center justify-center gap-2'
            >
              {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
              <span>Register</span>
            </button>
          </div>

        </form>

      </div>

      {isSuccessDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-xs w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-scale-up border border-gray-50 dark:border-zinc-800 select-none'>
            
            <div className='w-16 h-16 bg-green text-green rounded-full flex items-center justify-center mb-5 ring-8 ring-green/50 shadow-sm'>
              <Check className='w-8 h-8 stroke-[3]' />
            </div>

            <h3 className='text-lg font-bold text-grey-hover dark:text-zinc-100 mb-1.5'>
              Đăng ký thành công!
            </h3>
            <p className='text-grey dark:text-zinc-400 text-sm font-medium leading-relaxed px-1'>
              Tài khoản của bạn đã được khởi tạo thành công. Đang chuyển hướng...
            </p>

          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default function SignUpAvatar() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900">
        <Loader2 className="animate-spin h-10 w-10 text-blue" />
      </div>
    }>
      <SignUpAvatarContent />
    </Suspense>
  );
}
