class Config {
  static const bool isProduction = false;

  static const String currentIp = '192.168.1.4';
  static const int currentPort = 5000;

  static const String productionUrl = 'https://socialnetwork-rkjz.onrender.com';

  static const String googleServerClientId = '706195528798-4c1hmi2jnpf940u04n7d0gv4n2h5t0vs.apps.googleusercontent.com';

  static String get baseUrl {
    return isProduction ? productionUrl : 'http://$currentIp:$currentPort';
  }
}