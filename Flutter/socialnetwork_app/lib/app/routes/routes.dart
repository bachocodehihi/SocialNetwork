import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/setting/notification/notification_page.dart';

//splash
import 'package:socialnetwork/app/pages/splash/splash_page.dart';

//wellcome
import 'package:socialnetwork/app/pages/wellcome/wellcome_page.dart';

//sign in
import 'package:socialnetwork/app/pages/signin/email/email_page.dart';
import 'package:socialnetwork/app/pages/signin/password/password_page.dart';

//forgot
import 'package:socialnetwork/app/pages/forgot/forgot_page.dart';
import 'package:socialnetwork/app/pages/forgot/password/password_page.dart';

//sign up
import 'package:socialnetwork/app/pages/signup/email/email_page.dart';
import 'package:socialnetwork/app/pages/signup/username/username_page.dart';
import 'package:socialnetwork/app/pages/signup/avatar/avatar_page.dart';
import 'package:socialnetwork/app/pages/signup/birthday/birthday_page.dart';
import 'package:socialnetwork/app/pages/signup/gender/gender_page.dart';
import 'package:socialnetwork/app/pages/signup/password/password_page.dart';

//term
import 'package:socialnetwork/app/pages/term/name/name_page.dart';
import 'package:socialnetwork/app/pages/term/social/social_page.dart';
import 'package:socialnetwork/app/pages/term/term/term_page.dart';

//verify
import 'package:socialnetwork/app/pages/verify/signup/signup_page.dart';
import 'package:socialnetwork/app/pages/verify/forgot/forgot_page.dart';
import 'package:socialnetwork/app/pages/verify/password/password_page.dart';

//add
import 'package:socialnetwork/app/pages/add/add_page.dart';
import 'package:socialnetwork/app/pages/add/address/address_page.dart';
import 'package:socialnetwork/app/pages/add/job/job_page.dart';
import 'package:socialnetwork/app/pages/add/phone/phone_page.dart';
import 'package:socialnetwork/app/pages/add/nationality/nationality_page.dart';

//setting
import 'package:socialnetwork/app/pages/setting/setting_page.dart';
import 'package:socialnetwork/app/pages/setting/account/account_page.dart';
import 'package:socialnetwork/app/pages/setting/activity/activity_page.dart';
import 'package:socialnetwork/app/pages/setting/darkmode/darkmode_page.dart';
import 'package:socialnetwork/app/pages/setting/font/font_page.dart';
import 'package:socialnetwork/app/pages/setting/language/language_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/change_page.dart';
import 'package:socialnetwork/app/pages/setting/privacy/privacy_page.dart';

//switch
import 'package:socialnetwork/app/pages/setting/switch/account/account_page.dart';

//change
import 'package:socialnetwork/app/pages/setting/account/change/address/address_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/avatar/avatar_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/job/job_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/phone/phone_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/email/email_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/username/username_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/birthday/birthday_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/gender/gender_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/nationality/nationality_page.dart';
import 'package:socialnetwork/app/pages/setting/account/change/password/password_page.dart';

//post
import 'package:socialnetwork/app/pages/post/content/user/user_page.dart';

//qrcode
import 'package:socialnetwork/app/pages/qrcode/qrcode_page.dart';

//create
import 'package:socialnetwork/app/pages/create/group/group_page.dart';

//main
import 'package:socialnetwork/app/pages/main/user/user_page.dart';
import 'package:socialnetwork/app/pages/main/admin/admin_page.dart';
import 'package:socialnetwork/data/local/auth_local.dart';

//search
import 'package:socialnetwork/app/pages/search/account/account_page.dart';

//scanner
import 'package:socialnetwork/app/pages/scanner/scanner_page.dart';

//game
import 'package:socialnetwork/app/pages/game/game_page.dart';
import 'package:socialnetwork/app/pages/game/tictactoe/tictactoe_page.dart';

//play
import 'package:socialnetwork/app/pages/game/tictactoe/play/user/user_page.dart';

//delete
import 'package:socialnetwork/app/pages/setting/account/delete/delete_page.dart';
import 'package:socialnetwork/app/pages/setting/account/delete/account/account_page.dart';
import 'package:socialnetwork/app/pages/warming/warming_page.dart';

//call
import 'package:socialnetwork/app/pages/main/user/tabs/message/call/user/incoming/incoming_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/call/user/outgoing/outgoing_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/call/user/in/in_page.dart';

//list
import 'package:socialnetwork/app/pages/list/friends/friends_page.dart';
import 'package:socialnetwork/app/pages/list/followers/followers_page.dart';
import 'package:socialnetwork/app/pages/list/following/following_page.dart';
import 'package:socialnetwork/app/pages/list/like/like_page.dart';
import 'package:socialnetwork/app/pages/list/comment/comment_page.dart';

class Routes {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  //splash
  static String splash = '/';

  //wellcome
  static String wellcome = '/wellcome';

  //sign in
  static String signinEmail = '/signin/email';
  static String signinPassword = '/signin/password';

  //forgot
  static String forgot = '/forgot';
  static String forgotPassword = '/forgot/password';

  //sign up
  static String signupEmail = '/signup/email';
  static String signupName = '/signup/name';
  static String signupBirthday = '/signup/birthday';
  static String signupGender = '/signup/gender';
  static String signupAvatar = '/signup/avatar';
  static String signupPassword = '/signup/password';

  //term
  static String termName = '/term/name';
  static String termSocial = '/term/social';
  static String termTerm = '/term/term';

  //verify
  static String verifySignUp = '/verify/signup';
  static String verifyForgot = '/verify/forgot';
  static String verifyPassword = '/verify/password';
  
  //add
  static String add = '/add';
  static String addJob = '/add/job';
  static String addPhone = '/add/phone';
  static String addAddress = '/add/address';
  static String addNationality = '/add/nationality';

