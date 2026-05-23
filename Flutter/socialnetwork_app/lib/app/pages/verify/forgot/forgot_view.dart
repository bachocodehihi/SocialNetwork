import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/verify/forgot/forgot_controller.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/domain/usecases/auth_usecase.dart';
import 'package:socialnetwork/data/repositories/auth_repository_imp.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/network/api/auth_api.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
class VerifyForgotView extends StatefulWidget {
  const VerifyForgotView({super.key});
  @override
  State<VerifyForgotView> createState() => _VerifyForgotViewState();
}
enum _CodeStatus { normal, error, success }

class _VerifyForgotViewState extends State<VerifyForgotView> {

  late VerifyForgetController controller;

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

    controller = VerifyForgetController(
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
      
      await Future.delayed(const Duration(milliseconds: 500));
      

      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          Routes.forgotPassword,
          arguments: {'email': email},
          (route) => route.settings.name == Routes.forgot,
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
      height: 65.h,
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
          color: Colors.black,
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
    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: kIsWeb ? 0 : 24.w,
              vertical: 16.h,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Icon(
                        Icons.arrow_back_ios_outlined,
                        size: 25,
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                    SizedBox(width: 10.w),
                    Text(
                      'Verify',
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
                Text(
                  'Verify your email',
                  style: TextStyle(
                    fontSize: 20.sp,
                    fontWeight: FontWeight.w500,
                    color: cs.onSurface,
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  'OTP has been sent to your email.',
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurfaceVariant,
                    height: 1.5,
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

                MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: ElevatedButton(
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
                          'Continue',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15.sp,
                          ),
                        ),
                  ),
                ),

                SizedBox(height: 20.h),

                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Didn\'t receive a code? ',
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
                          onTap: () {
                            _controller.clear();
                            setState(() => _codeStatus = _CodeStatus.normal);
                            _startTimer();
                          },
                          child: Text(
                            'Resend',
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
    );
  }
}