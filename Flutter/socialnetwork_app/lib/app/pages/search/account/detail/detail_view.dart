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
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final String query = ModalRoute.of(context)?.settings.arguments as String? ?? '';
    if (_searchController.text.isEmpty && query.isNotEmpty) {
      _searchController.text = query;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
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

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        backgroundColor: cs.surface,
        body: SafeArea(
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

                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: cs.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(30.r),
                          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        child: TextField(
                          controller: _searchController,
                          textInputAction: TextInputAction.search,
                          onSubmitted: (val) {
                            // Can update state or query here if needed
                          },
                          decoration: InputDecoration(
                            hintText: Language.of(context, 'search'),
                            hintStyle: TextStyle(
                              fontSize: 14.sp,
                              color: cs.onSurfaceVariant,
                            ),
                            icon: Icon(
                              Icons.search,
                              size: 20.sp,
                              color: cs.onSurfaceVariant,
                            ),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),

                    SizedBox(width: 10.w),

                    GestureDetector(
                      onTap: () {
                        // filter tune action
                      },
                      child: Icon(
                        Icons.tune_outlined,
                        size: 20.sp,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 20.h),

                Container(
                  margin: EdgeInsets.symmetric(horizontal: 15.w),
                  child: TabBar(
                    indicatorColor: Colors.blue,
                    indicatorWeight: 2.h,
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
