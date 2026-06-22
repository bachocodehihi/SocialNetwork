import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/providers/app_provider.dart';

class Language {
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
    'wellcome_to_social_network_app': 'Wellcome to Social Network App',
    'sign_in': 'Sign in',
    'create_new_account': 'Create new account',

    //signup
      //email
      'sign_up_by_email': 'Sign up by email',
      'enter_your_email': 'Enter your email',
      'please_enter_email': 'Please enter email!',
      'invalid_email': 'Invalid email!',
      'server_error_please_try_again': 'Server error, please try again!',
      'continue': 'Continue',
      'already_have_an_account': 'Already have an account? ',
      'or': 'Or',
      'sign_up_with_google': 'Sign up with Google',
      //username
      'username': 'Username',
      'enter_your_username': 'Enter your username',
      //birthday
      'birthday': 'Birthday',
      'select_your_birthday': 'Select your birthday',
      //gender
      'gender': 'Gender',
      'select_your_gender': 'Select your gender',
      //avatar
      'avatar': 'Avatar',
      'select_your_avatar': 'Select your avatar',
      //password
      'enter_your_password': 'Enter your password',
      'password': 'Password',

    //verify
      //sign up
      'verify_your_email': 'Verify your email',
      'otp_has_been_sent_to': 'Otp has been sent to ',
      'didn_t_receive_a code': 'Didn\'t receive a code?',

    //sign in
      //email
      'sign_in_by_email': 'Sign in by email',
      'don_t_have_account': 'Don\'t have an account? ',
      'sign_up': 'Sign up',
      'sign_in_with_google': 'Sign in with Google',
      //password
      'forgot_password': 'Forgot password',

    //main
    'home': 'Home',
    'message': 'Message',
    'contact': 'Contact',
    'notification' :'Notification',
    'profile': 'Profile',
      //home
      'what_s_on_your_mind': 'What\'s on your mind?',
      'comment': 'Comment',
      //message
      //contact
      'requests' : 'Requests',
      'friends': 'Friends',
      'groups': 'Groups',
      //notification
      //profile
      'followers': 'Followers',
      'following': 'Following',
      'posts': 'Posts',
      'add_profile': 'Add profile',
      'personal_information': 'personal_information',
      'all_posts': 'All posts',

