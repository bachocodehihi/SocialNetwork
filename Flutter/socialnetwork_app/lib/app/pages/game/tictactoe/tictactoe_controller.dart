import 'dart:async';
import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/data/service/socket.dart';

class GameTictactoeController extends ChangeNotifier {
  final SocketService _socketService = SocketService();
  String matchmakingStatus = 'idle';
  int searchingSeconds = 0;
  Timer? _timer;

  late Function(dynamic) _matchmakingListener;
  late Function(dynamic) _gameStartListener;

  GameTictactoeController() {
    _initSocketListeners();
  }

  void _initSocketListeners() {
    _matchmakingListener = (data) {
      matchmakingStatus = data['status'] ?? 'idle';
      debugPrint('🎮 TicTacToe Matchmaking Status: $matchmakingStatus');
      if (matchmakingStatus == 'searching') {
        _startTimer();
      } else {
        _stopTimer();
      }
      notifyListeners();
    };

    _gameStartListener = (data) {
      debugPrint('🎮 TicTacToe Game Start event received in controller');
      matchmakingStatus = 'idle';
      _stopTimer();
      notifyListeners();
    };

    _socketService.on('ttt_matchmaking_status', _matchmakingListener);
    _socketService.on('ttt_game_start', _gameStartListener);
  }

  void _startTimer() {
    _stopTimer();
    searchingSeconds = 0;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      searchingSeconds++;
      notifyListeners();
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
  }

  String get formattedTime {
    int minutes = searchingSeconds ~/ 60;
    int seconds = searchingSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void joinMatchmaking() {
    _socketService.emit('ttt_join_matchmaking', null);
  }

  void leaveMatchmaking() {
    _socketService.emit('ttt_leave_matchmaking', null);
    matchmakingStatus = 'idle';
    _stopTimer();
    notifyListeners();
  }

  Future<void> goToPlayTictactoe(BuildContext context) async {
    Navigator.pushNamed(context, Routes.playUserTictactoe);
  }

  @override
  void dispose() {
    _stopTimer();
    _socketService.off('ttt_matchmaking_status', _matchmakingListener);
    _socketService.off('ttt_game_start', _gameStartListener);
    super.dispose();
  }
}