'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAlert } from '../../../components/Alert/alertcontext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Alert from '../../../components/Alert/alert';
import GenderDialog from '../../../components/Dialogs/gender';
import BirthdayDialog from '../../../components/Dialogs/birthday';

function SignUpInformationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError } = useAlert();
  
  const email = searchParams.get('email') || '';

  // Form states
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [birthday, setBirthday] = useState(''); // Stores as YYYY-MM-DD
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dialog States
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isBirthdayOpen, setIsBirthdayOpen] = useState(false);

  // Block direct access or forward navigation if OTP was not verified
  useEffect(() => {
    const isVerified = sessionStorage.getItem('otp_verified');
    if (isVerified !== 'true') {
      showError('Bạn cần phải xác thực email trước khi nhập thông tin!');
      router.replace('/signup');
      return;
    }

    if (!email) {
      showError('Thiếu địa chỉ email xác thực. Vui lòng đăng ký lại!');
      router.replace('/signup');
    }
  }, [email, router, showError]);

  // Format date display as "1 - 1 - 2000" (d - m - yyyy) with spaces
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    return `${dayNum} - ${monthNum} - ${y}`;
  };

  const handleGenderConfirm = (selectedGender: 'Male' | 'Female' | 'Other') => {
    setGender(selectedGender);
    setIsGenderOpen(false);
    if (formError) setFormError(null);
  };

  const handleBirthdayConfirm = (year: number, month: number, day: number) => {
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setBirthday(formattedDate);
    setIsBirthdayOpen(false);
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim()) {
      setFormError('Vui lòng nhập Họ và tên!');
      return;
    }
    
    if (username.trim().length < 3) {
      setFormError('Họ và tên phải có ít nhất 3 ký tự!');
      return;
    }

    if (!birthday) {
      setFormError('Vui lòng chọn ngày sinh!');
      return;
    }

    const selectedDate = new Date(birthday);
    const today = new Date();
    if (selectedDate > today) {
      setFormError('Ngày sinh không hợp lệ!');
      return;
    }

    if (!password) {
      setFormError('Vui lòng nhập mật khẩu!');
      return;
    }

    if (password.length < 6) {
      setFormError('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      // Store in sessionStorage to pass to avatar page
      sessionStorage.setItem('signup_username', username.trim());
      sessionStorage.setItem('signup_gender', gender);
      sessionStorage.setItem('signup_birthday', birthday);
      sessionStorage.setItem('signup_password', password);

      // Redirect to select avatar page
      router.push(`/signup/avatar?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('Session storage error:', err);
      setFormError('Lỗi hệ thống. Vui lòng thử lại sau!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4 font-sans relative overflow-hidden'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm'>
        
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-extrabold text-gray-900 tracking-tight'>
            Personal information
          </h2>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5' noValidate>

          {/* Username */}
          <div>
            <label htmlFor='username' className='block text-sm font-bold text-gray-500 tracking-wider mb-2 ml-1'>
              Username
            </label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (formError) setFormError(null);
              }}
              className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-gray-700'
              placeholder='Username'
              required
            />
          </div>

          {/* Gender Trigger Input */}
          <div>
            <label htmlFor='gender' className='block text-sm font-bold text-gray-500 tracking-wider mb-2 ml-1'>
              Gender
            </label>
            <div className='relative'>
              <input
                id='gender'
                type='text'
                readOnly
                value={gender}
                onClick={() => setIsGenderOpen(true)}
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all cursor-pointer text-gray-700 select-none'
                placeholder='Gender'
                required
              />
              <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                </svg>
              </div>
            </div>
          </div>

          {/* Birthday Trigger Input */}
          <div>
            <label htmlFor='birthday' className='block text-sm font-bold text-gray-500 tracking-wider mb-2 ml-1'>
              Birthday
            </label>
            <div className='relative'>
              <input
                id='birthday'
                type='text'
                readOnly
                value={formatDateDisplay(birthday)}
                onClick={() => setIsBirthdayOpen(true)}
                className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all cursor-pointer text-gray-700 select-none'
                placeholder='Birthday'
                required
              />
              <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                </svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor='password' className='block text-sm font-bold text-gray-500 tracking-wider mb-2 ml-1'>
              Password
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                className='w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-gray-700'
                placeholder='Tối thiểu 6 ký tự'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
              >
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-bold text-gray-500 tracking-wider mb-2 ml-1'>
              Confirm password
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                className='w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none transition-all text-gray-700'
                placeholder='Tối thiểu 6 ký tự'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
              >
                {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
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

          {/* Action Buttons */}
          <div className='flex gap-3 mt-6'>
            <button
              type='button'
              onClick={() => {
                sessionStorage.removeItem('otp_verified');
                router.replace('/signup');
              }}
              className='flex-1 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-500 hover:text-gray-700 font-bold py-3.5 rounded-xl transition-all duration-200'
            >
              Back
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 bg-blue hover:bg-blue-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue/25 flex items-center justify-center gap-2'
            >
              {isLoading && <Loader2 className='animate-spin h-5 w-5' />}
              <span>Continue</span>
            </button>
          </div>

        </form>

      </div>

      {/* Extracted Gender Dialog */}
      <GenderDialog
        isOpen={isGenderOpen}
        initialGender={gender}
        onClose={() => setIsGenderOpen(false)}
        onConfirm={handleGenderConfirm}
      />

      {/* Extracted Birthday Dialog */}
      <BirthdayDialog
        isOpen={isBirthdayOpen}
        initialDate={birthday}
        onClose={() => setIsBirthdayOpen(false)}
        onConfirm={handleBirthdayConfirm}
      />

      {/* Global CSS to hide scrollbars */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-none {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Hide native Microsoft Edge/Windows reveal password eye button */
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
        
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
          animation: scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default function SignUpInformation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
        <Loader2 className="animate-spin h-10 w-10 text-blue" />
      </div>
    }>
      <SignUpInformationContent />
    </Suspense>
  );
}