  //setting
  static String setting = '/setting';
  static String account = '/setting/account';
  static String activity = '/setting/activity';
  static String change = '/setting/change';
  static String darkmode = '/setting/darkmode';
  static String language = '/setting/language';
  static String font = '/setting/font';
  static String notification = '/setting/notification';
  static String privacy = '/setting/privacy';

  //switch
  static String switchAccount = 'setting/switch/account';

  //change
  static String changeEmail = '/change/email';
  static String changeName = '/change/name';
  static String changeBirthday = '/change/birthday';
  static String changeGender = '/change/gender';
  static String changeAvatar = '/change/avatar';
  static String changeJob = '/change/job';
  static String changePhone = '/change/phone';
  static String changeAddress = '/change/address';
  static String changePassword = '/change/password';
  static String changeNationality = '/change/nationality';

  //list
  static String follower = '/list/follower';
  static String following = '/list/following';
  static String friend = '/list/friend';
  static String like = '/list/like';
  static String comment = '/list/comment';

  //post
  static String postContent = '/post/content';
  static String postStory = '/post/story';

  //code
  static String code = '/code';

  //create
  static String createGroup = '/create/group';

  //main
  static String mainUser = '/main/user';
  static String mainAdmin = '/main/admin';

  static Future<String> getDashboardRoute() async {
    final user = await AuthLocal.getCurrentUser();
    final role = user?['role']?.toString();
    if (role == 'admin') {
      return Routes.mainAdmin;
    }
    return Routes.mainUser;
  }

  //search
  static String search = '/search';

  //scanner
  static String scanner = '/scanner';

  //game
  static String game = '/game';
  static String gameTictactoe = '/game/tictactoe';

  //play
  static String playUserTictactoe = '/play/user/tictactoe';

  //delete
  static String delete = '/delete';
  static String deleteAccount = '/delete/account';
  static String warming = '/warming';

  //call
  static String callIncoming = '/message/call/incoming';
  static String callOutgoing = '/message/call/outgoing';
  static String callIn = '/message/call/in';

  static final routes = {
    //splash
    splash: (_) => SplashPage(),

    //wellcome
    wellcome: (_) => WellcomePage(),

    //sign in
    signinEmail: (_) => SignInEmailPage(),
    signinPassword: (_) => SignInPasswordPage(),

    //forgot
    forgot: (_) => ForgotPage(),
    forgotPassword: (_) => ForgotPasswordPage(),

    //sign up
    signupEmail: (_) => SignUpEmailPage(),
    signupName: (_) => SignUpUserNamePage(),
    signupBirthday: (_) => SignUpBirthdayPage(),
    signupGender: (_) => SignUpGenderPage(),
    signupAvatar: (_) => SignUpAvatarPage(),
    signupPassword: (_) => SignUpPasswordPage(),

    //term
    termName: (_) => TermNamePage(),
    termSocial: (_) => TermSocialPage(),
    termTerm: (_) => TermTermPage(),

    //verify
    verifySignUp: (_) => VerifySignUpPage(),
    verifyForgot: (_) => VerifyForgotPage(),
    verifyPassword: (_) => VerifyPasswordPage(),

    //add
    add: (_) => AddPage(),
    addJob: (_) => AddJobPage(),
    addPhone: (_) => AddPhonePage(),
    addAddress: (_) => AddAddressPage(),
    addNationality: (_) => AddNationalityPage(),

    //setting
    setting: (_) => SettingPage(),
    account: (_) => SettingAccountPage(),
    activity: (_) => SettingActivityPage(),
    change: (_) => SettingChangePage(),
    darkmode: (_) => SettingDarkmodePage(),
    language: (_) => SettingLanguagePage(),
    font: (_) => SettingFontPage(),
    notification: (_) => SettingNotificationPage(),
    privacy: (_) => SettingPrivacyPage(),

    //switch
    switchAccount: (_) => SwitchAccountPage(),

    //change
    changeEmail: (_) => ChangeEmailPage(),
    changeName: (_) => ChangeNamePage(),
    changeBirthday: (_) => ChangeBirthdayPage(),
    changeGender: (_) => ChangeGenderPage(),
    changeAvatar: (_) => ChangeAvatarPage(),
    changeJob: (_) => ChangeJobPage(),
    changePhone: (_) => ChangePhonePage(),
    changeAddress: (_) => ChangeAddressPage(),
    changePassword: (_) => ChangePasswordPage(),
    changeNationality: (_) => ChangeNationalityPage(),

    //list
    follower: (_) => ListFollowersPage(),
    following: (_) => ListFollowingPage(),
    friend: (_) => ListFriendPage(),
    like: (_) => ListLikePage(),
    comment: (_) => ListCommentPage(),

    //post
    postContent: (_) => PostContentPage(),
    postStory: (_) => SignUpEmailPage(),

    //code
    code: (_) => QRCodePage(),

    //create
    createGroup: (_) => CreateGroupPage(),

    //main
    mainUser: (_) => MainUserPage(),
    mainAdmin: (_) => const MainAdminPage(),

    //search
    search: (_) => SearchAccountPage(),

    //scanner
    scanner: (_) => ScannerPage(),

    //game
    game: (_) => GamePage(),
    gameTictactoe: (_) => GameTictactoePage(),

    //tictactoe
    playUserTictactoe: (_) => PlayUserTictactoePage(),

    //delete
    delete: (_) => DeletePage(),
    deleteAccount: (_) => DeleteAccountPage(),
    warming: (_) => const WarmingPage(),

    //call
    callIncoming: (_) => const CallIncomingPage(),
    callOutgoing: (_) => const CallOutGoingPage(),
    callIn: (_) => const CallInPage(),

  };
}