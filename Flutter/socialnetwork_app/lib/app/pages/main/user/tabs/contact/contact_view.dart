import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/contact/friend/friend_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/contact/request/request_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/contact/group/group_page.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class ContactUserView extends StatefulWidget {
  const ContactUserView({super.key});
  @override
  State<ContactUserView> createState() => _ContactUserViewState();
}
class _ContactUserViewState extends State<ContactUserView> {
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
    return DefaultTabController(
      length: 3,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: kIsWeb ? 0 : 24.w,
                vertical: 16.h,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    Language.of(context, 'contact'),
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              margin: EdgeInsets.symmetric(horizontal: 16.w),
              child: TabBar(
                indicatorColor: cs.primary,
                indicatorWeight: 2,
                indicatorSize: TabBarIndicatorSize.label,
                dividerColor: Colors.transparent,
                labelColor: cs.primary,
                unselectedLabelColor: cs.onSurfaceVariant,
                splashFactory: NoSplash.splashFactory,
                overlayColor: WidgetStateProperty.all(Colors.transparent),
                labelStyle: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                ),
                unselectedLabelStyle: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.normal,
                ),
                tabs: [
                  Tab(text: Language.of(context, 'requests')),
                  Tab(text: Language.of(context, 'friends')),
                  Tab(text: Language.of(context, 'groups')),
                ],
              ),
            ),
            SizedBox(height: 10.h),
            Expanded(
              child: TabBarView(
                children: [
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: const ContactRequestPage(),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: const ContactFriendPage(),
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: const ContactGroupPage(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}      
