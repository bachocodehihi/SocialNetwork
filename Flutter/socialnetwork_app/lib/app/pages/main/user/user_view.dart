import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/home/home_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/message_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/contact/contact_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/notification/notification_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/profile/profile_page.dart';
import 'package:socialnetwork/app/pages/main/user/user_controller.dart';
import 'package:socialnetwork/app/widgets/drawer/menu/user/user_view.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class MainUserView extends StatelessWidget {
  final int initialIndex;
  const MainUserView({super.key, this.initialIndex = 0});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MainUserController(initialIndex: initialIndex),
      child: const _MainUserViewState(),
    );
  }
  
}
class _MainUserViewState extends StatelessWidget {
  const _MainUserViewState();
  @override
  Widget build(BuildContext context) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
    final pages = [
      const HomeUserPage(),
      const MessageUserPage(),
      const ContactUserPage(),
      const NotificationUserPage(),
      const ProfileUserPage(),
    ];
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: cs.surface,
      drawer: const MenuDrawerUserView(),
      body: Consumer<MainUserController>(
        builder: (context, controller, _) => IndexedStack(
          index: controller.currentIndex,
          children: pages,
        ),
      ),
      bottomNavigationBar: Container(
        height: 80.h,
        decoration: BoxDecoration(
          color: cs.surfaceContainer,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          boxShadow: [
            BoxShadow(
              color: cs.shadow.withValues(alpha: 0.12),
              blurRadius: 10,
              spreadRadius: 2,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Consumer<MainUserController>(
          builder: (context, controller, _) => Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Expanded(child: _buildNavItem(context, Icons.home_outlined, Language.of(context, 'home'), 0)),
              Expanded(child: _buildNavItem(context, Icons.message_outlined, Language.of(context, 'message'), 1)),
              Expanded(child: _buildNavItem(context, Icons.people_outline_outlined, Language.of(context, 'contact'), 2)),
              Expanded(child: _buildNavItem(context, Icons.notifications_outlined, Language.of(context, 'notification'), 3)),
              Expanded(child: _buildNavItem(context, Icons.person_outlined, Language.of(context, 'profile'), 4)),
            ],
          ),
        ),
      ),
    );
  }
  Widget _buildNavItem(BuildContext context, IconData icon, String label, int index) {
    final controller = context.read<MainUserController>();
    final isActive = context.watch<MainUserController>().currentIndex == index;
    return GestureDetector(
      onTap: () => controller.changeTab(index),
      child: Container(
        color: Colors.transparent,
        padding: EdgeInsets.symmetric(vertical: 4.h),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedScale(
              scale: isActive ? 1.15 : 1.0,
              duration: const Duration(milliseconds: 200),
              child: Icon(
                icon,
                color: isActive ? Colors.blue : Colors.grey,
                size: 25.sp,
              ),
            ),
            SizedBox(height: 2.h),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: TextStyle(
                color: isActive ? Colors.blue : Colors.grey,
                fontSize: 12.sp,
                fontWeight: isActive ? FontWeight.w500 : FontWeight.normal,
              ),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  label,
                  maxLines: 1,
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            SizedBox(height: 2.h),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 2.h,
              width: isActive ? 16.w : 0,
              color: Colors.blue,
            ),
          ],
        ),
      ),
    );
  }
  
}