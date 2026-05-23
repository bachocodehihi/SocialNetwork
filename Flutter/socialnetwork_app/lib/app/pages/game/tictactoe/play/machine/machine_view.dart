import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
class PlayMachineTictactoeView extends StatefulWidget {
  const PlayMachineTictactoeView({super.key});
  @override
  State<PlayMachineTictactoeView> createState() => _PlayMachineTictactoeViewState();
}
class _PlayMachineTictactoeViewState extends State<PlayMachineTictactoeView> {

  List<String> board = List.filled(9, '');
  String currentPlayer = 'X';
  String gameState = 'playing';
  String winner = '';

  Color get xColor => Colors.redAccent;
  Color get oColor => Colors.blueAccent;

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
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: Icon(
                      Icons.arrow_back_ios_outlined, 
                      size: 20.sp,
                      color: cs.onSurfaceVariant,
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
              SizedBox(height: 20.h),

              _buildStatusMessage(cs),

              SizedBox(height: 24.h),

              Center(child: _buildGameBoard(cs)),

              SizedBox(height: 32.h),

              Center(
                child: ElevatedButton.icon(
                  onPressed: _resetGame,
                  icon: Icon(Icons.refresh, size: 18.sp),
                  label: Text('New Game', style: TextStyle(fontSize: 14.sp)),
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
  Widget _buildStatusMessage(ColorScheme cs) {
    String message;
    Color textColor;

    if (gameState == 'won') {
      message = '🎉 Player $winner wins!';
      textColor = Colors.amber;
    } else if (gameState == 'draw') {
      message = "🤝 It's a draw!";
      textColor = cs.onSurfaceVariant;
    } else {
      message = "Player $currentPlayer's turn";
      textColor = currentPlayer == 'X' ? xColor : oColor;
    }

    return Center(
      child: Text(
        message,
        style: TextStyle(
          fontSize: 18.sp,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }

  // 🎮 Build bàn cờ 3x3
  Widget _buildGameBoard(ColorScheme cs) {
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: cs.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: cs.outlineVariant, width: 1.5),
      ),
      child: AspectRatio(
        aspectRatio: 1,
        child: Column(
          children: [
            for (int row = 0; row < 3; row++)
              Expanded(
                child: Row(
                  children: [
                    for (int col = 0; col < 3; col++)
                      Expanded(
                        child: _buildCell(row * 3 + col, cs),
                      ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCell(int index, ColorScheme cs) {
    final value = board[index];
    final canPlay = gameState == 'playing' && value.isEmpty;

    return GestureDetector(
      onTap: canPlay ? () => _handleTap(index) : null,
      child: Container(
        margin: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: canPlay ? cs.outlineVariant : cs.outline.withOpacity(0.5),
            width: 1.5,
          ),
          boxShadow: canPlay
              ? [
                  BoxShadow(
                    color: cs.shadow.withOpacity(0.1),
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  )
                ]
              : [],
        ),
        child: Center(
          child: _buildMarker(value),
        ),
      ),
    );
  }

  Widget _buildMarker(String value) {
    if (value.isEmpty) return const SizedBox();

    return AnimatedScale(
      scale: 1,
      duration: const Duration(milliseconds: 200),
      child: Text(
        value,
        style: TextStyle(
          fontSize: 40.sp,
          fontWeight: FontWeight.bold,
          color: value == 'X' ? xColor : oColor,
          shadows: [
            Shadow(
              color: (value == 'X' ? xColor : oColor).withOpacity(0.3),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
      ),
    );
  }

  void _handleTap(int index) {
    if (gameState != 'playing' || board[index].isNotEmpty) return;

    setState(() {
      board[index] = currentPlayer;

      final result = _checkWinner();
      if (result != null) {
        gameState = 'won';
        winner = result;
      } else if (board.every((cell) => cell.isNotEmpty)) {
        gameState = 'draw';
      } else {
        currentPlayer = currentPlayer == 'X' ? 'O' : 'X';
      }
    });
  }

  // 🏆 Kiểm tra người thắng
  String? _checkWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (final line in lines) {
      final [a, b, c] = line;
      if (board[a].isNotEmpty &&
          board[a] == board[b] &&
          board[a] == board[c]) {
        return board[a];
      }
    }
    return null;
  }

  void _resetGame() {
    setState(() {
      board = List.filled(9, '');
      currentPlayer = 'X';
      gameState = 'playing';
      winner = '';
    });
  }
}      
