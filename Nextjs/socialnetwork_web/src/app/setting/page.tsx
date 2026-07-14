'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { accountService } from '../../services/accout.service';
import { contactService } from '../../services/contact.service';
import { useAlert } from '../../components/Alert/alertcontext';
import Navbar from '../../components/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ArrowLeft,
  User, 
  Lock, 
  Activity, 
  Bell, 
  Moon, 
  Globe, 
  RefreshCw, 
  LogOut, 
  ChevronRight,
  Mail,
  Loader2,
  Settings,
  UserSquare2,
  KeyRound,
  UserX,
  Search,
  MapPin,
  Phone,
  Briefcase,
  Cake,
  Users2,
  Save,
  Check,
  Volume2,
  Heart,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  ArrowLeftRight,
  ShieldCheck,
  BarChart2,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function SettingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const { changeLanguage, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Layout states
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Darkmode states
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Language states
  const [currentLang, setCurrentLang] = useState('vi');

  // Privacy states
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    email: true,
    phone: true,
    address: true,
    birthday: true,
    gender: true,
    job: true,
    nationality: true,
    isPrivate: false,
    relationship: true
  });

  // Activity states
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [weekDayMinutes, setWeekDayMinutes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Notification states
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    soundEnabled: true,
    emailAlerts: false,
    messageAlerts: true,
    interactionAlerts: true
  });

  // Change Info states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');
  const [nationality, setNationality] = useState('');
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  // Relationship states
  const [friends, setFriends] = useState<any[]>([]);
  const [relStatus, setRelStatus] = useState('none');
  const [relPartner, setRelPartner] = useState('');
  const [isSavingRel, setIsSavingRel] = useState(false);
  const [relationshipRequests, setRelationshipRequests] = useState<any[]>([]);

  // Change Password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete Account states
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Switch Account states
  const [switchEmail, setSwitchEmail] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Fetch initial profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setUser(data);
      } catch (err) {
        console.error('Error fetching profile in settings:', err);
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.replace('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Load Dark Mode & Language settings on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);

    const savedLang = localStorage.getItem('language') || 'vi';
    setCurrentLang(savedLang);
    
    // Check if query params have active tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveSection(tab);
      }
    }
  }, []);

  // Fetch Privacy Settings
  useEffect(() => {
    if (activeSection === 'privacy') {
      const fetchPrivacy = async () => {
        setLoadingPrivacy(true);
        try {
          const data = await accountService.getPrivacy();
          if (data) {
            setPrivacySettings({
              email: data.email ?? true,
              phone: data.phone ?? true,
              address: data.address ?? true,
              birthday: data.birthday ?? true,
              gender: data.gender ?? true,
              job: data.job ?? true,
              nationality: data.nationality ?? true,
              isPrivate: data.isPrivate ?? false,
              relationship: data.relationship ?? true
            });
          }
        } catch (err) {
          console.error(err);
          showError('Không thể tải cài đặt quyền riêng tư');
        } finally {
          setLoadingPrivacy(false);
        }
      };
      fetchPrivacy();
    }
  }, [activeSection]);

  // Fetch Activity Log
  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await accountService.getActivity();
      if (res && res.success && Array.isArray(res.data)) {
        const mins = [0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < res.data.length && i < 7; i++) {
          mins[i] = res.data[i].minutes || 0;
        }
        setWeekDayMinutes(mins);
      } else if (Array.isArray(res)) {
        const mins = [0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < res.length && i < 7; i++) {
          mins[i] = res[i].minutes || 0;
        }
        setWeekDayMinutes(mins);
      }
    } catch (err) {
      console.error(err);
      showError('Không thể tải nhật ký hoạt động');
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'activity') {
      fetchActivity();
    }
  }, [activeSection]);

  // Fetch Profile Info for editing
  useEffect(() => {
    if (activeSection === 'change-info') {
      const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
          const data = await accountService.getProfile();
          setProfile(data);
          setAddress(data.address || '');
          setPhone(data.phone || '');
          setJob(data.job || '');
          setNationality(data.nationality || '');
          setRelStatus(data.relationship?.status || 'none');
          setRelPartner(data.relationship?.partner?._id || data.relationship?.partner || '');
          setRelationshipRequests(data.relationshipRequests || []);

          try {
            const friendsData = await contactService.getFriends();
            if (friendsData && friendsData.success) {
              setFriends(friendsData.friends || []);
            } else if (Array.isArray(friendsData)) {
              setFriends(friendsData);
            }
          } catch (e) {
            console.error('Error fetching friends list:', e);
          }
        } catch (err) {
          console.error(err);
          showError('Không thể tải thông tin tài khoản');
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [activeSection]);

  // Load Notification settings
  useEffect(() => {
    if (activeSection === 'notification') {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        try {
          setNotificationSettings(JSON.parse(saved));
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [activeSection]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    showSuccess('Đăng xuất thành công!');
    router.replace('/signin');
  };

  const handleSelectSection = (section: string | null) => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (section) {
        url.searchParams.set('tab', section);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  const getParentSection = (section: string | null): string | null => {
    if (!section) return null;
    if (['change-info', 'change-password', 'delete-account'].includes(section)) {
      return 'account';
    }
    return null;
  };

  // Toggle Dark Mode
  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      showSuccess('Đã chuyển sang Chế độ tối!');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      showSuccess('Đã chuyển sang Chế độ sáng!');
    }
  };

  // Select Language
  const handleSelectLanguage = (code: string) => {
    setCurrentLang(code);
    changeLanguage(code as 'vi' | 'en');
    showSuccess(code === 'vi' ? 'Đã đổi ngôn ngữ sang Tiếng Việt!' : 'Language changed to English!');
  };

  // Toggle Privacy Field
  const handleTogglePrivacy = async (key: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setPrivacySettings(prev => ({ ...prev, [key]: newValue }));
    try {
      await accountService.updatePrivacy({ [key]: newValue });
      showSuccess('Cập nhật quyền riêng tư thành công!');
    } catch (err) {
      console.error(err);
      showError('Không thể cập nhật cài đặt. Đang khôi phục...');
      setPrivacySettings(prev => ({ ...prev, [key]: currentValue }));
    }
  };

  // Toggle Notification Field
  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    const nextState = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(nextState);
    localStorage.setItem('notification_settings', JSON.stringify(nextState));
    showSuccess('Cập nhật cài đặt thông báo thành công!');
  };

  // Save editable fields
  const handleSaveField = async (field: 'address' | 'phone' | 'job' | 'nationality', value: string) => {
    setIsSaving(prev => ({ ...prev, [field]: true }));
    try {
      if (field === 'address') {
        await accountService.addAddress(value);
      } else if (field === 'phone') {
        await accountService.addPhone(value);
      } else if (field === 'job') {
        await accountService.addJob(value);
      } else if (field === 'nationality') {
        await accountService.addNationality(value);
      }
      showSuccess(`Cập nhật thành công!`);
    } catch (err) {
      console.error(err);
      showError('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSaveRelationship = async () => {
    setIsSavingRel(true);
    try {
      const payload = {
        status: relStatus,
        partner: relStatus === 'none' || relStatus === 'single' ? null : relPartner
      };
      
      const res = await authService.updateProfile({
        relationship: JSON.stringify(payload)
      });
      
      if (res && res.success) {
        showSuccess('Cập nhật trạng thái mối quan hệ thành công!');
        // Refresh profile data
        const updated = await accountService.getProfile();
        setProfile(updated);
        setRelStatus(updated.relationship?.status || 'none');
        setRelPartner(updated.relationship?.partner?._id || updated.relationship?.partner || '');
        setRelationshipRequests(updated.relationshipRequests || []);
      } else {
        showError('Không thể cập nhật trạng thái mối quan hệ.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Không thể cập nhật trạng thái mối quan hệ.');
    } finally {
      setIsSavingRel(false);
    }
  };

  const handleAcceptRelationshipRequest = async (requesterId: string) => {
    try {
      await accountService.acceptRelationship(requesterId);
      showSuccess('Đã chấp nhận lời mời kết đôi!');
      // Refresh profile data
      const updated = await accountService.getProfile();
      setProfile(updated);
      setRelStatus(updated.relationship?.status || 'none');
      setRelPartner(updated.relationship?.partner?._id || updated.relationship?.partner || '');
      setRelationshipRequests(updated.relationshipRequests || []);
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Đã xảy ra lỗi.');
    }
  };

  const handleRejectRelationshipRequest = async (requesterId: string) => {
    try {
      await accountService.rejectRelationship(requesterId);
      showSuccess('Đã từ chối lời mời kết đôi.');
      // Refresh profile data
      const updated = await accountService.getProfile();
      setProfile(updated);
      setRelStatus(updated.relationship?.status || 'none');
      setRelPartner(updated.relationship?.partner?._id || updated.relationship?.partner || '');
      setRelationshipRequests(updated.relationshipRequests || []);
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Đã xảy ra lỗi.');
    }
  };

  // Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
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

    setIsSavingPassword(true);
    try {
      await authService.forgotPassword(user?.email, newPassword);
      showSuccess('Cập nhật mật khẩu mới thành công!');
      setNewPassword('');
      setConfirmPassword('');
      handleSelectSection('account');
    } catch (err) {
      console.error(err);
      showError('Đã xảy ra lỗi khi thay đổi mật khẩu');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Delete Account Submit
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      showError('Vui lòng nhập mật khẩu xác nhận');
      return;
    }

    setIsDeleting(true);
    try {
      await authService.login({ email: user?.email, password: deletePassword, isVerifying: true });
      await accountService.requestDeleteAccount();
      showSuccess('Yêu cầu xóa tài khoản thành công! Tài khoản của bạn sẽ bị xóa sau 30 ngày.');
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.replace('/signin');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Mật khẩu xác nhận không chính xác');
    } finally {
      setIsDeleting(false);
    }
  };

  // Switch Account Submit
  const handleSwitchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchEmail || !switchPassword) {
      showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsSwitching(true);
    try {
      const res = await authService.login({ email: switchEmail, password: switchPassword });
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        document.cookie = `token=${res.token}; path=/; max-age=2592000; SameSite=Lax`;
        showSuccess('Chuyển đổi tài khoản thành công!');
        window.location.href = '/home';
      } else {
        showError('Không nhận được token xác thực');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin');
    } finally {
      setIsSwitching(false);
    }
  };

  // Settings Menu Structure
  const settingSections = [
    {
      title: t('interface_experience'),
      items: [
        {
          name: t('darkmode'),
          description: t('darkmode_menu_desc'),
          icon: Moon,
          color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
          section: 'darkmode'
        },
        {
          name: t('language'),
          description: t('language_menu_desc'),
          icon: Globe,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
          section: 'language'
        }
      ]
    },
    {
      title: 'Tài khoản & Bảo mật',
      items: [
        {
          name: 'Cài đặt tài khoản',
          description: 'Cập nhật thông tin cá nhân và mật khẩu',
          icon: User,
          color: 'text-blue bg-blue/5 dark:bg-blue-950/30',
          section: 'account'
        },
        {
          name: 'Quyền riêng tư',
          description: 'Quản lý bài viết, danh sách bạn bè và lượt thích',
          icon: Lock,
          color: 'text-green bg-green/5 dark:bg-green-950/30',
          section: 'privacy'
        },
        {
          name: 'Nhật ký hoạt động',
          description: 'Xem lại lịch sử tìm kiếm, tương tác của bạn',
          icon: Activity,
          color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
          section: 'activity'
        }
      ]
    },
    {
      title: 'Thông báo',
      items: [
        {
          name: 'Cài đặt thông báo',
          description: 'Tùy chỉnh các thông báo đẩy và âm thanh',
          icon: Bell,
          color: 'text-pink bg-pink/5 dark:bg-pink-950/30',
          section: 'notification'
        }
      ]
    },
    {
      title: 'Đăng nhập',
      items: [
        {
          name: 'Chuyển đổi tài khoản',
          description: 'Đăng nhập nhanh vào các tài khoản khác của bạn',
          icon: RefreshCw,
          color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/30',
          section: 'switch'
        }
      ]
    }
  ];

  // List of searchable setting options
  const searchableItems = [
    {
      name: t('darkmode'),
      description: t('darkmode_menu_desc'),
      keywords: 'tối sáng dark mode theme giao diện background màn hình',
      section: 'darkmode',
      icon: Moon,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30'
    },
    {
      name: t('language'),
      description: t('language_menu_desc'),
      keywords: 'ngôn ngữ tiếng việt tiếng anh language english vietnamese',
      section: 'language',
      icon: Globe,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      name: 'Cài đặt tài khoản',
      description: 'Cập nhật thông tin cá nhân, chỉnh sửa hồ sơ và đổi mật khẩu',
      keywords: 'tài khoản bảo mật thông tin mật khẩu email delete sđt điện thoại công việc địa chỉ',
      section: 'account',
      icon: User,
      color: 'text-blue bg-blue/5 dark:bg-blue-950/30'
    },
    {
      name: 'Thay đổi thông tin cá nhân',
      description: 'Cập nhật địa chỉ, số điện thoại, công việc, quốc tịch',
      keywords: 'thông tin tên ảnh đại diện địa chỉ sđt điện thoại công việc quốc tịch',
      section: 'change-info',
      icon: UserSquare2,
      color: 'text-blue bg-blue/5 dark:bg-blue-950/30'
    },
    {
      name: 'Thay đổi mật khẩu',
      description: 'Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn',
      keywords: 'mật khẩu pass password bảo mật',
      section: 'change-password',
      icon: KeyRound,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30'
    },
    {
      name: 'Xóa tài khoản',
      description: 'Yêu cầu xóa tài khoản vĩnh viễn khỏi mạng xã hội',
      keywords: 'xóa tài khoản delete remove acc account',
      section: 'delete-account',
      icon: UserX,
      color: 'text-red bg-red/5 dark:bg-red-950/30'
    },
    {
      name: 'Quyền riêng tư',
      description: 'Quản lý hiển thị email, số điện thoại, ngày sinh và loại tài khoản',
      keywords: 'riêng tư ẩn hiện bài viết bạn bè email điện thoại ngày sinh công việc',
      section: 'privacy',
      icon: Lock,
      color: 'text-green bg-green/5 dark:bg-green-950/30'
    },
    {
      name: 'Thời gian sử dụng / Hoạt động',
      description: 'Xem biểu đồ thời gian hoạt động trên mạng xã hội hàng ngày',
      keywords: 'hoạt động thời gian sử dụng sử dụng biểu đồ chart nhật ký',
      section: 'activity',
      icon: Activity,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30'
    },
    {
      name: 'Cài đặt thông báo',
      description: 'Tùy chỉnh thông báo đẩy, âm thanh báo, tin nhắn mới',
      keywords: 'thông báo thông báo đẩy sound chuông âm thanh tin nhắn',
      section: 'notification',
      icon: Bell,
      color: 'text-pink bg-pink/5 dark:bg-pink-950/30'
    },
    {
      name: 'Chuyển đổi tài khoản',
      description: 'Đăng nhập vào một tài khoản khác một cách nhanh chóng',
      keywords: 'chuyển đổi đăng nhập tài khoản khác switch login',
      section: 'switch',
      icon: RefreshCw,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/30'
    }
  ];

  // Filter items based on search query
  const filteredSearchItems = searchableItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-grey-hover transition-colors duration-300">
      <Navbar activeTab="setting" />

      {/* Main Container */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR: Settings Menu list */}
          <div className={`${activeSection !== null ? 'hidden md:block' : 'w-full'} w-full md:w-80 lg:w-96 flex-shrink-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300`}>
            
            {/* Title Header (Visible on Desktop or when on Menu list) */}
            <div className="flex items-center gap-3 px-1 select-none">
              <Settings className="w-6 h-6 text-blue" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">{t('settings_title')}</h1>
            </div>

            {/* User Profile Card */}
            <div 
              onClick={() => router.push('/profile')}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-grey/20 dark:border-zinc-800 shadow-sm flex items-center justify-between cursor-pointer hover:bg-grey/5 dark:hover:bg-zinc-800/50 hover:border-grey/30 active:scale-[0.99] transition duration-200 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow bg-white dark:bg-zinc-800 flex-shrink-0">
                  <img 
                    src={user?.avatar || '/assets/avatar/avatar.jpg'} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="font-bold text-base text-black dark:text-white truncate group-hover:text-blue transition-colors">
                    {user?.username || 'Người dùng'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-grey mt-1 font-semibold truncate">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{user?.email || 'Chưa cập nhật email'}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-grey/40 group-hover:text-grey-hover transition-transform duration-200 group-hover:translate-x-1" />
            </div>

            {/* Sections Menu */}
            <div className="space-y-5">
              {settingSections.map((section, idx) => (
                <div key={idx} className="space-y-2 text-left">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-grey px-1.5 select-none">
                    {section.title}
                  </h2>
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 overflow-hidden shadow-sm divide-y divide-grey/10 dark:divide-zinc-800">
                    {section.items.map((item, itemIdx) => {
                      const IconComponent = item.icon;
                      const isSelected = activeSection === item.section || 
                        (item.section === 'account' && ['change-info', 'change-password', 'delete-account'].includes(activeSection || ''));
                      
                      return (
                        <div 
                          key={itemIdx}
                          onClick={() => handleSelectSection(item.section)}
                          className={`flex items-center justify-between p-4 cursor-pointer transition text-left group border-l-4 ${
                            isSelected 
                              ? 'bg-blue/5 dark:bg-blue-950/20 border-blue text-blue' 
                              : 'bg-transparent border-transparent hover:bg-grey/5 dark:hover:bg-zinc-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 pr-2">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} transition duration-200 group-hover:scale-105`}>
                              <IconComponent className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 pr-1">
                              <h4 className={`font-bold text-sm truncate ${
                                isSelected ? 'text-blue' : 'text-black dark:text-white'
                              }`}>
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-grey font-medium mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                            isSelected ? 'text-blue' : 'text-grey/40'
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Log out section button */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 hover:bg-red/5 dark:hover:bg-red-950/10 active:scale-[0.99] border border-grey/20 dark:border-zinc-800 hover:border-red/20 rounded-2xl shadow-sm transition duration-200 group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-red/10 flex items-center justify-center text-red group-hover:bg-red/20 transition duration-200 flex-shrink-0">
                      <LogOut className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-red group-hover:text-red-hover transition-colors">
                        Đăng xuất
                      </h4>
                      <p className="text-[11px] text-grey font-medium mt-0.5">
                        Thoát tài khoản khỏi thiết bị
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT VIEW PANEL: Detail settings page content */}
          <div className={`${activeSection === null ? 'hidden md:block' : 'w-full'} flex-1 min-w-0 animate-in fade-in slide-in-from-right-4 duration-300`}>
            
            {/* CARD CONTAINER */}
            <div className="bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-3xl p-5 md:p-7 shadow-sm min-h-[480px]">
              
              {/* ---------------- 1. NO ACTIVE SECTION: DEFAULT OVERVIEW OR SEARCH RESULTS ---------------- */}
              {activeSection === null && (
                <div className="space-y-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">Chào mừng đến với Cài đặt</h2>
                    <p className="text-sm text-grey font-medium mt-1">Tìm kiếm hoặc chọn một mục ở danh sách bên trái để cấu hình hệ thống.</p>
                  </div>

                  {/* Search Bar for settings */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm cài đặt hoặc chức năng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-grey/5 dark:bg-zinc-800/50 border border-grey/20 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                    />
                  </div>

                  {/* Search results or Default Quick links */}
                  {searchQuery.trim() !== '' ? (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-grey px-1">
                        Kết quả tìm kiếm ({filteredSearchItems.length})
                      </h3>
                      {filteredSearchItems.length === 0 ? (
                        <div className="text-center py-12 bg-grey/5 dark:bg-zinc-800/10 rounded-2xl text-grey font-medium text-sm">
                          Không tìm thấy tính năng nào phù hợp với "{searchQuery}"
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {filteredSearchItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  handleSelectSection(item.section);
                                  setSearchQuery('');
                                }}
                                className="flex items-center justify-between p-4 rounded-xl border border-grey/20 dark:border-zinc-800 hover:bg-grey/5 dark:hover:bg-zinc-800/30 cursor-pointer transition duration-150 text-left group"
                              >
                                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base text-black dark:text-white group-hover:text-blue transition-colors">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-grey font-medium mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-grey/40 group-hover:text-grey-hover transition-transform duration-200 group-hover:translate-x-1" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default Quick Overview Cards */
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-grey px-1">
                        Các mục cài đặt chính
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {searchableItems.filter(item => !['change-info', 'change-password', 'delete-account'].includes(item.section)).map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={index}
                              onClick={() => handleSelectSection(item.section)}
                              className="p-5 rounded-2xl border border-grey/20 dark:border-zinc-800 hover:border-blue/50 dark:hover:border-blue/50 hover:bg-blue/5 dark:hover:bg-blue-950/10 cursor-pointer transition duration-200 text-left group flex flex-col justify-between h-36"
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm sm:text-base text-black dark:text-white group-hover:text-blue transition-colors mt-2">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-grey font-medium mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ---------------- 2. DARKMODE CONFIG ---------------- */}
              {activeSection === 'darkmode' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">{t('darkmode')}</h2>
                  </div>

                  {/* Body Content */}
                  <div className="bg-grey/5 dark:bg-zinc-800/20 rounded-2xl p-5 border border-grey/20 dark:border-zinc-800 flex items-center justify-between text-left">
                    <div className="flex items-start gap-4 min-w-0 pr-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-50 dark:bg-purple-950/30 text-purple-500">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-black dark:text-white">{t('darkmode')}</h3>
                        <p className="text-xs sm:text-sm text-grey font-medium mt-1 text-justify leading-relaxed">
                          {t('darkmode_desc')}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleDarkMode(!isDarkMode)}
                      className={`flex-shrink-0 w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${isDarkMode ? 'bg-blue' : 'bg-grey/30'}`}
                    >
                      <div 
                        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------- 3. LANGUAGE CONFIG ---------------- */}
              {activeSection === 'language' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">{t('language')}</h2>
                  </div>

                  <p className="text-sm font-semibold text-grey mb-4 px-1 text-left">
                    {t('language_tab_title')}
                  </p>

                  <div className="space-y-3">
                    {[
                      { flag: '🇻🇳', name: 'Tiếng Việt', subName: '(Vietnamese)', code: 'vi' },
                      { flag: '🇺🇸', name: 'English', subName: '(Tiếng Anh)', code: 'en' }
                    ].map((lang) => {
                      const isSelected = currentLang === lang.code;
                      return (
                        <div
                          key={lang.code}
                          onClick={() => handleSelectLanguage(lang.code)}
                          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-sm ${
                            isSelected 
                              ? 'border-blue bg-blue/5 dark:bg-blue-950/20 text-blue' 
                              : 'border-grey/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-grey/5 dark:hover:bg-zinc-800/30 text-black dark:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-grey/10 dark:bg-zinc-800 flex items-center justify-center text-2xl select-none">
                              {lang.flag}
                            </div>
                            <div className="text-left">
                              <h4 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-blue' : 'text-black dark:text-white'}`}>
                                {lang.name}
                              </h4>
                              <span className="text-xs text-grey font-medium mt-0.5 block">
                                {lang.subName}
                              </span>
                            </div>
                          </div>

                          <div 
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? 'border-blue bg-blue text-white scale-105' : 'border-grey/30 bg-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------- 4. ACCOUNT SETTINGS MENU ---------------- */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Tài khoản & Bảo mật</h2>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 overflow-hidden shadow-sm divide-y divide-grey/10 dark:divide-zinc-800">
                    {[
                      {
                        name: 'Thay đổi thông tin',
                        description: 'Cập nhật ảnh đại diện, tên hiển thị, địa chỉ, số điện thoại...',
                        icon: UserSquare2,
                        color: 'text-blue bg-blue/5 dark:bg-blue-950/20',
                        section: 'change-info'
                      },
                      {
                        name: 'Thay đổi mật khẩu',
                        description: 'Cập nhật mật khẩu mới để bảo vệ tài khoản',
                        icon: KeyRound,
                        color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
                        section: 'change-password'
                      },
                      {
                        name: 'Xóa tài khoản',
                        description: 'Yêu cầu xóa tài khoản vĩnh viễn khỏi mạng xã hội',
                        icon: UserX,
                        color: 'text-red bg-red/5 dark:bg-red-950/20',
                        section: 'delete-account'
                      }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleSelectSection(item.section)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-grey/5 dark:hover:bg-zinc-800/30 transition group text-left"
                        >
                          <div className="flex items-start gap-4 min-w-0 pr-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} transition duration-200 group-hover:scale-105`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-black dark:text-white group-hover:text-blue transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-grey font-medium mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-grey/40 group-hover:text-grey-hover transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------- 5. EDIT PROFILE INFO (change-info) ---------------- */}
              {activeSection === 'change-info' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Thay đổi thông tin</h2>
                  </div>

                  {loadingProfile ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-10 h-10 animate-spin text-blue" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Editable Fields Section */}
                      <div className="space-y-5 text-left bg-grey/5 dark:bg-zinc-800/20 p-5 rounded-2xl border border-grey/20 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-black dark:text-white border-b border-grey/10 dark:border-zinc-800 pb-2.5">
                          Thông tin có thể chỉnh sửa
                        </h3>

                        {/* Address */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Địa chỉ
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Nhập địa chỉ của bạn"
                              className="flex-1 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveField('address', address)}
                              disabled={isSaving['address']}
                              className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
                            >
                              {isSaving['address'] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-4 h-4" /> Lưu
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Số điện thoại
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Nhập số điện thoại"
                              className="flex-1 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveField('phone', phone)}
                              disabled={isSaving['phone']}
                              className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
                            >
                              {isSaving['phone'] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-4 h-4" /> Lưu
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Job */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> Công việc
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={job}
                              onChange={(e) => setJob(e.target.value)}
                              placeholder="Công việc hiện tại"
                              className="flex-1 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveField('job', job)}
                              disabled={isSaving['job']}
                              className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
                            >
                              {isSaving['job'] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-4 h-4" /> Lưu
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Nationality */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> Quốc tịch
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={nationality}
                              onChange={(e) => setNationality(e.target.value)}
                              placeholder="Quốc gia / Quốc tịch"
                              className="flex-1 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveField('nationality', nationality)}
                              disabled={isSaving['nationality']}
                              className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
                            >
                              {isSaving['nationality'] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-4 h-4" /> Lưu
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Relationship Status */}
                        <div className="space-y-3 border-t border-grey/10 dark:border-zinc-800 pt-4 mt-4">
                          <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> Mối quan hệ
                          </label>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <select
                                value={relStatus}
                                onChange={(e) => {
                                  setRelStatus(e.target.value);
                                  if (e.target.value === 'none' || e.target.value === 'single') {
                                    setRelPartner('');
                                  }
                                }}
                                className="bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white min-w-[200px]"
                              >
                                <option value="none">Không hiển thị / Không đặt</option>
                                <option value="single">Độc thân</option>
                                <option value="dating">Đang hẹn hò</option>
                                <option value="engaged">Đã đính hôn</option>
                                <option value="married">Đã kết hôn</option>
                                <option value="complicated">Mối quan hệ phức tạp</option>
                              </select>

                              {relStatus !== 'none' && relStatus !== 'single' && (
                                <select
                                  value={relPartner}
                                  onChange={(e) => setRelPartner(e.target.value)}
                                  className="flex-1 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                                >
                                  <option value="">Chọn đối tác (Không bắt buộc)</option>
                                  {friends.map((friend: any) => {
                                    const friendInfo = friend.friend || friend;
                                    return (
                                      <option key={friendInfo._id} value={friendInfo._id}>
                                        {friendInfo.username}
                                      </option>
                                    );
                                  })}
                                </select>
                              )}

                              <button
                                onClick={handleSaveRelationship}
                                disabled={isSavingRel}
                                className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
                              >
                                {isSavingRel ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" /> Lưu
                                  </>
                                )}
                              </button>
                            </div>

                            {profile?.relationship && profile.relationship.status !== 'none' && (
                              <div className="text-xs bg-pink-500/5 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 p-3 rounded-xl border border-pink-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 fill-current text-pink-500" />
                                  <span className="font-semibold">
                                    {profile.relationship.status === 'single' && 'Độc thân'}
                                    {profile.relationship.status === 'dating' && (profile.relationship.partner ? `Đang hẹn hò với ${profile.relationship.partner.username}` : 'Đang hẹn hò')}
                                    {profile.relationship.status === 'engaged' && (profile.relationship.partner ? `Đã đính hôn với ${profile.relationship.partner.username}` : 'Đã đính hôn')}
                                    {profile.relationship.status === 'married' && (profile.relationship.partner ? `Đã kết hôn với ${profile.relationship.partner.username}` : 'Đã kết hôn')}
                                    {profile.relationship.status === 'complicated' && (profile.relationship.partner ? `Mối quan hệ phức tạp với ${profile.relationship.partner.username}` : 'Mối quan hệ phức tạp')}
                                    {profile.relationship.isPending && ' (Chờ đối phương xác nhận)'}
                                  </span>
                                </div>
                                {profile.relationship.isPending && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await accountService.cancelRelationshipRequest();
                                        showSuccess('Đã hủy yêu cầu kết đôi.');
                                        const updated = await accountService.getProfile();
                                        setProfile(updated);
                                        setRelStatus(updated.relationship?.status || 'none');
                                        setRelPartner(updated.relationship?.partner?._id || updated.relationship?.partner || '');
                                      } catch (err: any) {
                                        showError(err.response?.data?.message || 'Có lỗi xảy ra');
                                      }
                                    }}
                                    className="text-[10px] bg-red hover:bg-red-hover text-white px-2.5 py-1 rounded-lg font-bold transition border-0 cursor-pointer"
                                  >
                                    Hủy yêu cầu
                                  </button>
                                )}
                              </div>
                            )}

                            {relationshipRequests.length > 0 && (
                              <div className="space-y-2 mt-2">
                                <span className="text-xs font-bold text-grey block uppercase tracking-wider">
                                  Lời mời kết đôi đang chờ:
                                </span>
                                {relationshipRequests.map((reqUser: any) => (
                                  <div key={reqUser._id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-grey/10 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={reqUser.avatar || '/default-avatar.png'}
                                        alt={reqUser.username}
                                        className="w-9 h-9 rounded-full object-cover border border-grey/10"
                                      />
                                      <div className="text-left">
                                        <h4 className="text-sm font-bold text-black dark:text-white">
                                          {reqUser.username}
                                        </h4>
                                        <span className="text-[11px] text-grey font-medium">
                                          {reqUser.relationship.status === 'dating' && 'Muốn kết đôi hẹn hò với bạn'}
                                          {reqUser.relationship.status === 'engaged' && 'Muốn kết đôi đính hôn với bạn'}
                                          {reqUser.relationship.status === 'married' && 'Muốn kết đôi kết hôn với bạn'}
                                          {reqUser.relationship.status === 'complicated' && 'Muốn kết đôi mối quan hệ phức tạp với bạn'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAcceptRelationshipRequest(reqUser._id)}
                                        className="bg-blue hover:bg-blue-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition border-0 cursor-pointer"
                                      >
                                        Đồng ý
                                      </button>
                                      <button
                                        onClick={() => handleRejectRelationshipRequest(reqUser._id)}
                                        className="bg-grey/10 hover:bg-grey/25 text-grey-hover text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition border-0 cursor-pointer"
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Read-Only System Info */}
                      <div className="space-y-4 text-left bg-grey/5 dark:bg-zinc-800/20 p-5 rounded-2xl border border-grey/20 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-black dark:text-white border-b border-grey/10 dark:border-zinc-800 pb-2.5">
                          Thông tin hệ thống cố định
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Tên người dùng', value: profile?.username || 'Chưa cập nhật', icon: User },
                            { label: 'Email', value: profile?.email || 'Chưa cập nhật', icon: Mail },
                            { label: 'Ngày sinh', value: profile?.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật', icon: Cake },
                            { label: 'Giới tính', value: profile?.gender === 'male' ? 'Nam' : profile?.gender === 'female' ? 'Nữ' : 'Khác', icon: Users2 }
                          ].map((field, idx) => {
                            const Icon = field.icon;
                            return (
                              <div key={idx} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-grey/10 dark:border-zinc-800 text-left">
                                <div className="w-9 h-9 rounded-full bg-grey/10 dark:bg-zinc-800 flex items-center justify-center text-grey flex-shrink-0">
                                  <Icon className="w-4 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-grey uppercase tracking-wider block">
                                    {field.label}
                                  </span>
                                  <span className="text-sm font-bold text-black dark:text-white truncate block mt-0.5">
                                    {field.value}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-grey italic pt-1">
                          * Các thông tin hệ thống cố định được thiết lập khi đăng ký tài khoản và không thể tự ý thay đổi.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- 6. CHANGE PASSWORD (change-password) ---------------- */}
              {activeSection === 'change-password' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Thay đổi mật khẩu</h2>
                  </div>

                  <div className="bg-grey/5 dark:bg-zinc-800/20 p-5 rounded-2xl border border-grey/20 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5 mb-6 border-b border-grey/10 dark:border-zinc-800 pb-4 text-left">
                      <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center">
                        <KeyRound className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-black dark:text-white">Thiết lập mật khẩu mới</h3>
                        <p className="text-xs text-grey font-medium mt-0.5">
                          Bảo vệ tài khoản {user?.email} bằng một mật khẩu mạnh mẽ
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5 text-left">
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
                            className="w-full bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
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
                            className="w-full bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
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
                        disabled={isSavingPassword}
                        className="w-full bg-blue hover:bg-blue-hover text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow active:scale-[0.99] transition duration-200 cursor-pointer border-0 mt-2"
                      >
                        {isSavingPassword ? (
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
                </div>
              )}

              {/* ---------------- 7. DELETE ACCOUNT (delete-account) ---------------- */}
              {activeSection === 'delete-account' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Xóa tài khoản</h2>
                  </div>

                  <div className="space-y-6 bg-grey/5 dark:bg-zinc-800/20 p-5 rounded-2xl border border-grey/20 dark:border-zinc-800">
                    {/* Warning Card */}
                    <div className="bg-red/5 border border-red/20 rounded-2xl p-5 flex gap-4 text-left">
                      <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center flex-shrink-0 text-red">
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red text-base">Cảnh báo quan trọng</h3>
                        <p className="text-xs sm:text-sm text-grey-hover font-medium mt-1 leading-relaxed text-justify">
                          Việc xóa tài khoản là vĩnh viễn và không thể đảo ngược sau 30 ngày. Khi xóa tài khoản, tất cả bài viết, bạn bè, tin nhắn và thông tin cá nhân của bạn sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleDeleteAccount} className="space-y-5 text-left">
                      {/* Password Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-grey uppercase tracking-wider">
                          Nhập mật khẩu để xác nhận
                        </label>
                        <div className="relative">
                          <input
                            type={showDeletePassword ? 'text' : 'password'}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Nhập mật khẩu tài khoản hiện tại"
                            className="w-full bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowDeletePassword(!showDeletePassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-grey-hover bg-transparent border-0 cursor-pointer"
                          >
                            {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSelectSection('account')}
                          className="flex-1 bg-grey/10 hover:bg-grey/20 text-grey-hover py-3 rounded-xl text-center text-sm sm:text-base font-bold transition cursor-pointer border-0 active:scale-95"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={isDeleting}
                          className="flex-1 bg-red hover:bg-red-hover text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow active:scale-[0.99] transition duration-200 cursor-pointer border-0"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-5 h-5" /> Xác nhận xóa tài khoản
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ---------------- 8. PRIVACY SETTINGS ---------------- */}
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Quyền riêng tư</h2>
                  </div>

                  {loadingPrivacy ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-10 h-10 animate-spin text-blue" />
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-grey px-1.5 mb-3 select-none">
                          Thông tin cá nhân công khai
                        </h3>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 overflow-hidden shadow-sm divide-y divide-grey/10 dark:divide-zinc-800">
                          {[
                            { key: 'email', title: 'Email', icon: Mail, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
                            { key: 'phone', title: 'Số điện thoại', icon: Phone, color: 'text-green bg-green/5 dark:bg-green-950/30' },
                            { key: 'address', title: 'Địa chỉ', icon: MapPin, color: 'text-red bg-red/5 dark:bg-red-950/30' },
                            { key: 'birthday', title: 'Ngày sinh', icon: Cake, color: 'text-pink bg-pink/5 dark:bg-pink-950/30' },
                            { key: 'gender', title: 'Giới tính', icon: Users2, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/30' },
                            { key: 'job', title: 'Công việc', icon: Briefcase, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
                            { key: 'nationality', title: 'Quốc tịch', icon: Globe, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
                            { key: 'relationship', title: 'Mối quan hệ', icon: Heart, color: 'text-pink bg-pink/5 dark:bg-pink-950/30' }
                          ].map((item) => {
                            const Icon = item.icon;
                            const value = (privacySettings as any)[item.key];
                            return (
                              <div key={item.key} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base text-black dark:text-white">
                                      {item.title}
                                    </h4>
                                    <p className="text-xs text-grey font-medium mt-0.5">
                                      {value ? 'Đang hiển thị công khai trên trang cá nhân' : 'Đang ẩn khỏi người khác'}
                                    </p>
                                  </div>
                                </div>

                                <button 
                                  onClick={() => handleTogglePrivacy(item.key, value)}
                                  className={`flex-shrink-0 w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${value ? 'bg-blue' : 'bg-grey/30'}`}
                                >
                                  <div 
                                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Account Privacy section */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-grey px-1.5 mb-3 select-none">
                          Loại tài khoản
                        </h3>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-4 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red/10 text-red">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-black dark:text-white">Tài khoản riêng tư</h4>
                              <p className="text-xs text-grey font-medium mt-0.5 max-w-[280px] sm:max-w-md">
                                Chỉ cho phép những người bạn phê duyệt xem ảnh, video và bài viết của bạn.
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleTogglePrivacy('isPrivate', privacySettings.isPrivate || false)}
                            className={`flex-shrink-0 w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${privacySettings.isPrivate ? 'bg-blue' : 'bg-grey/30'}`}
                          >
                            <div 
                              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${privacySettings.isPrivate ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- 9. TIME USAGE / ACTIVITY ---------------- */}
              {activeSection === 'activity' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSelectSection(getParentSection(activeSection))}
                        className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Thời gian sử dụng</h2>
                    </div>
                    <button 
                      onClick={fetchActivity}
                      disabled={loadingActivity}
                      className="w-9 h-9 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 flex items-center justify-center text-grey-hover active:scale-95 transition border-0 bg-transparent cursor-pointer"
                    >
                      <RefreshCw className={`w-4.5 h-4.5 ${loadingActivity ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {loadingActivity ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-10 h-10 animate-spin text-blue" />
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      {/* Today Card */}
                      <div className="bg-gradient-to-br from-blue to-blue-hover text-white rounded-3xl p-6 shadow-md border-0">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 opacity-90" />
                          <span className="text-sm font-bold opacity-90 uppercase tracking-wider">Hôm nay</span>
                        </div>
                        <h2 className="text-4xl font-extrabold mt-3 tracking-tight">
                          {(() => {
                            const today = new Date().getDay();
                            const idx = today === 0 ? 6 : today - 1;
                            const minutes = weekDayMinutes[idx] || 0;
                            const h = Math.floor(minutes / 60);
                            const m = minutes % 60;
                            if (h > 0 && m > 0) return `${h}h ${m}m`;
                            if (h > 0) return `${h}h`;
                            return `${m}m`;
                          })()}
                        </h2>
                        <p className="text-xs mt-2 font-medium opacity-80">
                          Thời gian hoạt động trên thiết bị này được ghi nhận hôm nay.
                        </p>
                      </div>

                      {/* This Week Section */}
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-grey/20 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-base text-black dark:text-white">Tuần này</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-grey font-medium">Tổng cộng:</span>
                              <span className="text-sm font-bold text-blue">
                                {(() => {
                                  const total = weekDayMinutes.reduce((a, b) => a + b, 0);
                                  const h = Math.floor(total / 60);
                                  const m = total % 60;
                                  if (h > 0 && m > 0) return `${h}h ${m}m`;
                                  if (h > 0) return `${h}h`;
                                  return `${m}m`;
                                })()}
                              </span>
                            </div>
                          </div>
                          <BarChart2 className="w-5 h-5 text-grey" />
                        </div>

                        {/* Chart Grid */}
                        <div className="flex justify-between items-end h-56 pt-4 px-2 border-b border-grey/10 dark:border-zinc-800">
                          {weekDayMinutes.map((mins, idx) => {
                            const today = new Date().getDay();
                            const todayIndex = today === 0 ? 6 : today - 1;
                            const maxMinutes = Math.max(...weekDayMinutes, 10);
                            const percent = (mins / maxMinutes) * 100;
                            const isToday = idx === todayIndex;
                            const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                            
                            return (
                              <div key={idx} className="flex flex-col items-center flex-1 group cursor-pointer">
                                <div className="relative w-7 sm:w-9 h-40 flex items-end justify-center rounded-t-lg overflow-hidden bg-grey/5 dark:bg-zinc-800/20">
                                  <div className="absolute bottom-full mb-1 bg-black/85 dark:bg-zinc-800 text-white text-[10px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow z-10">
                                    {(() => {
                                      const h = Math.floor(mins / 60);
                                      const m = mins % 60;
                                      if (h > 0 && m > 0) return `${h}h ${m}m`;
                                      if (h > 0) return `${h}h`;
                                      return `${m}m`;
                                    })()}
                                  </div>
                                  <div 
                                    style={{ height: `${percent}%` }}
                                    className={`w-full rounded-t-lg transition-all duration-500 ease-out origin-bottom ${
                                      isToday ? 'bg-blue' : 'bg-grey/30 group-hover:bg-grey/40 dark:bg-zinc-700 dark:group-hover:bg-zinc-600'
                                    }`}
                                  />
                                </div>
                                <span className={`text-xs font-bold mt-2.5 ${isToday ? 'text-blue' : 'text-grey'}`}>
                                  {weekDays[idx]}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-grey font-medium">
                          <span>T2: Thứ Hai</span>
                          <span>CN: Chủ Nhật</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- 10. NOTIFICATION SETTINGS ---------------- */}
              {activeSection === 'notification' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Cài đặt thông báo</h2>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 overflow-hidden shadow-sm divide-y divide-grey/10 dark:divide-zinc-800 text-left">
                    {[
                      { key: 'pushNotifications' as const, title: 'Thông báo đẩy', description: 'Nhận thông báo tức thì trên thiết bị này', icon: Bell, color: 'text-blue bg-blue/5 dark:bg-blue-950/20' },
                      { key: 'soundEnabled' as const, title: 'Âm thanh thông báo', description: 'Phát âm thanh khi có thông báo mới', icon: Volume2, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
                      { key: 'emailAlerts' as const, title: 'Thông báo qua Email', description: 'Nhận email tổng hợp hoạt động hàng ngày', icon: Mail, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                      { key: 'messageAlerts' as const, title: 'Tin nhắn mới', description: 'Thông báo khi có người nhắn tin cho bạn', icon: MessageSquare, color: 'text-green bg-green/5 dark:bg-green-950/20' },
                      { key: 'interactionAlerts' as const, title: 'Tương tác & Theo dõi', description: 'Thông báo khi có người thích, bình luận hoặc theo dõi', icon: Heart, color: 'text-pink bg-pink/5 dark:bg-pink-950/20' }
                    ].map((item) => {
                      const Icon = item.icon;
                      const value = notificationSettings[item.key];
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4">
                          <div className="flex items-start gap-4 min-w-0 pr-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-black dark:text-white">
                                {item.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-grey font-medium mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleToggleNotification(item.key)}
                            className={`flex-shrink-0 w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${value ? 'bg-blue' : 'bg-grey/30'}`}
                          >
                            <div 
                              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSection === 'switch' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
                    <button
                      onClick={() => handleSelectSection(getParentSection(activeSection))}
                      className="w-10 h-10 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800/60 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">Chuyển tài khoản</h2>
                  </div>

                  <div className="bg-grey/5 dark:bg-zinc-800/20 p-5 rounded-2xl border border-grey/20 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5 mb-6 border-b border-grey/10 dark:border-zinc-800 pb-4 text-left">
                      <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-500 flex items-center justify-center">
                        <Users2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-black dark:text-white">Đăng nhập tài khoản khác</h3>
                        <p className="text-xs text-grey font-medium mt-0.5">
                          Nhập thông tin tài khoản bạn muốn chuyển đổi sang
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSwitchAccount} className="space-y-5 text-left">

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-grey uppercase tracking-wider">
                          Email đăng nhập
                        </label>
                        <input
                          type="email"
                          value={switchEmail}
                          onChange={(e) => setSwitchEmail(e.target.value)}
                          placeholder="Nhập email của tài khoản khác"
                          className="w-full bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-grey uppercase tracking-wider">
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <input
                            type={showSwitchPassword ? 'text' : 'password'}
                            value={switchPassword}
                            onChange={(e) => setSwitchPassword(e.target.value)}
                            placeholder="Nhập mật khẩu của tài khoản đó"
                            className="w-full bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSwitchPassword(!showSwitchPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-grey-hover bg-transparent border-0 cursor-pointer"
                          >
                            {showSwitchPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSwitching}
                        className="w-full bg-blue hover:bg-blue-hover text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow active:scale-[0.99] transition duration-200 cursor-pointer border-0 mt-2"
                      >
                        {isSwitching ? (
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
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <style jsx global>{`
        @keyframes scaleUpDropdown {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-scale-up {
          animation: scaleUpDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
