import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/widgets/toast/toast.dart';
import 'package:socialnetwork/app/pages/group/join/join_controller.dart';
import 'package:socialnetwork/app/pages/group/group_page.dart';

class JoinGroupView extends StatefulWidget {
  final String inviteCode;
  final Map<String, dynamic> groupData;

  const JoinGroupView({
    super.key,
    required this.inviteCode,
    required this.groupData,
  });

  @override
  State<JoinGroupView> createState() => _JoinGroupViewState();
}

class _JoinGroupViewState extends State<JoinGroupView> {
  late final JoinGroupController _controller;

  @override
  void initState() {
    super.initState();
    _controller = JoinGroupController();
    _controller.addListener(_onControllerUpdate);
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerUpdate);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleJoin() async {
    final res = await _controller.joinGroup(widget.inviteCode);
    if (!mounted) return;

    if (res != null && res['success'] == true) {
      AppToast.show(context, 'Tham gia nhóm thành công!');
      
      final groupObj = res['group'] ?? widget.groupData;
      final groupId = groupObj['_id'] ?? groupObj['id'] ?? widget.groupData['_id'] ?? widget.groupData['id'];

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => GroupPage(groupId: groupId.toString()),
        ),
      );
    } else {
      AppToast.show(context, _controller.error ?? 'Lỗi khi tham gia nhóm');
    }
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

    final groupName = widget.groupData['name'] ?? 'Nhóm trò chuyện';
    final avatar = widget.groupData['avatar'] ?? '';
    final description = widget.groupData['description'] ?? 'Không có mô tả nào cho nhóm này.';
    final membersCount = (widget.groupData['members'] as List? ?? []).length;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_outlined, size: 20.sp, color: cs.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          Language.of(context, 'join_group'),
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: cs.onSurface,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 130.r,
                      height: 130.r,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: cs.primaryContainer.withValues(alpha: 0.2),
                      ),
                    ),
                    CircleAvatar(
                      radius: 56.r,
                      backgroundColor: cs.primaryContainer,
                      backgroundImage: avatar.isNotEmpty ? NetworkImage(avatar) : null,
                      child: avatar.isEmpty
                          ? Icon(
                              Icons.group_outlined,
                              size: 56.r,
                              color: cs.onPrimaryContainer,
                            )
                          : null,
                    ),
                  ],
                ),
                SizedBox(height: 24.h),
                Text(
                  groupName,
                  style: TextStyle(
                    fontSize: 22.sp,
                    fontWeight: FontWeight.bold,
                    color: cs.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 8.h),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h),
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.people_outline_rounded, size: 16.sp, color: cs.primary),
                      SizedBox(width: 6.w),
                      Text(
                        '$membersCount thành viên',
                        style: TextStyle(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 24.h),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  child: Text(
                    description,
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: cs.onSurfaceVariant,
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: 48.h),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    minimumSize: Size(double.infinity, 50.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.r),
                    ),
                    elevation: 2,
                  ).copyWith(
                    overlayColor: WidgetStateProperty.all(Colors.blue[700]),
                  ),
                  onPressed: _controller.isLoading ? null : _handleJoin,
                  child: _controller.isLoading
                      ? SizedBox(
                          width: 24.w,
                          height: 24.h,
                          child: const CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          Language.of(context, 'join_group'),
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                          ),
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
