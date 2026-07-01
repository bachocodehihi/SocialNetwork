import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/search/account/account_controller.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class SearchAccountView extends StatefulWidget {
  const SearchAccountView({super.key});

  @override
  State<SearchAccountView> createState() => _SearchAViewState();
}

class _SearchAViewState extends State<SearchAccountView> {
  late SearchAccountController controller;

  @override
  void initState() {
    super.initState();
    controller = SearchAccountController();
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

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
        backgroundColor: cs.surface,
        body: SafeArea(
          child: ListenableBuilder(
            listenable: controller,
            builder: (context, _) {
              return Padding(
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
                        Text(
                          Language.of(context, 'search'),
                          style: TextStyle(
                            fontSize: 20.sp,
                            fontWeight: FontWeight.w500,
                            color: cs.onSurface,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20.h),
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: Colors.grey, 
                          width: 1.w,
                        ),
                        borderRadius: BorderRadius.circular(50.r),
                        color: Colors.transparent,
                      ),
                      child: TextField(
                        controller: controller.searchController,
                        onChanged: controller.onSearchChanged,
                        textInputAction: TextInputAction.search,
                        textAlignVertical: TextAlignVertical.center,
                        onSubmitted: (val) {
                          if (val.trim().isNotEmpty) {
                            Navigator.pushNamed(
                              context,
                              Routes.searchDetail,
                              arguments: val,
                            );
                          }
                        },
                        style: TextStyle(
                          fontSize: 15.sp,
                          color: cs.onSurface,
                        ),
                        decoration: InputDecoration(
                          isDense: true,
                          hintText: Language.of(context, 'search'),
                          hintStyle: TextStyle(
                            fontSize: 15.sp, 
                            color: Colors.grey,
                          ),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(
                            vertical: 12.h,
                            horizontal: 15.w,
                          ),
                          suffixIcon: controller.searchController.text.isNotEmpty
                              ? GestureDetector(
                                  onTap: () {
                                    controller.searchController.clear();
                                    controller.onSearchChanged('');
                                  },
                                  child: Icon(
                                    Icons.clear_outlined,
                                    color: Colors.grey,
                                    size: 20.sp,
                                  ),
                                )
                              : null,
                        ),
                      ),
                    ),

                    SizedBox(height: 20.h),

                    if (controller.error != null)
                      Container(
                        margin: EdgeInsets.only(bottom: 12.h),
                        padding: EdgeInsets.symmetric(
                          horizontal: 12.w, 
                          vertical: 8.h
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Colors.red, 
                              size: 18.sp
                            ),
                            SizedBox(width: 8.w),
                            Expanded(
                              child: Text(
                                controller.error!,
                                style: TextStyle(
                                  fontSize: 13.sp,
                                  color: Colors.red.shade900
                                ),
                              ),
                            ),
                            IconButton(
                              icon: Icon(Icons.close_outlined, size: 18.sp),
                              onPressed: controller.clearError,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                      ),

                    Expanded(
                      child: _buildContent(cs),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildContent(ColorScheme cs) {
    if (controller.searchController.text.isEmpty) {
      return _buildRecentUsers(cs);
    }
    if (controller.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (controller.error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi_off_outlined,
              size: 48.sp, 
              color: cs.onSurfaceVariant
            ),
            SizedBox(height: 12.h),
            Text(
              'Đã xảy ra lỗi',
              style: TextStyle(
                color: cs.onSurfaceVariant, 
                fontSize: 14.sp
              ),
            ),
          ],
        ),
      );
    }
    if (controller.results.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_outlined,
              size: 48.sp, 
              color: cs.onSurfaceVariant
            ),
            SizedBox(height: 12.h),
            Text(
              'User not found',
              style: TextStyle(
                color: cs.onSurfaceVariant, 
                fontSize: 14.sp
              ),
            ),
          ],
        ),
      );
    }
    return _buildResultsList(cs);
  }

  Widget _buildRecentUsers(ColorScheme cs) {
    if (controller.recentUsers.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.manage_search_outlined,
              size: 48.sp, 
              color: cs.onSurfaceVariant
            ),
            SizedBox(height: 12.h),
            Text(
              'No search history',
              style: TextStyle(color: cs.onSurfaceVariant, fontSize: 14.sp),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              Language.of(context, 'recent'),
              style: TextStyle(
                fontSize: 15.sp,
                fontWeight: FontWeight.w500,
                color: cs.onSurface,
              ),
            ), 
            GestureDetector(
              onTap: controller.clearRecentUsers,
              child: Text(
                Language.of(context, 'clear_all'), 
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.blue,
                ),
              ),
            ),
          ],
        ),

        SizedBox(height: 4.h),

        Expanded(
          child: ListView.builder(
            itemCount: controller.recentUsers.length,
            itemBuilder: (context, index) {
              if (index < 0 || index >= controller.recentUsers.length) {
                return const SizedBox.shrink();
              }
              final user = controller.recentUsers[index];
              return _UserTile(
                user: user,
                trailing: IconButton(
                  icon: Icon(
                    Icons.close_outlined,
                    size: 18.sp, 
                    color: cs.onSurfaceVariant
                  ),
                  onPressed: () => controller.removeRecentUser(user),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                onTap: () => _onUserTap(user),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildResultsList(ColorScheme cs) {
    return ListView.builder(
      itemCount: controller.results.length,
      itemBuilder: (context, index) {
        if (index < 0 || index >= controller.results.length) {
          return const SizedBox.shrink();
        }
        final user = controller.results[index];
        return _UserTile(
          user: user,
          onTap: () => _onUserTap(user),
        );
      },
    );
  }

  void _onUserTap(Map<String, dynamic> user) async {
    await controller.saveRecentUser(user);

    if (mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => UserPage(userData: user),
        ),
      );
    }
  }
}

class _UserTile extends StatelessWidget {
  final Map<String, dynamic> user;
  final VoidCallback onTap;
  final Widget? trailing;

  const _UserTile({
    required this.user,
    required this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final avatarUrl = user['avatar'] as String?;
    final username = user['username'] as String? ?? 'Unknown';
    final email = user['email'] as String? ?? '';
    final fullName = user['full_name'] as String? ?? user['name'] as String?;

    return ListTile(
      contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 4.h),
      leading: CircleAvatar(
        radius: 24.r,
        backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty)
            ? NetworkImage(avatarUrl)
            : null,
        backgroundColor: cs.surfaceContainerHighest,
        child: (avatarUrl == null || avatarUrl.isEmpty)
            ? Icon(
              Icons.person_outline, 
              color: cs.onSurfaceVariant
            )
            : null,
      ),
      title: Text(
        fullName?.isNotEmpty == true ? fullName! : username,
        style: TextStyle(
          fontSize: 15.sp,
          fontWeight: FontWeight.w500,
          color: cs.onSurface,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (fullName != null && fullName.isNotEmpty)
            Text(
              '@$username',
              style: TextStyle(
                fontSize: 12.sp,
                color: cs.onSurfaceVariant,
              ),
            ),
          if (email.isNotEmpty)
            Text(
              email,
              style: TextStyle(
                fontSize: 12.sp,
                color: cs.onSurfaceVariant,
              ),
            ),
        ],
      ),
      trailing: trailing,
      onTap: onTap,
    );
  }
}