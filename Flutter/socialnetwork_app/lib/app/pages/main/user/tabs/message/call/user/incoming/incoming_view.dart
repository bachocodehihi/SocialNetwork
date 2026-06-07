import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class CallInComingView extends StatefulWidget {
  const CallInComingView({super.key});

  @override
  State<CallInComingView> createState() => _CallInComingViewState();
}

class _CallInComingViewState extends State<CallInComingView> with SingleTickerProviderStateMixin {
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

    // Safety check: if call is already ended/idle or null, close screen instantly
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
    final cs = Theme.of(context).colorScheme;
    final callInfo = _callService.currentCall;

    if (callInfo == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F0F1A),
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    final remoteUser = callInfo.remoteUser;
    final name = remoteUser['username'] ?? remoteUser['name'] ?? 'Social Network User';
    final avatar = remoteUser['avatar'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: Stack(
        children: [
          // Animated gradient blobs
          Positioned(
            top: -100.h,
            left: -50.w,
            child: Container(
              width: 300.w,
              height: 300.h,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: cs.primary.withValues(alpha: 0.15),
              ),
            ),
          ),
          Positioned(
            bottom: -150.h,
            right: -100.w,
            child: Container(
              width: 400.w,
              height: 400.h,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: cs.secondary.withValues(alpha: 0.12),
              ),
            ),
          ),

          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
            child: Container(color: Colors.transparent),
          ),

          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 24.h),
              child: Column(
                children: [
                  SizedBox(height: 40.h),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(30.r),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.08),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.call_received_outlined, color: Colors.greenAccent, size: 14.sp),
                        SizedBox(width: 6.w),
                        Text(
                          'CUỘC GỌI ĐẾN',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 10.sp,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),

                  // Pulsing wave avatar
                  AnimatedBuilder(
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
                                color: cs.primary.withValues(alpha: (1.0 - value) * 0.15),
                              ),
                            );
                          }),
                          Container(
                            width: 130.r,
                            height: 130.r,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: cs.primary.withValues(alpha: 0.6), width: 3.r),
                              image: avatar.isNotEmpty
                                  ? DecorationImage(image: NetworkImage(avatar), fit: BoxFit.cover)
                                  : null,
                              boxShadow: [
                                BoxShadow(
                                  color: cs.primary.withValues(alpha: 0.3),
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
                                        color: Colors.white,
                                        fontSize: 48.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  )
                                : null,
                          ),
                        ],
                      );
                    },
                  ),
                  SizedBox(height: 36.h),

                  Text(
                    name,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26.sp,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 12.h),
                  Text(
                    'Đang gọi cho bạn...',
                    style: TextStyle(
                      color: Colors.white60,
                      fontSize: 16.sp,
                    ),
                  ),

                  const Spacer(),

                  // Accept & Decline buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Decline button
                      _buildBigRoundButton(
                        icon: Icons.call_end,
                        color: Colors.redAccent,
                        onTap: () => _callService.rejectCall(),
                      ),
                      // Accept button
                      _buildBigRoundButton(
                        icon: Icons.call,
                        color: Colors.green,
                        onTap: () => _callService.acceptCall(),
                      ),
                    ],
                  ),
                  SizedBox(height: 40.h),
                ],
              ),
            ),
          ),
        ],
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
      child: Container(
        width: 76.r,
        height: 76.r,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.4),
              blurRadius: 20,
              spreadRadius: 4,
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 34.sp,
        ),
      ),
    );
  }
}
