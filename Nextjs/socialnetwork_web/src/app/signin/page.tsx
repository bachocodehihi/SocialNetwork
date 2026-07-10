'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAlert } from '../../components/Alert/alertcontext';
import { Loader2, RefreshCw, Mail, QrCode, Eye, EyeOff } from 'lucide-react';
import Alert from '../../components/Alert/alert';

export default function SignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<'email' | 'qr'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [qrSessionId, setQrSessionId] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [qrStatus, setQrStatus] = useState<'waiting' | 'scanned' | 'success'>('waiting');
  
  const { showError, showSuccess, showWarning } = useAlert();

  // Redirect to home or saved redirect path if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        router.replace(redirectPath);
      } else {
        router.replace('/home');
      }
    }
  }, [router]);

  useEffect(() => {
    if (mode === 'qr') {
      fetchQRCode();
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'qr' || !qrSessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await authService.checkQRStatus(qrSessionId);
        setQrStatus(res.status);
        
        if (res.status === 'confirmed') {
          localStorage.setItem('token', res.token);
          document.cookie = `token=${res.token}; path=/; max-age=604800; SameSite=Lax`;
          showSuccess('Đăng nhập thành công!');
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
            localStorage.removeItem('redirectAfterLogin');
            router.replace(redirectPath);
          } else {
            router.replace('/home');
          }
        }
      } catch (err) {
        console.error('Lỗi check QR:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mode, qrSessionId, showSuccess, router]);

  const fetchQRCode = async () => {
    try {
      setQrStatus('waiting');
      const res = await authService.generateQR();
      setQrSessionId(res.data.sessionId);
      setQrCodeImage(res.data.qrCodeImage);
    } catch (err) {
      console.error('Lỗi lấy QR:', err);
      showError('Không thể tạo mã QR. Vui lòng thử lại.');
    }
  };

  const handleRefreshQR = () => {
    fetchQRCode();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Vui lòng nhập địa chỉ Email của bạn!');
      return;
    }

    if (!password.trim()) {
      setFormError('Vui lòng nhập mật khẩu!');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Check if email exists
      const checkRes = await authService.checkEmail(trimmedEmail);
      if (!checkRes.exists) {
        setFormError('Email chưa tồn tại!');
        setIsLoading(false);
        return;
      }

      const loginRes = await authService.login({ email: trimmedEmail, password });
      if (loginRes.success || loginRes.token) {
        localStorage.setItem('token', loginRes.token);
        document.cookie = `token=${loginRes.token}; path=/; max-age=604800; SameSite=Lax`;
        showSuccess('Đăng nhập thành công!');
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          router.replace(redirectPath);
        } else {
          router.replace('/home');
        }
      } else {
        setFormError('Email hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
      const code = err.response?.data?.code || err.message;
      if (code === 'EMAIL_NOT_EXIST') {
        setFormError('Email chưa tồn tại!');
      } else if (code === 'INVALID_PASSWORD') {
        setFormError('Mật khẩu không chính xác!');
      } else {
        setFormError('Email hoặc mật khẩu không chính xác!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      const idToken = response.credential;
      console.log('🟢 Google ID Token received:', idToken);
      
      const res = await authService.googleLogin(idToken);
      if (res.success) {
        const { token, user } = res;
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        localStorage.setItem('user', JSON.stringify(user));
        
        showSuccess('Đăng nhập bằng Google thành công!');
        
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectPath;
        } else {
          window.location.href = '/home';
        }
      } else {
        showError('Đăng nhập bằng Google thất bại!');
      }
    } catch (err: any) {
      console.error('Error Google Sign-in:', err);
      showError(err.response?.data?.message || 'Đăng nhập Google thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window !== 'undefined') {
      const client_id = '706195528798-4c1hmi2jnpf940u04n7d0gv4n2h5t0vs.apps.googleusercontent.com';
      const redirect_uri = encodeURIComponent(window.location.origin + window.location.pathname);
      const nonce = Math.random().toString(36).substring(2);
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}`;
      window.location.href = googleAuthUrl;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const idToken = params.get('id_token');
        if (idToken) {
          window.history.replaceState(null, '', window.location.pathname);
          handleCredentialResponse({ credential: idToken });
        }
      }
    }
  }, []);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        const google = (window as any).google;
        
        google.accounts.id.initialize({
          client_id: '706195528798-4c1hmi2jnpf940u04n7d0gv4n2h5t0vs.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
        });

        const btnParent = document.getElementById('google-signin-btn-container');
        if (btnParent) {
          google.accounts.id.renderButton(
            btnParent,
            { 
              theme: 'outline', 
              size: 'large', 
              width: btnParent.clientWidth || 380,
              type: 'standard',
            }
          );
        }
      }
    };

    if (typeof window !== 'undefined' && (window as any).google) {
      initializeGoogleSignIn();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).google) {
          clearInterval(checkInterval);
          initializeGoogleSignIn();
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }
  }, [mode]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-zinc-950 dark:to-zinc-900 p-4 font-sans'>
      <div className='w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-sm overflow-hidden border border-grey/20 dark:border-zinc-800'>

        <div className='flex border-b border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-900/50'>
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'email'
                ? 'text-blue border-b-2 border-blue bg-white dark:bg-zinc-900'
                : 'text-grey dark:text-zinc-400 hover:text-grey-hover dark:hover:text-zinc-200 hover:bg-grey/5 dark:hover:bg-zinc-800/30'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'qr'
                ? 'text-blue border-b-2 border-blue bg-white dark:bg-zinc-900'
                : 'text-grey dark:text-zinc-400 hover:text-grey-hover dark:hover:text-zinc-200 hover:bg-grey/5 dark:hover:bg-zinc-800/30'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        </div>

        <div className='p-8'>
          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className='space-y-5' noValidate>
              <div>
                <div className='text-center mb-2'>
                  <h2 className='text-xl font-bold text-black dark:text-zinc-100 tracking-tight'>
                    Sign in
                  </h2>
                </div>
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
                    formError && !email ? 'border-red focus:ring-red/20' : 'border-grey/20 dark:border-zinc-700/60 focus:ring-blue/20 focus:border-blue'
                  }`}
                  placeholder='Email@example.com'
                />
              </div>
              <div>
                <label htmlFor='password' className='block text-sm font-bold text-black dark:text-zinc-200 tracking-wider mb-2 ml-1'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError && email) setFormError(null);
                    }}
                    className={`w-full pl-4 pr-12 py-3 bg-grey/5 dark:bg-zinc-800/50 border rounded-xl focus:ring-2 outline-none transition-all text-black dark:text-zinc-100 ${
                      formError && email && !password ? 'border-red focus:ring-red/20' : 'border-grey/20 dark:border-zinc-700/60 focus:ring-blue/20 focus:border-blue'
                    }`}
                    placeholder='Password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-grey dark:text-zinc-400 hover:text-grey-hover dark:hover:text-zinc-200 transition-colors'
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>
              
              <div className='flex justify-end text-sm px-1'>
                <a href='/forgot' className='text-blue hover:text-blue-hover font-bold transition-colors'>
                  Forgot password?
                </a>
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
                <span>Sign in</span>
              </button>

              <div className='relative py-4'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-grey/20 dark:border-zinc-800'></div>
                </div>
                <div className='relative flex justify-center text-sm tracking-widest'>
                  <span className='px-4 bg-white dark:bg-zinc-900 text-grey dark:text-zinc-400 font-medium'>Or continue with</span>
                </div>
              </div>

              <div className='relative w-full h-[50px]'>
                <button
                  type='button'
                  className='absolute inset-0 w-full h-full bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-zinc-600 active:scale-[0.98] text-black dark:text-zinc-200 font-bold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3 pointer-events-none'
                >
                  <svg className='w-5 h-5' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
                    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
                    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
                    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
                  </svg>
                  Sign in with Google
                </button>
                <div 
                  id="google-signin-btn-container" 
                  className="absolute inset-0 w-full h-full opacity-0 hover:opacity-[0.01] active:opacity-[0.01]"
                />
              </div>
            </form>
          ) : (
            <div className='text-center space-y-6'>
              <div className='bg-grey/5 dark:bg-zinc-800/50 p-6 rounded-3xl inline-block border border-grey/10 dark:border-zinc-800 relative shadow-inner'>

                {qrCodeImage ? (
                  <img
                    src={qrCodeImage}
                    alt='QR Code'
                    className='w-48 h-48 object-contain rounded-xl'
                  />
                ) : (
                  <div className='w-48 h-48 flex items-center justify-center'>
                    <Loader2 className='animate-spin h-10 w-10 text-blue opacity-20' />
                  </div>
                )}
                
                {qrStatus === 'scanned' && (
                  <div className='absolute inset-0 bg-white/90 dark:bg-zinc-900/90 flex flex-col items-center justify-center rounded-3xl backdrop-blur-[2px]'>
                    <div className='bg-green p-3 rounded-full mb-2'>
                      <div className='w-6 h-6 text-green font-bold'>✓</div>
                    </div>
                    <span className='text-green font-bold text-sm'>Scanned!</span>
                  </div>
                )}
                {qrStatus === 'success' && (
                  <div className='absolute inset-0 bg-white/90 dark:bg-zinc-900/90 flex flex-col items-center justify-center rounded-3xl backdrop-blur-[2px]'>
                     <Loader2 className='animate-spin h-8 w-8 text-blue mb-2' />
                    <span className='text-blue font-bold text-sm'>Logging in...</span>
                  </div>
                )}
              </div>
              
              <div className='space-y-2'>
                <p className='text-black dark:text-zinc-100 font-bold text-xl'>
                  {qrStatus === 'waiting' && 'Scan QR Code'}
                  {qrStatus === 'scanned' && 'Wait for confirmation'}
                  {qrStatus === 'success' && 'Redirecting...'}
                </p>
                <p className='text-sm text-grey dark:text-zinc-400 px-8'>
                  Open your mobile app and scan this code to sign in instantly.
                </p>
              </div>
              
              <button
                onClick={handleRefreshQR}
                className='text-sm text-blue hover:text-blue-hover font-bold transition-all flex items-center gap-2 mx-auto px-4 py-2 hover:bg-blue/10 dark:hover:bg-blue/20 rounded-lg'
              >
                <RefreshCw className="w-4 h-4" />
                Refresh QR Code
              </button>
            </div>
          )}
        </div>

        <div className='px-8 pb-8 text-center text-sm text-grey dark:text-zinc-400 bg-grey/5 dark:bg-zinc-900/50 border-t border-grey/10 dark:border-zinc-800/80 pt-6'>
          Don't have an account?{' '}
          <a href='/signup' className='text-blue hover:text-blue-hover font-bold transition-colors'>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
