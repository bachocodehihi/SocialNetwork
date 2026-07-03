'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../../../services/auth.service';
import { useAlert } from '../../../../../components/Alert/alertcontext';
import { ArrowLeft, KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setEmail(data.email);
      } catch (err) {
        console.error('Error fetching email for password change:', err);
        showError('Không thể lấy thông tin tài khoản');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      showError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải từ 6 ký tự trở lên');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSaving(true);
    try {
      await authService.forgotPassword(email, newPassword);
      showSuccess('Cập nhật mật khẩu mới thành công!');
      router.push('/setting/account');
    } catch (err) {
      console.error('Error changing password:', err);
      showError('Đã xảy ra lỗi khi thay đổi mật khẩu');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-grey/5">
        <Loader2 className="w-10 h-10 animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey/5 pb-16 font-sans text-grey-hover">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-grey/20 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3.5">
          <button 
            onClick={() => router.push('/setting/account')}
            className="w-10 h-10 rounded-full hover:bg-grey/10 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Thay đổi mật khẩu</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 border border-grey/20 shadow-sm">
          <div className="flex items-center gap-3.5 mb-6 border-b border-grey/10 pb-4 text-left">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black">Thiết lập mật khẩu mới</h3>
              <p className="text-xs text-grey font-medium mt-0.5">
                Bảo vệ tài khoản {email} bằng một mật khẩu mạnh mẽ
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-grey uppercase tracking-wider">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập ít nhất 6 ký tự"
                  className="w-full bg-grey/5 border border-grey/20 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-grey-hover bg-transparent border-0 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-grey uppercase tracking-wider">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-grey/5 border border-grey/20 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-grey-hover bg-transparent border-0 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue hover:bg-blue-hover text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow active:scale-[0.99] transition duration-200 cursor-pointer border-0 mt-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Cập nhật mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
