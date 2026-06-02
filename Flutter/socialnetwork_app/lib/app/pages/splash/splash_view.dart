import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:socialnetwork/app/pages/splash/splash_controller.dart';
class SplashView extends StatefulWidget {
  const SplashView({super.key});
  @override
  State<SplashView> createState() => _SplashViewState();
}
class _SplashViewState extends State<SplashView> {
  final controller = SplashController();
  @override
  void initState() {
    super.initState();
    controller.init((targetRoute) {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, targetRoute);
    });
  }
  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
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
      body: Stack(
        children: [
          Center(
            child: ValueListenableBuilder<bool>(
              valueListenable: controller.showLogo,
              builder: (context, showLogo, _) {
                return AnimatedOpacity(
                  opacity: showLogo ? 1 : 0,
                  duration: const Duration(milliseconds: 500),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset('assets/logo/logo.png', width: 100),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}