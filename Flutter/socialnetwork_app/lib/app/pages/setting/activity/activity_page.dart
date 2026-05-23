import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/pages/setting/activity/activity_controller.dart';
import 'package:socialnetwork/app/pages/setting/activity/activity_view.dart';

class SettingActivityPage extends StatelessWidget {
  const SettingActivityPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ActivityController(),
      child: const SettingActivityView(),
    );
  }
}
