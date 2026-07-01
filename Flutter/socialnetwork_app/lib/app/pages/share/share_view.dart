import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/share/share_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

class ShareView extends StatefulWidget {
  const ShareView({super.key});

  @override
  State<ShareView> createState() => _ShareViewState();
}

class _ShareViewState extends State<ShareView> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late ShareController _controller;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _controller = ShareController();
    _controller.addListener(_onControllerChanged);
    _searchController.addListener(() => setState(() {}));
  }

  void _onControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _controller.removeListener(_onControllerChanged);
    _controller.dispose();
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

    List<Map<String, dynamic>> getFilteredItems(int tabIndex) {
      final List<Map<String, dynamic>> allItems = [];

      for (final f in _controller.friends) {
        final name = f['username'] ?? f['name'] ?? 'Bạn bè';
        final id = (f['_id'] ?? f['id'] ?? '').toString();
        allItems.add({
          'id': id,
          'name': name,
          'avatar': f['avatar'] ?? '',
          'type': 'friend',
        });
      }

      for (final g in _controller.groups) {
        final name = g['name'] ?? 'Nhóm';
        final id = (g['_id'] ?? g['id'] ?? '').toString();
        allItems.add({
          'id': id,
          'name': name,
          'avatar': g['avatar'] ?? '',
          'type': 'group',
        });
      }

      return allItems.where((item) {
        final matchesSearch = item['name']
            .toString()
            .toLowerCase()
            .contains(_searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (tabIndex == 0) return true;
        if (tabIndex == 1) return item['type'] == 'friend';
        return item['type'] == 'group';
      }).toList();
    }

    Widget buildListItem(Map<String, dynamic> item) {
      final String id = item['id'];
      final String name = item['name'];
      final String avatar = item['avatar'];
      final String type = item['type'];
      final bool isShared = _controller.sharedIds.contains(id);

      return Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: cs.shadow.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 25.r,
              backgroundColor: cs.primaryContainer,
              backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,
              child: avatar.isEmpty
                  ? Text(
                      name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'U',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onPrimaryContainer,
                      ),
                    )
                  : null,
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    type == 'friend' ? 'Bạn bè' : 'Nhóm',
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 12.w),
            ElevatedButton(
              onPressed: () => _controller.toggleShare(id),
              style: ElevatedButton.styleFrom(
                backgroundColor: isShared ? cs.secondaryContainer : Colors.blue,
                foregroundColor: isShared ? cs.onSecondaryContainer : Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20.r),
                ),
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              ),
              child: Text(
                isShared ? 'Đã chia sẻ' : 'Chia sẻ',
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      );
    }

    Widget buildTabContent(int tabIndex) {
      if (_controller.isLoading) {
        return const Center(child: CircularProgressIndicator());
      }

      if (_controller.error != null) {
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Lỗi khi tải dữ liệu: ${_controller.error}',
                style: TextStyle(color: cs.error, fontSize: 14.sp),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),
              ElevatedButton(
                onPressed: _controller.fetchData,
                child: const Text('Thử lại'),
              ),
            ],
          ),
        );
      }

      final items = getFilteredItems(tabIndex);
      if (items.isEmpty) {
        return Center(
          child: Text(
            'Không tìm thấy kết quả phù hợp.',
            style: TextStyle(color: cs.onSurfaceVariant, fontSize: 14.sp),
          ),
        );
      }

      return ListView.separated(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.only(top: 16.h, bottom: 24.h),
        itemCount: items.length,
        separatorBuilder: (context, index) => SizedBox(height: 12.h),
        itemBuilder: (context, index) {
          return buildListItem(items[index]);
        },
      );
    }

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
                    Language.of(context, 'share'),
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
                    setState(() {
                      _searchQuery = val;
                    });
                  },
                  textAlignVertical: TextAlignVertical.center,
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                  decoration: InputDecoration(
                    isDense: true,
                    hintText: 'Tìm kiếm bạn bè, nhóm...',
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
                              setState(() {
                                _searchQuery = '';
                              });
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
              
              Container(
                height: 48.h,
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(24.r),
                  border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(24.r),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: cs.onSurfaceVariant,
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  tabs: const [
                    Tab(text: 'Tất cả'),
                    Tab(text: 'Bạn bè'),
                    Tab(text: 'Nhóm'),
                  ],
                ),
              ),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    buildTabContent(0),
                    buildTabContent(1),
                    buildTabContent(2),
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
