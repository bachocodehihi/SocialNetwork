import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/providers/app_provider.dart';

class S {
  static String of(BuildContext context, String key) {
    try {
      final provider = Provider.of<AppProvider>(context, listen: false);
      final isEn = provider.locale.languageCode == 'en';
      return isEn ? (_en[key] ?? key) : (_vi[key] ?? key);
    } catch (_) {
      return _vi[key] ?? key;
    }
  }

  static const _en = {
    //welcome
    'hello': 'Hello!',
    'welcome_to_social_network_app': 'Welcome to Social Network App',
    'sign_in': 'Sign in',
    'create_new_account': 'Create new account',

    //sign up
    //email
    'sign_up_by_email': 'Sign up by email',
    'enter_your_email': 'Enter your email',
    'already_have_account': 'Already have an account? ',
    'sign_up_with_google': 'Sign up with Google',
    'or': 'Or',

    //name
    'enter_username': 'Enter username',
    'enter_your_username': 'Enter your username',
    'username': 'Username',

    //birthday
    'select_your_birthday': 'Select your birthday',

    //gender
    'select_your_gender': 'Select your gender',

    //avatar
    'select_avatar': 'Select avatar',
    'select_your_avatar': 'Select your avatar',

    //password
    'enter_your_password': 'Enter your password',

    //sign in
    //email
    'sign_in_by_email': 'Sign in by email',
    'don_t_have_an_account': 'Don\'t have an account? ',
    'sign_in_with_google': 'Sign in with Google',

    //password
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'forgot_password': 'Forgot password?',
    
    //verify
    //sign up
    'verify_email': 'Verify email',
    'verify_your_email': 'Verify your email',
    'otp_has_been_sent_to_your_email': 'OTP has been sent to your email.',
    'didn_t_receive_a_code? ': 'Didn\'t receive a code? ',
    'resend': 'Resend',

    //main
    'home': 'Home',
    'message': 'Message',
    'contact': 'Contact',
    'notification': 'Notification',
    'profile': 'Profile',

    //home
    'what_s_on_your_mind': 'What\'s on your mind?',
    'like': 'Like',
    'comment': 'Comment',
    'share': 'Share',

    //contact
    'requests': 'Requests',
    'friends': 'Friends',
    'groups': 'Groups',

    //message

    //notification

    //profile
    'add_profile': 'Add Profile',
    'personal_information': 'Personal Information',
    'birthday': 'Birthday',
    'gender': 'Gender',
    'job': 'Job',
    'address': 'Address',
    'phone': 'Phone',
    'nationality': 'Nationality',
    'all_posts': 'All posts',

    //create group
    'create_group': 'Create group',

    //setting
    'setting': 'Setting',
    'interface': 'Interface',
    'dark_mode': 'Dark mode',
    'language': 'Language',
    'font': 'Font',
    'account': 'Account',
    'privacy': 'Privacy',
    'activity': 'Activity',
    'switch_account': 'Switch account',
    'log_out': 'Log out',

    //dark mode
    'reduce_eye_strain_save_battery_and_improve_visibility': 'Reduce eye strain, save battery, and improve visibility.',
    
    //language
    'select_your_preferred_language': 'Select your preferred language',

    //drawer
    'game': 'Game',
    
    //commons
    'confirm': 'Confirm',
    'cancel': 'Cancel',
    'save': 'Save',
    'success': 'Success',
    'vietnamese': 'Vietnamese',
    'english': 'English',
    'continue': 'Continue',
    'no_internet': 'No internet connection',

    //search
    'search': 'Search',
  };

  static const _vi = {
    //welcome
    'hello': 'Xin chào!',
    'welcome_to_social_network_app': 'Chào mừng đến với ứng dụng Mạng Xã Hội',
    'sign_in': 'Đăng nhập',
    'create_new_account': 'Tạo tài khoản mới',



    //setting
    'setting': 'Cài đặt',
    'interface': 'Giao diện',
    'dark_mode': 'Chế độ tối',
    'language': 'Ngôn ngữ',
    'font': 'Cỡ chữ',
    'account': 'Tài khoản',
    'activity': 'Hoạt động',
    'notification': 'Thông báo',
    'switch_account': 'Chuyển tài khoản',
    'log_out': 'Đăng xuất',

    //dark mode
    'reduce_eye_strain_save_battery_and improve_visibility': 'Reduce eye strain, save battery, and improve visibility.',

    //language
    'select_your_preferred_language': 'Chọn ngôn ngữ ưu tiên của bạn',
    
    //main
    'home': 'Trang chủ',
    'message': 'Tin nhắn',
    'contact': 'Danh bạ',
    'profile': 'Cá nhân',

    //home
    'like': 'Thích',
    'comment': 'Comment',
    'share': 'Share',
    
    //contact
    'requests': 'Lời mời',
    'friends': 'Bạn bè',
    'groups': 'Nhóm',
    
    //drawer
    'game': 'Trò chơi',
    
    //commons
    'confirm': 'Xác nhận',
    'cancel': 'Hủy',
    'save': 'Lưu',
    'success': 'Thành công',
    'vietnamese': 'Tiếng Việt',
    'english': 'Tiếng Anh',
    'continue': 'Tiếp tục',
    'no_internet': 'Không có kết nối mạng',

    //home
    'birthday': 'Ngày sinh',
    'gender': 'Giới tính',
    'job': 'Công việc',
    'address': 'Địa chỉ',
    'phone': 'Số điện thoại',
    'nationality': 'Quốc tịch',

    //search
    'search': 'Tìm kiếm',

    //sign up
    //email
    'enter_your_email': 'Nhập email của bạn',
    'sign_up_by_email': 'Đăng ký bằng email',
    'already_have_account': 'Đã có tài khoản? ',
    'sign_up_with_google': 'Đăng ký với Google',
    'or': 'Hoặc',

    //name
    'enter_your_name': 'Nhập tên của bạn',

    //birthday
    'select_your_birthday': 'Chọn ngày sinh của bạn',

    //gender
    'select_your_gender': 'Chọn giới tính của bạn',

    //avatar
    'select_your_avatar': 'Chọn ảnh đại diện của bạn',

    //password
    'enter_your_password': 'Nhập mật khẩu của bạn',

  };
}
