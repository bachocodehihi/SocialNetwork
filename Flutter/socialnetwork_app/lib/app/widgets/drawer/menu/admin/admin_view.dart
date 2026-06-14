import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:socialnetwork/app/widgets/drawer/menu/admin/admin_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class MenuDrawerAdminView extends StatefulWidget {
  const MenuDrawerAdminView({super.key});
  @override
  State<MenuDrawerAdminView> createState() => _MenuDrawerAdminViewState();
}
class _MenuDrawerAdminViewState extends State<MenuDrawerAdminView> {
  late MenuDrawerAdminController controller;

  @override
  void initState() {
    super.initState();
    controller = MenuDrawerAdminController();
    controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Drawer(
      backgroundColor: cs.surface,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            padding: EdgeInsets.symmetric(    
              horizontal: kIsWeb ? 0 : 24.w,
              vertical: 16.h,
            ),
            decoration: const BoxDecoration(
              color: Colors.blue
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 40.r,
                  backgroundImage: controller.avatar.isNotEmpty
                      ? NetworkImage(controller.avatar)
                      : null,
                  child: controller.avatar.isEmpty
                      ? Icon(
                        Icons.person_outlined, 
                        size: 30.sp
                      )
                      : null,
                ),
                SizedBox(height: 10.h),
                Text(
                  controller.username,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20.sp,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard_outlined),
            title: Text(
              Language.of(context, 'dashboard'),
              style: TextStyle(
                color: cs.onSurface,
                fontSize: 15.sp,
              ),
            ),
            onTap: () {
              Navigator.pop(context);
              controller.goToSetting(context);
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: Text(
              Language.of(context, 'setting'),
              style: TextStyle(
                color: cs.onSurface,
                fontSize: 15.sp,
              ),
            ),
            onTap: () {
              Navigator.pop(context);
              controller.goToSetting(context);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout_outlined, color: Colors.red),
            title: Text(
              Language.of(context, 'log_out'), 
              style: TextStyle(
                color: Colors.red,
                fontSize: 15.sp,
              ),
            ),
            onTap: () {
              controller.logout(context);
            },
          ),
        ],
      ),
    );
  }
}