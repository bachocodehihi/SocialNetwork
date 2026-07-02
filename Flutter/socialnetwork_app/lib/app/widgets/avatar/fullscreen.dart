import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AvatarFullScreen extends StatefulWidget {
  final List<String> imageUrls;
  final int initialIndex;
  final String? imageUrl;

  const AvatarFullScreen({
    super.key,
    this.imageUrls = const [],
    this.initialIndex = 0,
    this.imageUrl,
  });

  @override
  State<AvatarFullScreen> createState() => _AvatarFullScreenState();
}

class _AvatarFullScreenState extends State<AvatarFullScreen> {
  late PageController _pageController;
  late List<String> _images;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    if (widget.imageUrls.isNotEmpty) {
      _images = widget.imageUrls;
      _currentIndex = widget.initialIndex;
    } else if (widget.imageUrl != null && widget.imageUrl!.isNotEmpty) {
      _images = [widget.imageUrl!];
      _currentIndex = 0;
    } else {
      _images = [];
      _currentIndex = 0;
    }
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_images.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Text(
            'Không có hình ảnh',
            style: TextStyle(color: Colors.white, fontSize: 16.sp),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PhotoViewGallery.builder(
            scrollPhysics: const BouncingScrollPhysics(),
            builder: (BuildContext context, int index) {
              return PhotoViewGalleryPageOptions(
                imageProvider: NetworkImage(_images[index]),
                initialScale: PhotoViewComputedScale.contained,
                minScale: PhotoViewComputedScale.contained,
                maxScale: PhotoViewComputedScale.covered * 4,
                heroAttributes: PhotoViewHeroAttributes(tag: _images[index]),
                errorBuilder: (context, error, stackTrace) => Center(
                  child: Icon(
                    Icons.broken_image_outlined,
                    color: Colors.white54,
                    size: 50.sp,
                  ),
                ),
              );
            },
            itemCount: _images.length,
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
              padding: EdgeInsets.only(
                left: 24.w,
                top: 16.h,
                right: 24.w,
                bottom: 16.h,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.close_outlined,
                      size: 25.sp,
                      color: Colors.white,
                    ),
                  ),
                  if (_images.length > 1)
                    Text(
                      '${_currentIndex + 1}/${_images.length}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  if (_images.length > 1)
                    SizedBox(width: 25.w)
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