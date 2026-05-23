import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/game/tictactoe/play/user/user_controller.dart';
import 'package:socialnetwork/data/service/socket.dart';

class PlayUserTictactoeView extends StatefulWidget {
  const PlayUserTictactoeView({super.key});
  @override
  State<PlayUserTictactoeView> createState() => _PlayUserTictactoeViewState();
}

class _PlayUserTictactoeViewState extends State<PlayUserTictactoeView> {
  late PlayUserTictactoeController controller;
  final SocketService _socketService = SocketService();

  @override
  void initState() {
    super.initState();
    controller = PlayUserTictactoeController();
    controller.addListener(_onControllerUpdate);

    _socketService.on('ttt_rematch_declined', _onRematchDeclined);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
      controller.initRoom(args, _socketService.currentUserId ?? '');
    });
  }

  void _onControllerUpdate() {
    if (!mounted) return;
    setState(() {});
    
    if (controller.hasRematchRequest) {
      _showRematchDialog();
    }
  }

  void _onRematchDeclined(dynamic data) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đối thủ đã từ chối tái đấu')),
    );
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) Navigator.pop(context);
    });
  }

  void _showRematchDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Tái đấu?'),
        content: const Text('Đối thủ muốn thách đấu lại ván nữa!'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              controller.respondRematch(false);
              Navigator.pop(this.context); // Leave game
            },
            child: const Text('Từ chối'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              controller.respondRematch(true);
            },
            child: const Text('Đồng ý'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _socketService.off('ttt_rematch_declined', _onRematchDeclined);
    controller.leaveRoom();
    controller.dispose();
    super.dispose();
  }

  Color get xColor => Colors.redAccent;
  Color get oColor => Colors.blueAccent;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
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
              _buildHeader(cs),
              SizedBox(height: 30.h),
              _buildPlayersInfo(cs),
              SizedBox(height: 20.h),
              _buildStatusMessage(cs),
              SizedBox(height: 24.h),
              Center(child: _buildGameBoard(cs)),
              SizedBox(height: 32.h),
              if (controller.gameState == 'ended')
                Center(
                  child: controller.isWaitingForRematch
                      ? Column(
                          children: [
                            const CircularProgressIndicator(),
                            SizedBox(height: 8.h),
                            Text('Đang chờ đối thủ...', style: TextStyle(fontSize: 14.sp)),
                          ],
                        )
                      : ElevatedButton.icon(
                          onPressed: controller.requestRematch,
                          icon: Icon(Icons.refresh, size: 18.sp),
                          label: Text('Tái đấu', style: TextStyle(fontSize: 14.sp)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: cs.primary,
                            foregroundColor: cs.onPrimary,
                            padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.r),
                            ),
                          ),
                        ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(ColorScheme cs) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Icon(
            Icons.arrow_back_ios_outlined,
            size: 20.sp,
            color: cs.onSurfaceVariant,
          ),
        ),
        SizedBox(width: 10.w),
        Text(
          'Online Match',
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.w600,
            color: cs.onSurface,
          ),
        ),
        const Spacer(),
        if (controller.room != null)
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
            decoration: BoxDecoration(
              color: cs.secondaryContainer,
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Text(
              'Room: ${controller.room!['roomId']}',
              style: TextStyle(
                fontSize: 12.sp,
                color: cs.onSecondaryContainer,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPlayersInfo(ColorScheme cs) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _buildPlayerAvatar('You', controller.mySymbol, controller.isMyTurn, cs),
        Text('VS', style: TextStyle(fontWeight: FontWeight.bold, color: cs.outline)),
        _buildPlayerAvatar('Opponent', controller.mySymbol == 'X' ? 'O' : 'X', !controller.isMyTurn && controller.gameState == 'playing', cs),
      ],
    );
  }

  Widget _buildPlayerAvatar(String name, String symbol, bool isTurn, ColorScheme cs) {
    final color = symbol == 'X' ? xColor : oColor;
    return Column(
      children: [
        Container(
          width: 60.w,
          height: 60.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isTurn ? color.withOpacity(0.2) : cs.surfaceVariant,
            border: Border.all(
              color: isTurn ? color : cs.outlineVariant,
              width: 2,
            ),
            boxShadow: isTurn ? [BoxShadow(color: color.withOpacity(0.3), blurRadius: 10, spreadRadius: 2)] : [],
          ),
          child: Center(
            child: Text(
              symbol,
              style: TextStyle(
                fontSize: 24.sp,
                fontWeight: FontWeight.bold,
                color: isTurn ? color : cs.onSurfaceVariant,
              ),
            ),
          ),
        ),
        SizedBox(height: 8.h),
        Text(
          name,
          style: TextStyle(
            fontSize: 14.sp,
            fontWeight: isTurn ? FontWeight.bold : FontWeight.normal,
            color: isTurn ? cs.onSurface : cs.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusMessage(ColorScheme cs) {
    String message;
    Color textColor;

    if (controller.gameState == 'ended') {
      if (controller.winnerId.isEmpty) {
        message = "🤝 It's a draw!";
        textColor = cs.onSurfaceVariant;
      } else if (controller.winnerId == controller.myUserId) {
        message = '🎉 You Won!';
        textColor = Colors.green;
      } else {
        message = '💀 You Lost';
        textColor = Colors.red;
      }
    } else {
      if (controller.isMyTurn) {
        message = "It's your turn!";
        textColor = controller.mySymbol == 'X' ? xColor : oColor;
      } else {
        message = "Waiting for opponent...";
        textColor = cs.onSurfaceVariant;
      }
    }

    return Center(
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: textColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15.r),
        ),
        child: Text(
          message,
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
      ),
    );
  }

  Widget _buildGameBoard(ColorScheme cs) {
    return Container(
      padding: EdgeInsets.all(12.w),
      constraints: BoxConstraints(maxWidth: 350.w),
      decoration: BoxDecoration(
        color: cs.surfaceVariant.withOpacity(0.2),
        borderRadius: BorderRadius.circular(24.r),
        border: Border.all(color: cs.outlineVariant.withOpacity(0.5)),
      ),
      child: AspectRatio(
        aspectRatio: 1,
        child: GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: 9,
          itemBuilder: (context, index) => _buildCell(index, cs),
        ),
      ),
    );
  }

  Widget _buildCell(int index, ColorScheme cs) {
    final value = controller.board[index];
    final canPlay = controller.isMyTurn && value.isEmpty && controller.gameState == 'playing';

    return GestureDetector(
      onTap: () => controller.makeMove(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: canPlay ? cs.primary.withOpacity(0.5) : cs.outlineVariant,
            width: canPlay ? 2 : 1,
          ),
          boxShadow: [
            if (canPlay)
              BoxShadow(color: cs.primary.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 4))
          ],
        ),
        child: Center(
          child: _buildMarker(value),
        ),
      ),
    );
  }

  Widget _buildMarker(String value) {
    if (value.isEmpty) return const SizedBox();

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 300),
      curve: Curves.elasticOut,
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: Text(
            value,
            style: TextStyle(
              fontSize: 40.sp,
              fontWeight: FontWeight.bold,
              color: value == 'X' ? xColor : oColor,
              shadows: [
                Shadow(
                  color: (value == 'X' ? xColor : oColor).withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
