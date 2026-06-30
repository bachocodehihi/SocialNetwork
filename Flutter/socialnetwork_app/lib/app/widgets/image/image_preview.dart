import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:image_picker/image_picker.dart';

class ImagePreviewScreen extends StatefulWidget {
  final List<XFile> images;
  final int initialIndex;

  const ImagePreviewScreen({
    super.key,
    required this.images,
    required this.initialIndex,
  });

  @override
  State<ImagePreviewScreen> createState() => _ImagePreviewScreenState();
}

class _ImagePreviewScreenState extends State<ImagePreviewScreen> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PhotoViewGallery.builder(
            scrollPhysics: const BouncingScrollPhysics(),
            builder: (BuildContext context, int index) {
              final imageFile = widget.images[index];
              ImageProvider imageProvider;
              if (kIsWeb) {
                imageProvider = NetworkImage(imageFile.path);
              } else {
                imageProvider = FileImage(File(imageFile.path));
              }

              return PhotoViewGalleryPageOptions(
                imageProvider: imageProvider,
                initialScale: PhotoViewComputedScale.contained,
                minScale: PhotoViewComputedScale.contained,
                maxScale: PhotoViewComputedScale.covered * 4,
              );
            },
            itemCount: widget.images.length,
            loadingBuilder: (context, event) => const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
            backgroundDecoration: const BoxDecoration(color: Colors.black),
            pageController: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: EdgeInsets.all(8.w),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.close_outlined,
                        size: 24.sp,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  if (widget.images.length > 1)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(16.r),
                      ),
                      child: Text(
                        '${_currentIndex + 1}/${widget.images.length}',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
