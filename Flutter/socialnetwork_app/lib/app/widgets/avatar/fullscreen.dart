import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AvatarFullScreen extends StatelessWidget {
  final String imageUrl;
  const AvatarFullScreen({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PhotoView(
            imageProvider: NetworkImage(imageUrl),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 4,
            initialScale: PhotoViewComputedScale.contained,
            backgroundDecoration: const BoxDecoration(color: Colors.black),
            loadingBuilder: (context, event) => const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
            errorBuilder: (context, error, stackTrace) => Center(
              child: Icon(
                Icons.broken_image_outlined, 
                color: Colors.white54, 
                size: 50.sp
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: EdgeInsets.only(
                left: 24.w,
                top: 16.h,
                right: 16.w,
                bottom: 16.h,
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.close_outlined,
                      size: 25.sp,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
        ],
      ),
    );
  }
}