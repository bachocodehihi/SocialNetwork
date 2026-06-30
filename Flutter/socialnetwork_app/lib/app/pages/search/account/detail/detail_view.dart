import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/pages/search/account/detail/all/all_page.dart';
import 'package:socialnetwork/app/pages/search/account/detail/account/account_page.dart';
import 'package:socialnetwork/app/pages/search/account/detail/group/group_page.dart';
import 'package:socialnetwork/app/pages/search/account/detail/post/post_page.dart';

class SearchDetailView extends StatefulWidget {
  const SearchDetailView({super.key});

  @override
  State<SearchDetailView> createState() => _SearchDetailViewState();
}

class _SearchDetailViewState extends State<SearchDetailView> {
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
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: kIsWeb ? 0 : 24.w,
              vertical: 16.h,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Icon(
                        Icons.arrow_back_ios_outlined,
                        size: 20.sp,
                        color: cs.onSurface,
                      ),
                    ),

                    SizedBox(width: 10.w),

                    GestureDetector(
                      onTap: () {
                        //controller.goToPostContent(context);
                      },
                      child: Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: cs.onSurface, 
                              width: 1.w
                            ),
                            borderRadius: BorderRadius.circular(50.r),
                            color: Colors.transparent,
                          ),
                          child: TextField(
                            enabled: false,
                            decoration: InputDecoration(
                              hintText: Language.of(context, 'search'),
                              hintStyle: TextStyle(
                                fontSize: 15.sp, 
                                color: cs.onSurface
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(
                                vertical: 10.h,
                                horizontal: 15.w,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    SizedBox(width: 10.w),

                    GestureDetector(
                      onTap: () {

                      },
                      child: Icon(
                        Icons.tune_outlined,
                        size: 20.sp,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),

                SizedBox(width: 10.w),

                Container(
                  margin: EdgeInsets.symmetric(horizontal: 15.w),
                  child: TabBar(
                    indicatorColor: Colors.blue,
                    indicatorWeight: 2,
                    indicatorSize: TabBarIndicatorSize.label,
                    dividerColor: Colors.transparent,
                    labelColor: Colors.blue,
                    unselectedLabelColor: cs.onSurface,
                    splashFactory: NoSplash.splashFactory,
                    overlayColor: WidgetStateProperty.all(Colors.transparent),
                    labelStyle: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                    ),
                    unselectedLabelStyle: TextStyle(
                      fontSize: 15.sp,
                    ),
                    tabs: [
                      Tab(text: Language.of(context, 'all')),
                      Tab(text: Language.of(context, 'account')),
                      Tab(text: Language.of(context, 'group')),
                      Tab(text: Language.of(context, 'posts')),
                    ],
                  ),
                ),

                SizedBox(height: 10.h),

                Expanded(
                  child: TabBarView(
                    children: [
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: const DetailAllPage(),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: const DetailAccountPage(),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: const DetailGroupPage(),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: const DetailPostPage(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}
