import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/select/friend/friend_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';

class SelectFriendView extends StatefulWidget {
  final String title;
  final List<String> initialSelectedIds;

  const SelectFriendView({
    super.key,
    required this.title,
    this.initialSelectedIds = const [],
  });

  @override
  State<SelectFriendView> createState() => _SelectFriendViewState();
}

class _SelectFriendViewState extends State<SelectFriendView> {
  late final SelectFriendController controller;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final repository = ContactRepositoryImp(ContactApi(DioClient.createDio()));
    final usecase = ContactUsecase(repository);
    controller = SelectFriendController(usecase);
    controller.initSelectedIds(widget.initialSelectedIds);
    controller.fetchFriends();
    _searchController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
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

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
        backgroundColor: cs.surface,
        body: SafeArea(
          child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: kIsWeb ? 0 : 24.w,
            vertical: 16.h,
          ),
          child: ListenableBuilder(
            listenable: controller,
            builder: (context, child) {
              return Column(
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
                        widget.title,
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
                      controller: _searchController,
                      onChanged: (val) {
                        controller.setSearchQuery(val);
                      },
                      textAlignVertical: TextAlignVertical.center,
                      style: TextStyle(
                        fontSize: 15.sp,
                        color: cs.onSurface,
                      ),
                      decoration: InputDecoration(
                        isDense: true,
                        hintText: 'Tìm kiếm bạn bè...',
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
                        suffixIcon: _searchController.text.isNotEmpty
                            ? GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  controller.setSearchQuery('');
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

                  if (controller.selectedIds.isNotEmpty) ...[
                    SizedBox(height: 2.h),
                    Text(
                      'Đã chọn: ${controller.selectedIds.length}',
                      style: TextStyle(
                        fontSize: 13.sp,
                        color: Colors.blue,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],

                  Expanded(
                    child: Builder(
                      builder: (context) {
                        if (controller.isLoading) {
                          return const Center(child: CircularProgressIndicator());
                        }
                        if (controller.error != null) {
                          return Center(child: Text('Lỗi: ${controller.error}'));
                        }

                        final filteredFriends = controller.filteredFriends;

                        if (filteredFriends.isEmpty) {
                          return Center(
                            child: Text(
                              Language.of(context, 'no_friends_found'),
                              style: TextStyle(
                                fontSize: 15.sp,
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          );
                        }

                        return ListView.separated(
                          itemCount: filteredFriends.length,
                          separatorBuilder: (_, _) => SizedBox(height: 12.h),
                          itemBuilder: (context, index) {
                            final friend = filteredFriends[index];
                            final String friendId = (friend['id'] ?? friend['_id']).toString();
                            final isSelected = controller.selectedIds.contains(friendId);

                            return Container(
                              padding: EdgeInsets.all(12.w),
                              decoration: BoxDecoration(
                                color: cs.surfaceContainerHighest,
                                borderRadius: BorderRadius.circular(16.r),
                                border: Border.all(
                                  color: isSelected 
                                      ? Colors.blue.withValues(alpha: 0.4) 
                                      : cs.outlineVariant.withValues(alpha: 0.2),
                                  width: isSelected ? 1.5 : 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.03),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 25.r,
                                    backgroundColor: cs.primaryContainer,
                                    backgroundImage: friend['avatar'] != null &&
                                            friend['avatar'].toString().isNotEmpty
                                        ? NetworkImage(friend['avatar'])
                                        : null,
                                    child: (friend['avatar'] == null ||
                                            friend['avatar'].toString().isEmpty)
                                        ? Text(
                                            friend['name']!
                                                .substring(0, 1)
                                                .toUpperCase(),
                                            style: TextStyle(
                                              color: cs.onPrimaryContainer,
                                              fontWeight: FontWeight.w500,
                                              fontSize: 20.sp,
                                            ),
                                          )
                                        : null,
                                  ),
                                  SizedBox(width: 14.w),
                                  Expanded(
                                    child: Text(
                                      friend['name']!,
                                      style: TextStyle(
                                        fontSize: 15.sp,
                                        fontWeight: FontWeight.w500,
                                        color: cs.onSurface,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  InkWell(
                                    onTap: () {
                                      controller.toggleSelection(friendId);
                                    },
                                    borderRadius: BorderRadius.circular(20.r),
                                    child: Container(
                                      width: 36.w,
                                      height: 36.w,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isSelected 
                                            ? Colors.blue.withValues(alpha: 0.1) 
                                            : cs.surface,
                                      ),
                                      child: Icon(
                                        isSelected ? Icons.remove_outlined : Icons.add_outlined,
                                        color: isSelected ? Colors.blue : cs.onSurface,
                                        size: 20.sp,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context, controller.selectedFriends);
                    },
                    child: Text(
                      Language.of(context, 'continue'),
                      style: TextStyle(
                        fontSize: 16.sp,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                  // ElevatedButton(
                  //   style: ElevatedButton.styleFrom(
                  //     backgroundColor: Colors.blue,
                  //     foregroundColor: Colors.black,
                  //     minimumSize: Size(double.infinity, 48.h),
                  //     shape: RoundedRectangleBorder(
                  //       borderRadius: BorderRadius.circular(30.r),
                  //     ),
                  //   ).copyWith(
                  //     overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                  //   ),
                  //   onPressed: controller.isLoading
                  //     ? null
                  //     : _onVerify,
                  //   child: controller.isLoading
                  //     ? const CircularProgressIndicator(
                  //       color: Colors.white
                  //     ) : Text(
                  //         Language.of(context, 'continue'),
                  //         style: TextStyle(
                  //           color: Colors.white,
                  //           fontSize: 15.sp,
                  //         ),
                  //       ),
                  // ),
                ],
              );
            },
          ),
        ),
      ),
    ),
  );
}
}
