import 'package:flutter/material.dart';
import 'package:socialnetwork/data/service/socket.dart';

class PlayUserTictactoeController extends ChangeNotifier {
  final SocketService _socketService = SocketService();
  
  List<String> board = List.filled(9, '');
  String currentPlayerId = '';
  String myUserId = '';
  String gameState = 'playing';
  String winnerId = '';
  Map<String, dynamic>? room;
  bool isMyTurn = false;
  String mySymbol = '';

  late Function(dynamic) _boardUpdateListener;
  late Function(dynamic) _gameOverListener;
  late Function(dynamic) _gameStartListener;
  late Function(dynamic) _opponentLeftListener;
  late Function(dynamic) _rematchRequestListener;
  late Function(dynamic) _rematchDeclinedListener;

  bool isWaitingForRematch = false;
  bool hasRematchRequest = false;

  PlayUserTictactoeController() {
    _initSocketListeners();
  }

  void _initSocketListeners() {
    _boardUpdateListener = (data) {
      _updateFromRoom(data);
    };

    _gameOverListener = (data) {
      _updateFromRoom(data);
      gameState = 'ended';
      winnerId = data['winner'] ?? '';
      notifyListeners();
    };

    _gameStartListener = (data) {
      _updateFromRoom(data);
      gameState = 'playing';
      winnerId = '';
      isWaitingForRematch = false;
      hasRematchRequest = false;
      notifyListeners();
    };

    _opponentLeftListener = (data) {
      notifyListeners();
    };

    _rematchRequestListener = (data) {
      hasRematchRequest = true;
      notifyListeners();
    };

    _rematchDeclinedListener = (data) {
      isWaitingForRematch = false;
      notifyListeners();
    };

    _socketService.on('ttt_board_update', _boardUpdateListener);
    _socketService.on('ttt_game_over', _gameOverListener);
    _socketService.on('ttt_game_start', _gameStartListener);
    _socketService.on('ttt_opponent_left', _opponentLeftListener);
    _socketService.on('ttt_rematch_request', _rematchRequestListener);
    _socketService.on('ttt_rematch_declined', _rematchDeclinedListener);
  }

  void initRoom(Map<String, dynamic> roomData, String userId) {
    room = roomData;
    myUserId = userId;
    _updateFromRoom(roomData);
  }

  void _updateFromRoom(Map<String, dynamic> data) {
    room = data;
    board = List<String>.from(data['board']);
    currentPlayerId = data['currentTurn'];
    isMyTurn = currentPlayerId == myUserId;
    mySymbol = data['xPlayer'] == myUserId ? 'X' : 'O';
    notifyListeners();
  }

  void makeMove(int index) {
    if (!isMyTurn || board[index].isNotEmpty || gameState != 'playing') return;
    
    _socketService.emit('ttt_move', {
      'roomId': room?['roomId'],
      'index': index,
    });
  }

  void requestRematch() {
    isWaitingForRematch = true;
    _socketService.emit('ttt_rematch', {'roomId': room?['roomId']});
    notifyListeners();
  }

  void respondRematch(bool accept) {
    hasRematchRequest = false;
    _socketService.emit('ttt_rematch_response', {
      'roomId': room?['roomId'],
      'accept': accept,
    });
    notifyListeners();
  }

  void leaveRoom() {
    _socketService.emit('ttt_leave_room', {'roomId': room?['roomId']});
  }

  @override
  void dispose() {
    _socketService.off('ttt_board_update', _boardUpdateListener);
    _socketService.off('ttt_game_over', _gameOverListener);
    _socketService.off('ttt_game_start', _gameStartListener);
    _socketService.off('ttt_opponent_left', _opponentLeftListener);
    _socketService.off('ttt_rematch_request', _rematchRequestListener);
    _socketService.off('ttt_rematch_declined', _rematchDeclinedListener);
    super.dispose();
  }
}