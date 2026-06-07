import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class CallOutGoingView extends StatefulWidget {
  const CallOutGoingView({super.key});

  @override
  State<CallOutGoingView> createState() => _CallOutGoingViewState();
}

class _CallOutGoingViewState extends State<CallOutGoingView> with SingleTickerProviderStateMixin {
  late final CallService _callService;
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _callService = CallService();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    if (_callService.currentCall == null || _callService.callState == CallState.idle) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.of(context).pop();
      });
      return;
    }

    _callService.addListener(_onCallStateChanged);
  }

  void _onCallStateChanged() {
    if (!mounted) return;
    final state = _callService.callState;
    if (state == CallState.connected || state == CallState.calling) {
      Navigator.pushReplacementNamed(context, Routes.callIn);
    } else if (state == CallState.idle) {
      Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _callService.removeListener(_onCallStateChanged);
    _pulseController.dispose();
    super.dispose();
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
    final callInfo = _callService.currentCall;

    if (callInfo == null) {
      return Scaffold(
        backgroundColor: cs.surface,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final remoteUser = callInfo.remoteUser;
    final name = remoteUser['username'] ?? remoteUser['name'] ?? 'Social Network User';
    final avatar = remoteUser['avatar'] ?? '';

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: kIsWeb ? 0 : 24.w,
            vertical: 16.h,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () {
                      _callService.cancelCall();
                    },
                    child: Icon(
                      Icons.arrow_back_ios_outlined,
                      size: 20.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Text(
                    'Cuộc gọi đi',
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                      fontFamily: 'Outfit',
                    ),
                  ),
                ],
              ),

              SizedBox(height: 20.h),

              SizedBox(
                width: 240.r,
                height: 240.r,
                child: AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        ...List.generate(3, (index) {
                          final value = (_pulseController.value + index / 3) % 1.0;
                          return Container(
                            width: (130 + value * 110).r,
                            height: (130 + value * 110).r,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.blue.withValues(alpha: (1.0 - value) * 0.15),
                            ),
                          );
                        }),
                        Container(
                          width: 130.r,
                          height: 130.r,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.blue, width: 3.r),
                            image: avatar.isNotEmpty
                                ? DecorationImage(image: NetworkImage(avatar), fit: BoxFit.cover)
                                : null,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.blue.withValues(alpha: 0.2),
                                blurRadius: 30,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: avatar.isEmpty
                              ? Center(
                                  child: Text(
                                    name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'U',
                                    style: TextStyle(
                                      color: Colors.blue,
                                      fontSize: 48.sp,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                      ],
                    );
                  },
                ),
              ),

              SizedBox(height: 20.h),

              Text(
                name,
                style: TextStyle(
                  color: cs.onSurface,
                  fontSize: 25.sp,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.5,
                ),
              ),

              SizedBox(height: 10.h),

              Text(
                'Đang đổ chuông...',
                style: TextStyle(
                  color: cs.onSurface,
                  fontSize: 16.sp,
                ),
              ),

              const Spacer(),

              Center(
                child: _buildBigRoundButton(
                  icon: Icons.call_end_outlined,
                  color: Colors.red,
                  onTap: () {
                    _callService.cancelCall();
                  },
                ),
              ),
              
              SizedBox(height: 50.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBigRoundButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 76.r,
        height: 76.r,
        child: Material(
          color: color,
          shape: const CircleBorder(),
          clipBehavior: Clip.antiAlias,
          child: Center(
            child: Icon(
              icon,
              color: Colors.white,
              size: 30.sp,
            ),
          ),
        ),
      ),
    );
  }
}
