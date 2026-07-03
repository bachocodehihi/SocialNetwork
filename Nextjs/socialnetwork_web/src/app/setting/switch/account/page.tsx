'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../../services/auth.service';
import { useAlert } from '../../../../components/Alert/alertcontext';
import { ArrowLeft, Users, Eye, EyeOff, Loader2, ArrowLeftRight } from 'lucide-react';

export default function SwitchAccountPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showError('Vui lòng nhập Email tài khoản muốn chuyển');
      return;
    }
    if (!password) {
      showError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      
      // Update session credentials
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        document.cookie = `token=${res.token}; path=/; max-age=2592000; SameSite=Lax`;
        showSuccess('Chuyển đổi tài khoản thành công!');
        router.push('/home');
      } else {
        showError('Không nhận được token xác thực');
      }
    } catch (err: any) {
      console.error('Error switching account:', err);
      showError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Chuyển tài khoản</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 border border-grey/20 shadow-sm">
          
          <div className="flex items-center gap-3.5 mb-6 border-b border-grey/10 pb-4 text-left">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black font-sans">Đăng nhập tài khoản khác</h3>
              <p className="text-xs text-grey font-medium mt-0.5">
                Nhập thông tin tài khoản bạn muốn chuyển đổi sang
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-grey uppercase tracking-wider">
                Email đăng nhập
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của tài khoản khác"
                className="w-full bg-grey/5 border border-grey/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-grey uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của tài khoản đó"
                  className="w-full bg-grey/5 border border-grey/20 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-grey-hover bg-transparent border-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue hover:bg-blue-hover text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow active:scale-[0.99] transition duration-200 cursor-pointer border-0 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang chuyển đổi...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-5 h-5" /> Chuyển tài khoản
                </>
              )}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
