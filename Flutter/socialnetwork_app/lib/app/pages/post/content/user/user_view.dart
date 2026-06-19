import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/post/content/user/user_controller.dart';

class PostContentView extends StatefulWidget {
  const PostContentView({super.key});

  @override
  State<PostContentView> createState() => _PostContentViewState();
}

class _PostContentViewState extends State<PostContentView> {
  late PostContentController controller;

  @override
  void initState() {
    super.initState();
    controller = PostContentController();
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
          icon: Icon(
            Icons.close_outlined, 
            color: cs.onSurface, 
            size: 24.sp
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Tạo bài viết',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w500,
            color: cs.onSurface,
          ),
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
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quyền riêng tư selector
                    Text(
                      'Quyền riêng tư:',
                      style: TextStyle(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                    SizedBox(height: 5.h),
                    Row(
                      children: [
                        ChoiceChip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.public_outlined, size: 14.sp),
                              SizedBox(width: 4.w),
                              const Text('Công khai'),
                            ],
                          ),
                          selected: controller.privacy == 'public',
                          onSelected: (selected) {
                            if (selected) controller.setPrivacy('public');
                          },
                          selectedColor: cs.secondaryContainer,
                          labelStyle: TextStyle(
                            color: controller.privacy == 'public' ? cs.onSecondaryContainer : cs.onSurface,
                            fontSize: 12.sp,
                          ),
                        ),
                        SizedBox(width: 8.w),
                        ChoiceChip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.people_alt_outlined, size: 14.sp),
                              SizedBox(width: 4.w),
                              const Text('Bạn bè'),
                            ],
                          ),
                          selected: controller.privacy == 'friends',
                          onSelected: (selected) {
                            if (selected) controller.setPrivacy('friends');
                          },
                          selectedColor: cs.secondaryContainer,
                          labelStyle: TextStyle(
                            color: controller.privacy == 'friends' ? cs.onSecondaryContainer : cs.onSurface,
                            fontSize: 12.sp,
                          ),
                        ),
                        SizedBox(width: 8.w),
                        ChoiceChip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.lock_outlined, size: 14.sp),
                              SizedBox(width: 4.w),
                              const Text('Riêng tư'),
                            ],
                          ),
                          selected: controller.privacy == 'private',
                          onSelected: (selected) {
                            if (selected) controller.setPrivacy('private');
                          },
                          selectedColor: cs.secondaryContainer,
                          labelStyle: TextStyle(
                            color: controller.privacy == 'private' ? cs.onSecondaryContainer : cs.onSurface,
                            fontSize: 12.sp,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 15.h),

                    TextField(
                      controller: controller.contentController,
                      maxLines: null,
                      minLines: 5,
                      style: TextStyle(
                        fontSize: 16.sp,
                        color: cs.onSurface,
                        height: 1.4,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Bạn đang nghĩ gì thế?',
                        hintStyle: TextStyle(
                          fontSize: 16.sp,
                          color: Colors.grey.shade500,
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                    SizedBox(height: 15.h),

                    if (controller.pickedImages.isNotEmpty) ...[
                      Text(
                        'Đã chọn ${controller.pickedImages.length} ảnh',
                        style: TextStyle(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                      SizedBox(height: 10.h),
                      SizedBox(
                        height: 120.h,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: controller.pickedImages.length,
                          separatorBuilder: (context, index) => SizedBox(width: 10.w),
                          itemBuilder: (context, index) {
                            final image = controller.pickedImages[index];
                            return Stack(
                              children: [
                                Container(
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

            // Bottom controls panel
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: cs.outlineVariant, width: 0.5)),
              ),
              child: Row(
                children: [
                  Text(
                    'Thêm vào bài viết của bạn',
                    style: TextStyle(
                      fontSize: 15.sp,
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
                      size: 25.sp,
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
