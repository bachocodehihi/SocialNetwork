import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/verify/signup/signup_controller.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/repositories/auth_repository_imp.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/network/api/auth_api.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/app/pages/signup/state/signup.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class VerifySignUpView extends StatefulWidget {
  const VerifySignUpView({super.key});
  @override
  State<VerifySignUpView> createState() => _VerifySignUpViewState();
}
enum _CodeStatus { normal, error, success }

class _VerifySignUpViewState extends State<VerifySignUpView> {

  late VerifySignUpController controller;

  int _resendCooldown = 60;
  Timer? _timer; 
  String email = '';
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    if (args != null && args['email'] != null) {
      email = args['email'];
    }
  }

  static const int _otpLength = 6;
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  _CodeStatus _codeStatus = _CodeStatus.normal;

  @override
  void initState() {
    super.initState();

    controller = VerifySignUpController(
      AuthUsecase(
        AuthRepositoryImp(
          AuthApi(DioClient.createDio()),
        ),
      ),
    );

    controller.addListener(() {
      setState(() {});
    });

    _startTimer();
  }

  void _startTimer() { 
    _timer?.cancel();
    setState(() => _resendCooldown = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_resendCooldown > 0) {
          _resendCooldown--;
        } else {
          timer.cancel();
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    _focusNode.dispose();
    controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    setState(() => _codeStatus = _CodeStatus.normal);
  }

  Future<void> _onVerify() async {
    final otp = _controller.text;
    
    final success = await controller.verifyOtp(email, otp);

    if (!mounted) return;
    if (success) {

      _focusNode.unfocus();

      setState(() => _codeStatus = _CodeStatus.success);
      
      context.read<SignUpProvider>().setEmail(email);
      await Future.delayed(const Duration(milliseconds: 500));
      

      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routes.signupName,
          (route) => route.settings.name == Routes.signupEmail,
        );
      }
    } else {
      setState(() => _codeStatus = _CodeStatus.error);
    }
  }

  Widget _buildBox(int index, ColorScheme cs) {
    final text = _controller.text;
    final hasText = index < text.length;
    final isActive = text.length == index;

    Color borderColor;
    Color bgColor;

    switch (_codeStatus) {
      case _CodeStatus.error:
        borderColor = Colors.red;
        bgColor = Colors.red.withValues(alpha: 0.08);
        break;
      case _CodeStatus.success:
        borderColor = Colors.green;
        bgColor = Colors.green.withValues(alpha: 0.08);
        break;
      default:
        if (hasText) {
          borderColor =Colors.blue;
          bgColor = Colors.blue.withValues(alpha: 0.12);
        } else if (isActive) {
          borderColor = Colors.blue;
          bgColor = Colors.blue.withValues(alpha: 0.08);
        } else {
          borderColor = cs.outlineVariant;
          bgColor = cs.surfaceContainerHighest.withValues(alpha: 0.4);
        }
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      width: 50.w,
      height: 60.h,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: borderColor,
          width: isActive ? 2 : 1.5,
        ),
      ),
      child: Text(
        hasText ? text[index] : '',
        style: TextStyle(
          fontSize: 20.sp,
          fontWeight: FontWeight.w500,
          color: cs.onSurface,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness:
            brightness == Brightness.dark ? Brightness.light : Brightness.dark,
      ),
    );
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: cs.surface,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: kIsWeb ? 0 : 24.w,
                vertical: 16.h,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Icon(
                          Icons.arrow_back_ios_outlined,
                          size: 20.sp,
                          color: cs.onSurface,
                        ),
                      ),
                      // SizedBox(width: 10.w),
                      // Text(
                      //   Language.of(context, 'verify_email'),
                      //   style: TextStyle(
                      //     fontSize: 20.sp,
                      //     fontWeight: FontWeight.w500,
                      //     color: cs.onSurface,
                      //   ),
                      // ),
                    ],
                  ),
                  SizedBox(height: 20.h),
                  Text(
                    Language.of(context, 'verify_your_email'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(height: 10.h),

                  Text(
                    Language.of(context, 'otp_has_been_sent_to'),
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface
                    ),
                  ),

                  SizedBox(height: 10.h),

                  Text(
                    email,
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: Colors.blue
                    ),
                  ),

                  SizedBox(height: 40.h),

                  GestureDetector(
                    onTap: () {
                      FocusScope.of(context).unfocus();
                      Future.delayed(const Duration(milliseconds: 50), () {
                        _focusNode.requestFocus();
                      });
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(
                        _otpLength,
                        (index) => _buildBox(index, cs),
                      ),
                    ),
                  ),
                  
                  SizedBox(
                    height: 0,
                    width: 0,
                    child: TextField(
                      controller: _controller,
                      focusNode: _focusNode,
                      keyboardType: TextInputType.number,
                      maxLength: _otpLength,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      enableInteractiveSelection: false,
                      showCursor: false,
                      decoration: const InputDecoration(
                        counterText: '',
                        border: InputBorder.none,
                      ),
                      onChanged: _onChanged,
                    ),
                  ),

                  SizedBox(height: 20.h),

                  SizedBox(
                    height: 50.h,
                    child: Visibility(
                      visible: controller.errorMessage.isNotEmpty,
                      maintainSize: true,
                      maintainAnimation: true,
                      maintainState: true,
                      child: BannerError(message: controller.errorMessage),
                    ),
                  ),

                  SizedBox(height: 20.h),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.black,
                      minimumSize: Size(double.infinity, 48.h),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30.r),
                      ),
                    ).copyWith(
                      overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                    ),
                    onPressed: controller.isLoading
                      ? null
                      : _onVerify,
                    child: controller.isLoading
                      ? const CircularProgressIndicator(
                        color: Colors.white
                      ) : Text(
                          Language.of(context, 'continue'),
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15.sp,
                          ),
                        ),
                  ),

                  SizedBox(height: 20.h),

                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          Language.of(context, 'didn_t_receive_a_code'),
                          style: TextStyle(
                            fontSize: 15.sp,
                            color: cs.onSurface,
                          ),
                        ),
                        if (_resendCooldown > 0)
                          Text(
                            '(${_resendCooldown}s)',
                            style: TextStyle(
                              fontSize: 15.sp,
                              color: Colors.blue,
                              fontWeight: FontWeight.w500,
                            ),
                          )
                        else
                          GestureDetector(
                            onTap: controller.isResending ? null : () async {
                              final success = await controller.resendOtp(email);
                              if (success) {
                                _controller.clear();
                                setState(() => _codeStatus = _CodeStatus.normal);
                                _startTimer();
                              }
                            },
                            child: controller.isResending
                              ? SizedBox(
                                  width: 16.w,
                                  height: 16.h,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.blue,
                                  ),
                                )
                              : Text(
                                  Language.of(context, 'resend'),
                                  style: TextStyle(
                                    fontSize: 15.sp,
                                    color: Colors.blue,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
