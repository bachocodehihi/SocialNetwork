class IpConfig {
  static const bool isProduction = true;

  static const String currentIp = '192.168.1.3';
  static const int currentPort = 5000;

  static const String productionUrl = 'https://socialnetwork-production-459e.up.railway.app';

  static String get baseUrl {
    return isProduction ? productionUrl : 'http://$currentIp:$currentPort';
  }
}