    //setting
    'setting': 'Setting',
    'interface': 'Interface',
    'dark_mode': 'Dark Mode',
    'language': 'Language',
    'font': 'Font',
    'account': 'Account',
    'activity': 'Activity',
    'privacy': 'Privacy',
    'like_history': 'Like history',
    'comment_history': 'Comment history',
    'switch_account': 'Switch account',
    'log_out': 'Log out',
      //dark mode
      'reduce_eye_strain_save_battery_and_improve_visibility': 'Reduce eye strain, save battery, and improve visibility.',
      //account
        //change
        'change_information': 'Change information',
          //address
          //avatar
          //birthday
          //email
          //gender
          //job
          //nationality
          //phone
          //username

    
    //banner
      //network
      'no_network_connection': 'No network connection!',
      //delete
      'account_will_be deleted_in': 'Account will be deleted in:',
  };

  static const _vi = {
    //welcome
    'hello': 'Xin chào!',
    'wellcome_to_social_network_app': 'Chào mừng đến với ứng dụng Mạng xã hội',
    'sign_in': 'Đăng nhập',
    'create_new_account': 'Tạo tài khoản mới',

    //signup
      //email
      'sign_up_by_email': 'Đăng ký bằng email',
      'enter_your_email': 'Nhập email của bạn',
      'please_enter_email': 'Vui lòng nhập email!',
      'invalid_email': 'Email không hợp lệ!',
      'server_error_please_try_again': 'Lỗi máy chủ, vui lòng thử lại!',
      'i_agree_to': 'Tôi đồng ý với ',
      'terms_of_service': 'điều khoản sử dụng',
      'social_terms_of_service': 'điều khoản Mạng xã hội',
      'continue': 'Tiếp tục',
      'already_have_an_account': 'Bạn đã có tài khoản? ',
      'or': 'Hoặc',
      'sign_up_with_google': 'Đăng ký với Google',
      //username
      'username': 'Tên tài khoản',
      'enter_your_username': 'Nhập tên tài khoản của bạn',
      //birthday
      'birthday': 'Ngày sinh',
      'select_your_birthday': 'Chọn ngày sinh của bạn',
      //gender
      'gender': 'Giới tính',
      'select_your_gender': 'Chọn giới tính của bạn',
      //avatar
      'avatar': 'Ảnh đại diện',
      'select_your_avatar': 'Chọn ảnh đại diện của bạn',
      //password
      'enter_your_password': 'Nhập mật khẩu của bạn',
      'password': 'Mật khẩu',

    //verify
      //sign up
      'verify_your_email': 'Xác thực email của bạn',
      'otp_has_been_sent_to': 'Mã Otp đã được gửi đến ',
      'didn_t_receive_a_code': 'Không nhận được mã? ',
      'resend': 'Gửi lại',

    //sign in
      //email
      'sign_in_by_email': 'Đăng nhập bằng email',
      'don_t_have_account': 'Bạn chưa có tài khoản? ',
      'sign_up': 'Đăng ký',
      'sign_in_with_google': 'Đăng nhập với Google',
      //password
      'forgot_password': 'Quên mật khẩu',

    //main
    'home': 'Trang chủ',
    'message': 'Nhắn tin',
    'contact': 'Danh bạ',
    'notification' :'Thông báo',
    'profile': 'Cá nhân',
      //home
      'what_s_on_your_mind': 'Bạn đang nghĩ gì?',
      'comment': 'Bình luận',
      //message
      'search_message': 'Tìm kiếm tin nhắn...',
      //contact
      'requests' : 'Lời mời ',
      'friends': 'Bạn bè',
      'groups': 'Nhóm',
      //notification
      //profile
      'followers': 'Người theo dõi',
      'following': 'Đang theo dõi',
      'posts': 'Bài đăng',
      'add_profile': 'Thêm thông tin',
      'personal_information': 'Thông tin cá nhân',
      'all_posts': 'Tất cả bài đăng',
    
    //add
    'address': 'Địa chỉ',
    'job': 'Công việc',
    'nationality': 'Quốc tịch',
    'phone': 'Số điện thoại',
      //address
      'add_address': 'Thêm địa chỉ',
      'enter_your_address': 'Thêm địa chỉ của bạn',
      'add': 'Thêm',
      //job
      'add_job': 'Thêm công việc',
      'enter_your_job': 'Thêm công việc của bạn',
      //nationality
      'add_nationality': 'Thêm quốc tịch',
      'enter_your_nationality': 'Thêm quốc tịch của bạn',
      //phone
      'add_phone': 'Thêm số điện thoại',
      'enter_your_phone': 'Thêm số điện thoại của bạn',

    //setting
    'setting': 'Cài đặt',
    'interface': 'Giao diện',
    'dark_mode': 'Chế độ tối',
    'language': 'Ngôn ngữ',
    'font': 'Phông chữ',
    'account': 'Tài khoản',
    'activity': 'Hoạt động',
    'privacy': 'Quyền riêng tư ',
    'like_history': 'Lịch sử thích',
    'comment_history': 'Lịch sử bình luận',
    'switch_account': 'Đổi tài khoản',
    'log_out': 'Đăng xuất',
      //dark mode
      'reduce_eye_strain_save_battery_and_improve_visibility': 'Giảm mỏi mắt, tiết kiệm pin và cải thiện khả năng nhìn.',
      //language

      //privacy

      //activity

      //history
        //like

        //comment

      //account
      'delete_account': 'Xóa tài khoản',
        //change
        'change_information': 'Đổi thông tin',
          //address
          'change_address': 'Đổi địa chỉ',
          //avatar
          'change_avatar': 'Đổi ảnh đại diện',
          //birthday
          'change_birthday': 'Đổi ngày sinh',
          //email
          'change_email': 'Đổi email',
          //gender
          'change_gender': 'Đổi giới tính',
          //job
          'change_job': 'Đổi công việc',
          //nationality
          'change_nationality': 'Đổi quốc tịch',
          //phone
          'change_phone': 'Đổi số điện thoại',
          //username
          'change_username': 'Đổi tên tài khoản',
        //delete
          //account
          'enter_your_reason': 'Nhập lý do của bạn',
          'reason': 'Lý do',
          'are_you_sure_you_want_to_schedule_the_deletion_of_this_account_The_account_will_be_permanently_deleted_in_24_hours': 'Bạn có chắc chắn muốn lên lịch xóa tài khoản này không? Tài khoản sẽ được lên lịch xóa vĩnh viễn sau 24 giờ.',
      //switch
        //account
        'add_account': 'Thêm tài khoản',

    //banner
      //network
      'no_network_connection': 'Không có kết nối mạng!',
      //delete
      'account_will_be deleted_in': 'Tài khoản sẽ xóa trong vòng:',
  };
} 
