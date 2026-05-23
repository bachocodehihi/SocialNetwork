import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/game/tictactoe/tictactoe_controller.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/service/socket.dart';
import 'dart:async';

class GameTictactoeView extends StatefulWidget {
  const GameTictactoeView({super.key});
  @override
  State<GameTictactoeView> createState() => _GameTictactoeViewState();
}

class _GameTictactoeViewState extends State<GameTictactoeView> {
  late GameTictactoeController controller;
  final SocketService _socketService = SocketService();

  Timer? _searchTimer;
  int _searchSeconds = 0;
  bool _isDialogShowing = false;
  bool _isInGame = false;

  @override
  void initState() {
    super.initState();
    controller = GameTictactoeController();
    controller.addListener(_onControllerChanged);
    _socketService.on('ttt_game_start', _onGameStart);
    _socketService.on('ttt_error', _onTttError);
  }

  void _onTttError(dynamic data) {
    if (!mounted) return;
    _closeSearchDialog();
    String message = data['message'] ?? 'Đã có lỗi xảy ra';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
    );
  }

  void _onControllerChanged() {
    if (!mounted) return;
    setState(() {});
    
    final isSearching = controller.matchmakingStatus == 'searching';
    if (isSearching && !_isDialogShowing) {
      _startSearchDialog();
    } else if (!isSearching && _isDialogShowing) {
      _closeSearchDialog();
    }
  }

  void _startSearchDialog() {
    if (_isDialogShowing) return;
    _searchSeconds = 0;
    _isDialogShowing = true;
    _searchTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _searchSeconds++);
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => _SearchingDialog(
        getSeconds: () => _searchSeconds,
        onCancel: () {
          controller.leaveMatchmaking();
        },
      ),
    ).then((_) {
      _isDialogShowing = false;
      _searchTimer?.cancel();
    });
  }

  void _closeSearchDialog() {
    _searchTimer?.cancel();
    if (_isDialogShowing) {
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      _isDialogShowing = false;
    }
  }

  void _onGameStart(dynamic data) {
    debugPrint('🎮 TicTacToe: Game start received');
    _closeSearchDialog();

    if (mounted && !_isInGame) {
      setState(() => _isInGame = true);
      // Small delay to ensure dialog is fully closed and context is stable
      Future.delayed(const Duration(milliseconds: 100), () async {
        if (mounted) {
          await Navigator.pushNamed(
            context,
            Routes.playUserTictactoe,
            arguments: data is Map ? data : Map<String, dynamic>.from(data),
          );
          if (mounted) {
            setState(() {
              _isInGame = false;
            });
          }
        }
      });
    }
  }

  @override
  void dispose() {
    _searchTimer?.cancel();
    _socketService.off('ttt_game_start', _onGameStart);
    _socketService.off('ttt_error', _onTttError);
    controller.removeListener(_onControllerChanged);
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isSearching = controller.matchmakingStatus == 'searching';

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
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
                      size: 20.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Text(
                    'Tic tac toe',
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 40.h),
              _buildMenuCard(
                context,
                cs,
                title: 'Play with Friends',
                subtitle: 'Create a room and invite your friends',
                icon: Icons.people_outline,
                onTap: () async {
                  setState(() => _isInGame = true);
                  await controller.goToPlayTictactoe(context);
                  if (mounted) setState(() => _isInGame = false);
                },
                color: Colors.orangeAccent,
              ),
              SizedBox(height: 20.h),
              _buildMenuCard(
                context,
                cs,
                title: 'Find Match',
                subtitle: 'Play with random opponents online',
                icon: Icons.public,
                onTap: isSearching ? () {} : controller.joinMatchmaking,
                color: Colors.blueAccent,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context,
    ColorScheme cs, {
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
    required Color color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: cs.surfaceVariant.withOpacity(0.3),
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: cs.outlineVariant.withOpacity(0.5)),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28.sp),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              size: 16.sp,
              color: cs.onSurfaceVariant.withOpacity(0.5),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchingDialog extends StatefulWidget {
  final int Function() getSeconds;
  final VoidCallback onCancel;

  const _SearchingDialog({
    required this.getSeconds,
    required this.onCancel,
  });

  @override
  State<_SearchingDialog> createState() => _SearchingDialogState();
}

class _SearchingDialogState extends State<_SearchingDialog> {
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  String _formatTime(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24.r)),
      backgroundColor: cs.surface,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 32.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 56.w,
              height: 56.w,
              child: const CircularProgressIndicator(
                strokeWidth: 3,
                color: Colors.blueAccent,
              ),
            ),
            SizedBox(height: 20.h),
            Text(
              'Finding Match...',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: cs.onSurface,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Waiting for other players to join',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.sp,
                color: cs.onSurfaceVariant,
              ),
            ),
            SizedBox(height: 20.h),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 10.h),
              decoration: BoxDecoration(
                color: Colors.blueAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Text(
                _formatTime(widget.getSeconds()),
                style: TextStyle(
                  fontSize: 28.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.blueAccent,
                  letterSpacing: 4,
                ),
              ),
            ),
            SizedBox(height: 24.h),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  widget.onCancel();
                  Navigator.pop(context);
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.redAccent,
                  side: const BorderSide(color: Colors.redAccent),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 12.h),
                ),
                child: Text(
                  'Cancel',
                  style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}