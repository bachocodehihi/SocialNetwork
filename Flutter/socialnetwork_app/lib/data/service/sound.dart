
import 'package:audioplayers/audioplayers.dart';
class SoundService {
  static final SoundService _instance = SoundService._internal();
  factory SoundService() => _instance;
  SoundService._internal();

  final AudioPlayer _player = AudioPlayer();

  Future<void> playMessageReceived() async {
    await _player.play(AssetSource('sounds/chat/receive/receive.mp3'));
  }

  void dispose() {
    _player.dispose();
  }
}