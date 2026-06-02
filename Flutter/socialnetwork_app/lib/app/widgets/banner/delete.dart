import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class BannerDelete extends StatefulWidget {
  final DateTime deleteAt;
  final VoidCallback onCancel;

  const BannerDelete({
    super.key,
    required this.deleteAt,
    required this.onCancel,
  });

  @override
  State<BannerDelete> createState() => _BannerDeleteState();
}

class _BannerDeleteState extends State<BannerDelete> {
  Timer? _timer;
  Duration _timeLeft = Duration.zero;

  @override
  void initState() {
    super.initState();
    _calculateTimeLeft();
    _startTimer();
  }

  void _calculateTimeLeft() {
    final now = DateTime.now();
    if (widget.deleteAt.isAfter(now)) {
      setState(() {
        _timeLeft = widget.deleteAt.difference(now);
      });
    } else {
      setState(() {
        _timeLeft = Duration.zero;
      });
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      _calculateTimeLeft();
      if (_timeLeft == Duration.zero) {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$hours:$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: Colors.red.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(color: Colors.red),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              Icons.warning_amber_outlined,
              color: Colors.red,
              size: 20.sp,
            ),
            SizedBox(width: 10.w),
            Expanded(
              child: Text(
                'Tài khoản sẽ bị xóa sau: ${_formatDuration(_timeLeft)}',
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 15.sp,
                ),
              ),
            ),
            SizedBox(width: 10.w),
            GestureDetector(
              onTap: widget.onCancel,
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: EdgeInsets.all(4.w),
                child: Icon(
                  Icons.close_outlined,
                  color: Colors.red,
                  size: 20.sp,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}