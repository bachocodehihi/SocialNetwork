import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/post/content/group/group_controller.dart';
import 'package:socialnetwork/app/widgets/image/image_preview.dart';

class GroupPostContentView extends StatefulWidget {
  final String groupId;
  final String groupName;

  const GroupPostContentView({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  State<GroupPostContentView> createState() => _GroupPostContentViewState();
}

class _GroupPostContentViewState extends State<GroupPostContentView> {
  late GroupPostContentController controller;

  @override
  void initState() {
    super.initState();
    controller = GroupPostContentController(groupId: widget.groupId);
    controller.addListener(() => setState(() {}));
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

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: cs.onSurface, size: 24.sp),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          children: [
            Text(
              'Tạo bài viết',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w500,
                color: cs.onSurface,
              ),
            ),
            Text(
              'trong ${widget.groupName}',
              style: TextStyle(
                fontSize: 12.sp,
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          Container(
            margin: EdgeInsets.only(right: 16.w, top: 10.h, bottom: 10.h),
            child: ElevatedButton(
              onPressed: controller.isSubmitting ? null : () => controller.submitPost(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20.r),
                ),
              ),
              child: controller.isSubmitting
                  ? SizedBox(
                      width: 16.w,
                      height: 16.h,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text(
                      'Đăng',
                      style: TextStyle(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (controller.errorMessage.isNotEmpty)
              Container(
                width: double.infinity,
                color: cs.errorContainer,
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                child: Text(
                  controller.errorMessage,
                  style: TextStyle(color: cs.onErrorContainer, fontSize: 13.sp),
                ),
              ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(vertical: 12.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                          decoration: BoxDecoration(
                            color: cs.primaryContainer,
                            borderRadius: BorderRadius.circular(16.r),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.groups_outlined, size: 16.sp, color: cs.onPrimaryContainer),
                              SizedBox(width: 6.w),
                              Text(
                                'Thành viên nhóm',
                                style: TextStyle(
                                  color: cs.onPrimaryContainer,
                                  fontWeight: FontWeight.w500,
                                  fontSize: 12.sp,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),

                    TextField(
                      controller: controller.contentController,
                      maxLines: null,
                      minLines: 8,
                      style: TextStyle(
                        fontSize: 16.sp,
                        color: cs.onSurface,
                        height: 1.4,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Chia sẻ điều gì đó với các thành viên trong nhóm...',
                        hintStyle: TextStyle(
                          fontSize: 16.sp,
                          color: Colors.grey.shade500,
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ],
                ),
              ),

              if (controller.pickedImages.isNotEmpty) ...[
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  child: Text(
                    'Đã chọn ${controller.pickedImages.length} ảnh',
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ),
                SizedBox(height: 10.h),
                SizedBox(
                  height: 120.h,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    itemCount: controller.pickedImages.length,
                    separatorBuilder: (context, index) => SizedBox(width: 10.w),
                    itemBuilder: (context, index) {
                      final image = controller.pickedImages[index];
                      return Stack(
                        children: [
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ImagePreviewScreen(
                                    images: controller.pickedImages,
                                    initialIndex: index,
                                  ),
                                ),
                              );
                            },
                            child: Container(
                              width: 120.w,
                              height: 120.h,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12.r),
                                border: Border.all(color: cs.outlineVariant),
                                image: DecorationImage(
                                  image: FileImage(File(image.path)),
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            top: 6.h,
                            right: 6.w,
                            child: GestureDetector(
                              onTap: () => controller.removeImage(index),
                              child: Container(
                                padding: EdgeInsets.all(4.w),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.6),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.close_rounded,
                                  size: 14.sp,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
                SizedBox(height: 20.h),
              ],
                  ],
                ),
              ),
            ),

            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: cs.outlineVariant, width: 0.5)),
              ),
              child: Row(
                children: [
                  Text(
                    'Thêm hình ảnh',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: controller.pickImages,
                    icon: Icon(
                      Icons.image_outlined,
                      color: Colors.green,
                      size: 28.sp,
                    ),
                    tooltip: 'Chọn ảnh từ thư viện',
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
