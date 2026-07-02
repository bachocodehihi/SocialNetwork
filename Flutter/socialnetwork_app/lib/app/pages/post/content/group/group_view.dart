import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:socialnetwork/app/pages/post/content/group/group_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
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

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        backgroundColor: cs.surface,
        body: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: kIsWeb ? 0 : 16.w,
              vertical: 16.h,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (controller.errorMessage.isNotEmpty)
                  Container(
                    width: double.infinity,
                    color: cs.errorContainer,
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                    margin: EdgeInsets.only(bottom: 10.h),
                    child: Text(
                      controller.errorMessage,
                      style: TextStyle(color: cs.onErrorContainer, fontSize: 13.sp),
                    ),
                  ),

                Row(
                  children: [
                    SizedBox(width: 8.w),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Icon(
                        Icons.arrow_back_ios_outlined,
                        size: 20.sp,
                        color: cs.onSurface,
                      ),
                    ),
                    SizedBox(width: 10.w),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Language.of(context, 'create_post'),
                          style: TextStyle(
                            fontSize: 18.sp,
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
                  ],
                ),

                SizedBox(height: 20.h),

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

                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextField(
                          controller: controller.contentController,
                          textAlign: TextAlign.justify,
                          maxLines: null,
                          minLines: 5,
                          style: TextStyle(
                            fontSize: 15.sp,
                            color: cs.onSurface,
                          ),
                          decoration: InputDecoration(
                            hintText: 'Chia sẻ điều gì đó với các thành viên trong nhóm...',
                            hintStyle: TextStyle(
                              fontSize: 15.sp,
                              color: Colors.grey,
                            ),
                            border: InputBorder.none,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                if (controller.pickedImages.isNotEmpty) ...[
                  SizedBox(height: 16.h),
                  SizedBox(
                    height: 90.h,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.only(
                        left: 16.w,
                        right: 16.w,
                        top: 6.h,
                      ),
                      itemCount: controller.pickedImages.length + 1,
                      separatorBuilder: (_, _) => SizedBox(width: 12.w),
                      itemBuilder: (context, index) {
                        if (index == controller.pickedImages.length) {
                          return GestureDetector(
                            onTap: () => controller.pickImages(),
                            child: Container(
                              width: 80.h,
                              height: 80.h,
                              decoration: BoxDecoration(
                                color: cs.surfaceContainerHighest,
                                borderRadius: BorderRadius.circular(12.r),
                                border: Border.all(
                                  color: cs.outlineVariant.withValues(alpha: 0.5),
                                  width: 1,
                                ),
                              ),
                              child: Icon(
                                Icons.add_a_photo_outlined,
                                color: cs.onSurfaceVariant,
                                size: 25.sp,
                              ),
                            ),
                          );
                        }

                        final imageFile = controller.pickedImages[index];
                        return Stack(
                          clipBehavior: Clip.none,
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
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12.r),
                                child: SizedBox(
                                  width: 80.h,
                                  height: 80.h,
                                  child: kIsWeb
                                      ? Image.network(
                                          imageFile.path,
                                          fit: BoxFit.cover,
                                        )
                                      : Image.file(
                                          File(imageFile.path),
                                          fit: BoxFit.cover,
                                        ),
                                ),
                              ),
                            ),
                            Positioned(
                              top: -4.h,
                              right: -4.w,
                              child: GestureDetector(
                                onTap: () => controller.removeImage(index),
                                child: Container(
                                  padding: EdgeInsets.all(3.w),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.6),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white,
                                      width: 1.5,
                                    ),
                                  ),
                                  child: Icon(
                                    Icons.close_outlined,
                                    size: 12.sp,
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
                ],

                SizedBox(height: 20.h),

                GestureDetector(
                  onTap: () => controller.pickImages(),
                  child: Row(
                    children: [
                      Text(
                        Language.of(context, 'choose_photos_from_the_album'),
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurface,
                        ),
                      ),
                      const Spacer(),
                      Icon(
                        Icons.image_outlined,
                        size: 25.sp,
                        color: Colors.green,
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 20.h),

                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.black,
                    minimumSize: Size(double.infinity, 48.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.r),
                    ),
                  ).copyWith(
                    overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                  ),
                  onPressed: controller.isSubmitting
                      ? null
                      : () => controller.submitPost(context),
                  child: controller.isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : Text(
                          Language.of(context, 'post'),
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15.sp,
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
