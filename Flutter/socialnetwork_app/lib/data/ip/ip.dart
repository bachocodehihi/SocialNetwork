class IpConfig {
  // Đặt true để dùng server Railway (Production)
  // Đặt false để dùng localhost/ip local (Development)
  static const bool isProduction = true;

  // Local Development
  static const String currentIp = '192.168.1.3';
  static const int currentPort = 5000;

  // Production (Railway)
  static const String productionUrl = 'https://socialnetwork-production-459e.up.railway.app';

  static String get baseUrl {
    return isProduction ? productionUrl : 'http://$currentIp:$currentPort';
  }
}