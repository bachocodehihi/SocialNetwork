import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/providers/app_provider.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/theme/app_theme.dart';
import 'package:socialnetwork/app/widgets/socket_lifecycle_handler.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppProvider(),
      child: Consumer<AppProvider>(
        builder: (context, settings, _) {
          return ScreenUtilInit(
            designSize: const Size(375, 812),
            minTextAdapt: true,
            splitScreenMode: true,
            builder: (context, child) => SocketLifecycleHandler(
              child: MaterialApp(
                navigatorKey: Routes.navigatorKey,
                debugShowCheckedModeBanner: false,
                theme: AppTheme.light,
                darkTheme: AppTheme.dark,
                themeMode: settings.themeMode,
                locale: settings.locale,
                supportedLocales: const [Locale('en'), Locale('vi')],
                localizationsDelegates: const [
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                ],
                initialRoute: Routes.splash,
                routes: Routes.routes,
              ),
            ),
          );
        },
      ),
    );
  }
}
