import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/item/setting.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/pages/list/member/member_view.dart';
import 'package:socialnetwork/app/pages/qrcode/group/group_view.dart';
import 'package:socialnetwork/data/local/auth_local.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/widgets/toast/toast.dart';

class ViewGroupView extends StatefulWidget {
  final String conversationId;
  final String groupId;
  final String groupName;
  final String groupAvatar;

  const ViewGroupView({
    super.key,
    required this.conversationId,
    required this.groupId,
    required this.groupName,
    this.groupAvatar = '',
  });

  @override
  State<ViewGroupView> createState() => _ViewGroupViewState();
}

class _ViewGroupViewState extends State<ViewGroupView> {
  bool _isLeaving = false;

  Future<void> _leaveGroup() async {
    if (widget.groupId.isEmpty) {
      AppToast.show(context, 'Không tìm thấy thông tin ID nhóm. Vui lòng quay lại và thử lại.');
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        final cs = Theme.of(context).colorScheme;
        return AlertDialog(
          title: Text(
            Language.of(context, 'leave_group'),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          content: const Text('Bạn có chắc chắn muốn rời khỏi nhóm này không? Các tin nhắn cũ của bạn vẫn sẽ được giữ lại.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(
                'Hủy',
                style: TextStyle(color: cs.onSurfaceVariant),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Rời nhóm'),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    setState(() {
      _isLeaving = true;
    });

    try {
      final currentUser = await AuthLocal.getCurrentUser();
      final currentUserId = currentUser?['_id'] ?? currentUser?['id'];
      if (currentUserId == null) {
        throw Exception('Không tìm thấy thông tin người dùng');
      }

      final groupUsecase = GroupUsecase(
        GroupRepositoryImp(
          GroupApi(DioClient.createDio()),
        ),
      );

      final res = await groupUsecase.removeMember(widget.groupId, currentUserId.toString());
      if (res['success'] == true) {
        if (mounted) {
          AppToast.show(context, 'Rời nhóm thành công!');
          Navigator.of(context).pushNamedAndRemoveUntil(Routes.mainUser, (route) => false);
        }
      } else {
        throw Exception(res['message'] ?? 'Rời nhóm không thành công');
      }
    } catch (e) {
      if (mounted) {
        AppToast.show(context, e.toString().replaceAll('Exception: ', ''));
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLeaving = false;
        });
      }
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
    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(    
                horizontal: kIsWeb ? 0 : 24.w,
                vertical: 16.h,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Icon(
                          Icons.arrow_back_ios_outlined, 
                          size: 20.sp,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 40.h),

                  CircleAvatar(
                    radius: 50.r,
                    backgroundColor: cs.primaryContainer,
                    backgroundImage: widget.groupAvatar.isNotEmpty
                        ? NetworkImage(widget.groupAvatar)
                        : null,
                    child: widget.groupAvatar.isEmpty
                        ? Text(
                            widget.groupName.isNotEmpty 
                                ? widget.groupName.substring(0, 1).toUpperCase() 
                                : 'G',
                            style: TextStyle(
                              color: cs.onPrimaryContainer,
                              fontSize: 32.sp,
                              fontWeight: FontWeight.w500,
                            ),
                          )
                        : null,
                  ),

                  SizedBox(height: 10.h),

                  Text(
                    widget.groupName,
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(height: 20.h),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildFunctionItem(
                        Icons.people_outline_rounded,
                        Language.of(context, 'member'),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ListMemberView(groupId: widget.groupId),
                            ),
                          );
                        },
                      ),

                      _buildFunctionItem(
                        Icons.search_rounded,
                        Language.of(context, 'search_in_chat'),
                        onTap: () {
                          
                        },
                      ),

                      _buildFunctionItem(
                        Icons.notifications_outlined,
                        Language.of(context, 'notification'),
                        onTap: () {
                          
                        },
                      ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  SettingItem(
                    title: Language.of(context, 'image'),
                    icon: Icons.image_outlined,
                    color: cs.onSurface,
                    onTap: () {
                    },
                  ),

                  SizedBox(height: 15.h),

                  SettingItem(
                    title: Language.of(context, 'qr_group'),
                    icon: Icons.qr_code_outlined,
                    color: cs.onSurface,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => QRCodeGroupView(groupId: widget.groupId),
                        ),
                      );
                    },
                  ),

                  SizedBox(height: 15.h),

                  SettingItem(
                    title: Language.of(context, 'call'),
                    icon: Icons.call_outlined,
                    color: cs.onSurface,
                    onTap: () {
                    },
                  ),

                  SizedBox(height: 15.h),

                  SettingItem(
                    title: Language.of(context, 'delete_chat_history'),
                    icon: Icons.delete_outlined,
                    color: Colors.red,
                    onTap: () {
                      
                    },
                  ),

                  SizedBox(height: 15.h),

                  SettingItem(
                    title: Language.of(context, 'leave_group'),
                    icon: Icons.exit_to_app_outlined,
                    color: Colors.red,
                    onTap: _leaveGroup,
                  ),

                ],    
              ),
            ),
            if (_isLeaving)
              Container(
                color: Colors.black54,
                child: const Center(
                  child: CircularProgressIndicator(),
                ),
              ),
          ],
        ),
      ),
    ); 
  }

  Widget _buildFunctionItem(
    IconData icon,
    String title, 
    {VoidCallback? onTap,
  }) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100.w,
        child: Column(
          children: [
            Icon(
              icon,
              size: 20.sp,
              color: cs.onSurface,
            ),
            SizedBox(height: 4.h),
            Text(
              title,
              style: TextStyle(
                color: cs.onSurface,
                fontSize: 12.sp,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
