// import 'dart:io';
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
// import 'package:socialnetwork/app/pages/post/content/user/user_controller.dart';
// import 'package:socialnetwork/app/theme/app_translation.dart';
// class PostContentView extends StatefulWidget {
//   const PostContentView({super.key});

//   @override
//   State<PostContentView> createState() => _PostContentViewState();
// }

// class _PostContentViewState extends State<PostContentView> {
//   late PostContentController controller;

//   @override
//   void initState() {
//     super.initState();
//     controller = PostContentController();
//     controller.addListener(() => setState(() {}));
//   }

//   @override
//   void dispose() {
//     controller.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final brightness = Theme.of(context).brightness;
//     SystemChrome.setSystemUIOverlayStyle(
//       SystemUiOverlayStyle(
//         statusBarColor: Colors.transparent,
//         statusBarIconBrightness:
//             brightness == Brightness.dark ? Brightness.light : Brightness.dark,
//       ),
//     );
//     final cs = Theme.of(context).colorScheme;

//     return Scaffold(
//       backgroundColor: cs.surface,
//       appBar: AppBar(
//         backgroundColor: cs.surface,
//         elevation: 0,
//         leading: IconButton(
//           icon: Icon(
//             Icons.close_outlined, 
//             color: cs.onSurface, 
//             size: 24.sp
//           ),
//           onPressed: () => Navigator.pop(context),
//         ),
//         title: Text(
//           Language.of(context, 'create_post'),
//           style: TextStyle(
//             fontSize: 18.sp,
//             fontWeight: FontWeight.w500,
//             color: cs.onSurface,
//           ),
//         ),
//         centerTitle: true,
//         actions: [
//           Container(
//             margin: EdgeInsets.only(right: 16.w, top: 10.h, bottom: 10.h),
//             child: ElevatedButton(
//               onPressed: controller.isSubmitting ? null : () => controller.submitPost(context),
//               style: ElevatedButton.styleFrom(
//                 backgroundColor: Colors.blue,
//                 foregroundColor: Colors.white,
//                 elevation: 0,
//                 padding: EdgeInsets.symmetric(horizontal: 20.w),
//                 shape: RoundedRectangleBorder(
//                   borderRadius: BorderRadius.circular(20.r),
//                 ),
//               ),
//               child: controller.isSubmitting
//                   ? SizedBox(
//                       width: 16.w,
//                       height: 16.h,
//                       child: CircularProgressIndicator(
//                         strokeWidth: 2,
//                         valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
//                       ),
//                     )
//                   : Text(
//                       Language.of(context, 'post'),
//                       style: TextStyle(
//                         fontSize: 15.sp,
//                         color: Colors.white,
//                       ),
//                     ),
//             ),
//           ),
//         ],
//       ),
//       body: SafeArea(
//         child: Column(
//           children: [
//             if (controller.errorMessage.isNotEmpty)
//               Container(
//                 width: double.infinity,
//                 color: cs.errorContainer,
//                 padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
//                 child: Text(
//                   controller.errorMessage,
//                   style: TextStyle(color: cs.onErrorContainer, fontSize: 13.sp),
//                 ),
//               ),
//             Expanded(
//               child: SingleChildScrollView(
//                 padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Text(
//                       'Quyền riêng tư:',
//                       style: TextStyle(
//                         fontSize: 13.sp,
//                         fontWeight: FontWeight.w500,
//                         color: cs.onSurfaceVariant,
//                       ),
//                     ),
//                     SizedBox(height: 5.h),
//                     Row(
//                       children: [
//                         ChoiceChip(
//                           label: Row(
//                             mainAxisSize: MainAxisSize.min,
//                             children: [
//                               Icon(Icons.public_outlined, size: 14.sp),
//                               SizedBox(width: 4.w),
//                               const Text('Công khai'),
//                             ],
//                           ),
//                           selected: controller.privacy == 'public',
//                           onSelected: (selected) {
//                             if (selected) controller.setPrivacy('public');
//                           },
//                           selectedColor: cs.secondaryContainer,
//                           labelStyle: TextStyle(
//                             color: controller.privacy == 'public' ? cs.onSecondaryContainer : cs.onSurface,
//                             fontSize: 12.sp,
//                           ),
//                         ),
//                         SizedBox(width: 8.w),
//                         ChoiceChip(
//                           label: Row(
//                             mainAxisSize: MainAxisSize.min,
//                             children: [
//                               Icon(Icons.people_alt_outlined, size: 14.sp),
//                               SizedBox(width: 4.w),
//                               const Text('Bạn bè'),
//                             ],
//                           ),
//                           selected: controller.privacy == 'friends',
//                           onSelected: (selected) {
//                             if (selected) controller.setPrivacy('friends');
//                           },
//                           selectedColor: cs.secondaryContainer,
//                           labelStyle: TextStyle(
//                             color: controller.privacy == 'friends' ? cs.onSecondaryContainer : cs.onSurface,
//                             fontSize: 12.sp,
//                           ),
//                         ),
//                         SizedBox(width: 8.w),
//                         ChoiceChip(
//                           label: Row(
//                             mainAxisSize: MainAxisSize.min,
//                             children: [
//                               Icon(Icons.lock_outlined, size: 14.sp),
//                               SizedBox(width: 4.w),
//                               const Text('Riêng tư'),
//                             ],
//                           ),
//                           selected: controller.privacy == 'private',
//                           onSelected: (selected) {
//                             if (selected) controller.setPrivacy('private');
//                           },
//                           selectedColor: cs.secondaryContainer,
//                           labelStyle: TextStyle(
//                             color: controller.privacy == 'private' ? cs.onSecondaryContainer : cs.onSurface,
//                             fontSize: 12.sp,
//                           ),
//                         ),
//                       ],
//                     ),
//                     SizedBox(height: 15.h),

//                     TextField(
//                       controller: controller.contentController,
//                       maxLines: null,
//                       minLines: 5,
//                       style: TextStyle(
//                         fontSize: 16.sp,
//                         color: cs.onSurface,
//                         height: 1.4,
//                       ),
//                       decoration: InputDecoration(
//                         hintText: 'Bạn đang nghĩ gì thế?',
//                         hintStyle: TextStyle(
//                           fontSize: 16.sp,
//                           color: Colors.grey.shade500,
//                         ),
//                         border: InputBorder.none,
//                       ),
//                     ),
//                     SizedBox(height: 15.h),

//                     if (controller.pickedImages.isNotEmpty) ...[
//                       Text(
//                         'Đã chọn ${controller.pickedImages.length} ảnh',
//                         style: TextStyle(
//                           fontSize: 13.sp,
//                           fontWeight: FontWeight.w500,
//                           color: cs.onSurfaceVariant,
//                         ),
//                       ),
//                       SizedBox(height: 10.h),
//                       SizedBox(
//                         height: 120.h,
//                         child: ListView.separated(
//                           scrollDirection: Axis.horizontal,
//                           itemCount: controller.pickedImages.length,
//                           separatorBuilder: (context, index) => SizedBox(width: 10.w),
//                           itemBuilder: (context, index) {
//                             final image = controller.pickedImages[index];
//                             return Stack(
//                               children: [
//                                 Container(
//                                   width: 120.w,
//                                   height: 120.h,
//                                   decoration: BoxDecoration(
//                                     borderRadius: BorderRadius.circular(12.r),
//                                     border: Border.all(color: cs.outlineVariant),
//                                     image: DecorationImage(
//                                       image: FileImage(File(image.path)),
//                                       fit: BoxFit.cover,
//                                     ),
//                                   ),
//                                 ),
//                                 Positioned(
//                                   top: 6.h,
//                                   right: 6.w,
//                                   child: GestureDetector(
//                                     onTap: () => controller.removeImage(index),
//                                     child: Container(
//                                       padding: EdgeInsets.all(4.w),
//                                       decoration: BoxDecoration(
//                                         color: Colors.black.withValues(alpha: 0.6),
//                                         shape: BoxShape.circle,
//                                       ),
//                                       child: Icon(
//                                         Icons.close_rounded,
//                                         size: 14.sp,
//                                         color: Colors.white,
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                               ],
//                             );
//                           },
//                         ),
//                       ),
//                       SizedBox(height: 20.h),
//                     ],
//                   ],
//                 ),
//               ),
//             ),

//             Container(
//               padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
//               decoration: BoxDecoration(
//                 border: Border(top: BorderSide(color: cs.outlineVariant, width: 0.5)),
//               ),
//               child: Row(
//                 children: [
//                   Text(
//                     'Thêm vào bài viết của bạn',
//                     style: TextStyle(
//                       fontSize: 15.sp,
//                       fontWeight: FontWeight.w500,
//                       color: cs.onSurfaceVariant,
//                     ),
//                   ),
//                   const Spacer(),
//                   IconButton(
//                     onPressed: controller.pickImages,
//                     icon: Icon(
//                       Icons.image_outlined,
//                       color: Colors.green,
//                       size: 25.sp,
//                     ),
//                     tooltip: 'Chọn ảnh từ thư viện',
//                   ),
//                 ],
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }


















// import 'dart:io';
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
// import 'package:flutter/foundation.dart' show kIsWeb;
// import 'package:socialnetwork/app/pages/post/content/user/user_controller.dart';
// import 'package:socialnetwork/app/theme/app_translation.dart';
// import 'package:socialnetwork/app/widgets/bottomsheet/post_friend.dart';
// import 'package:socialnetwork/app/pages/select/friend/friend_page.dart';
// import 'package:socialnetwork/app/widgets/image/image_preview.dart';
// class PostContentView extends StatefulWidget {
//   const PostContentView({super.key});

//   @override
//   State<PostContentView> createState() => _PostContentViewState();
// }

// class _PostContentViewState extends State<PostContentView> {
//   late PostContentController controller;

//   @override
//   void initState() {
//     super.initState();
//     controller = PostContentController();
//     controller.addListener(() => setState(() {}));
//   }

//   @override
//   void dispose() {
//     controller.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final brightness = Theme.of(context).brightness;
//     SystemChrome.setSystemUIOverlayStyle(
//       SystemUiOverlayStyle(
//         statusBarColor: Colors.transparent,
//         statusBarIconBrightness:
//             brightness == Brightness.dark ? Brightness.light : Brightness.dark,
//       ),
//     );
//     final cs = Theme.of(context).colorScheme;
//     return GestureDetector(
//       onTap: () => FocusScope.of(context).unfocus(),
//       behavior: HitTestBehavior.opaque,
//       child: Scaffold(
//         backgroundColor: cs.surface,
//         body: SafeArea(
//           child: Padding(
//             padding: EdgeInsets.symmetric(
//               vertical: 16.h,
//             ),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Expanded(
//                   child: SingleChildScrollView(
//                     child: Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         Padding(
//                           padding: EdgeInsets.symmetric(
//                             horizontal: kIsWeb ? 0 : 16.w,
//                           ),
//                           child: Column(
//                             crossAxisAlignment: CrossAxisAlignment.start,
//                             children: [
//                               Row(
//                                 children: [
//                                   SizedBox(width: 8.w),
//                                   GestureDetector(
//                                     onTap: () => Navigator.pop(context),
//                                     child: Icon(
//                                       Icons.arrow_back_ios_outlined,
//                                       size: 20.sp,
//                                       color: cs.onSurface,
//                                     ),
//                                   ),
//                                   SizedBox(width: 10.w),
//                                   Text(
//                                     Language.of(context, 'create_post'),
//                                     style: TextStyle(
//                                       fontSize: 20.sp,
//                                       fontWeight: FontWeight.w500,
//                                       color: cs.onSurface,
//                                     ),
//                                   ),
//                                 ],
//                               ),

//                               SizedBox(height: 20.h),

//                               Text(
//                                 Language.of(context, 'privacy'),
//                                 style: TextStyle(
//                                   fontSize: 15.sp,
//                                   fontWeight: FontWeight.w500,
//                                   color: cs.onSurface,
//                                 ),
//                               ),

//                               SizedBox(height: 15.h),

//                               Row(
//                                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                                 children: [
//                                   ChoiceChip(
//                                     label: Row(
//                                       mainAxisSize: MainAxisSize.min,
//                                       children: [
//                                         Icon(
//                                           Icons.public_outlined, 
//                                           size: 14.sp,
//                                           color: controller.privacy == 'public' ? Colors.white : cs.onSurface,
//                                         ),
//                                         SizedBox(width: 4.w),
//                                         Text(
//                                           Language.of(context, 'public'),
//                                           style: TextStyle(
//                                             color: controller.privacy == 'public' ? Colors.white : cs.onSurface,
//                                           ),
//                                         ),
//                                       ],
//                                     ),
//                                     selected: controller.privacy == 'public',
//                                     onSelected: (selected) {
//                                       if (selected) controller.setPrivacy('public');
//                                     },
//                                     selectedColor: Colors.blue,
//                                     checkmarkColor: Colors.white,
//                                     labelStyle: TextStyle(
//                                       color: controller.privacy == 'public' ? Colors.white : cs.onSurface,
//                                       fontSize: 12.sp,
//                                     ),
//                                   ),
//                                               ChoiceChip(
//                                     label: Row(
//                                       mainAxisSize: MainAxisSize.min,
//                                       children: [
//                                         Icon(
//                                           Icons.people_alt_outlined,
//                                           size: 14.sp,
//                                           color: (controller.privacy == 'friends' ||
//                                                   controller.privacy == 'friends_except' ||
//                                                   controller.privacy == 'specific_friends')
//                                               ? Colors.white
//                                               : cs.onSurface,
//                                         ),
//                                         SizedBox(width: 4.w),
//                                         Text(
//                                           Language.of(context, 'friend'),
//                                           style: TextStyle(
//                                             color: (controller.privacy == 'friends' ||
//                                                     controller.privacy == 'friends_except' ||
//                                                     controller.privacy == 'specific_friends')
//                                                 ? Colors.white
//                                                 : cs.onSurface,
//                                           ),
//                                         ),
//                                       ],
//                                     ),
//                                     selected: controller.privacy == 'friends' ||
//                                         controller.privacy == 'friends_except' ||
//                                         controller.privacy == 'specific_friends',
//                                     onSelected: (_) async {
//                                       controller.setPrivacy('friends');
                                      
//                                       final result = await showModalBottomSheet<Map<String, dynamic>>(
//                                         context: context,
//                                         isScrollControlled: true,
//                                         backgroundColor: Colors.transparent,
//                                         builder: (context) => const PostFriendBottomSheet(),
//                                       );
//                                       if (result != null) {
//                                         if (result['privacy'] == 'friends') {
//                                           controller.setPrivacy('friends');
//                                         } else if (result['action'] == 'open_friends_except') {
//                                           if (!context.mounted) return;
//                                           final List<Map<String, dynamic>>? selectedFriends = await Navigator.push<List<Map<String, dynamic>>>(
//                                             context,
//                                             MaterialPageRoute(
//                                               builder: (_) => SelectFriendPage(
//                                                 title: Language.of(context, 'friends_except'),
//                                                 initialSelectedIds: controller.selectedFriends
//                                                     .map((f) => (f['id'] ?? f['_id']).toString())
//                                                     .toList(),
//                                               ),
//                                             ),
//                                           );
//                                           if (selectedFriends != null) {
//                                             controller.setPrivacyWithFriends('friends_except', selectedFriends);
//                                           } else {
//                                             controller.setPrivacy('friends');
//                                           }
//                                         } else if (result['action'] == 'open_specific_friends') {
//                                           if (!context.mounted) return;
//                                           final List<Map<String, dynamic>>? selectedFriends = await Navigator.push<List<Map<String, dynamic>>>(
//                                             context,
//                                             MaterialPageRoute(
//                                               builder: (_) => SelectFriendPage(
//                                                 title: Language.of(context, 'specific_friends'),
//                                                 initialSelectedIds: controller.selectedFriends
//                                                     .map((f) => (f['id'] ?? f['_id']).toString())
//                                                     .toList(),
//                                               ),
//                                             ),
//                                           );
//                                           if (selectedFriends != null) {
//                                             controller.setPrivacyWithFriends('specific_friends', selectedFriends);
//                                           } else {
//                                             controller.setPrivacy('friends');
//                                           }
//                                         }
//                                       } else {
//                                         controller.setPrivacy('friends');
//                                       }
//                                     },
//                                     selectedColor: Colors.blue,
//                                     checkmarkColor: Colors.white,
//                                     labelStyle: TextStyle(
//                                       color: (controller.privacy == 'friends' ||
//                                               controller.privacy == 'friends_except' ||
//                                               controller.privacy == 'specific_friends')
//                                           ? Colors.white
//                                           : cs.onSurface,
//                                       fontSize: 12.sp,
//                                     ),
//                                   ),
//                                   //SizedBox(width: 5.w),
//                                   ChoiceChip(
//                                     label: Row(
//                                       mainAxisSize: MainAxisSize.min,
//                                       children: [
//                                         Icon(
//                                           Icons.lock_outlined, 
//                                           size: 14.sp,
//                                           color: controller.privacy == 'private' ? Colors.white : cs.onSurface,
//                                         ),
//                                         SizedBox(width: 4.w),
//                                         Text(
//                                           Language.of(context, 'private'),
//                                           style: TextStyle(
//                                             color: controller.privacy == 'private' ? Colors.white : cs.onSurface,
//                                           ),
//                                         ),
//                                       ],
//                                     ),
//                                     selected: controller.privacy == 'private',
//                                     onSelected: (selected) {
//                                       if (selected) controller.setPrivacy('private');
//                                     },
//                                     selectedColor: Colors.blue,
//                                     checkmarkColor: Colors.white,
//                                     labelStyle: TextStyle(
//                                       color: controller.privacy == 'private' ? Colors.white : cs.onSurface,
//                                       fontSize: 12.sp,
//                                     ),
//                                   ),
//                                 ],
//                               ),

//                         if ((controller.privacy == 'friends_except' ||
//                                 controller.privacy == 'specific_friends') &&
//                             controller.selectedFriends.isNotEmpty) ...[
//                           SizedBox(height: 16.h),
//                           Text(
//                             controller.privacy == 'friends_except'
//                                 ? Language.of(context, 'friends_except')
//                                 : Language.of(context, 'specific_friends'),
//                             style: TextStyle(
//                               fontSize: 13.sp,
//                               fontWeight: FontWeight.w500,
//                               color: cs.onSurface,
//                             ),
//                           ),
//                           SizedBox(height: 8.h),
//                           SizedBox(
//                             height: 75.h,
//                             child: ListView.separated(
//                               scrollDirection: Axis.horizontal,
//                               itemCount: controller.selectedFriends.length + 1,
//                               separatorBuilder: (_, _) => SizedBox(width: 12.w),
//                               itemBuilder: (context, index) {
//                                 if (index == controller.selectedFriends.length) {
//                                   return GestureDetector(
//                                     onTap: () async {
//                                       final previousPrivacy = controller.privacy;
//                                       final previousSelectedFriends = List<Map<String, dynamic>>.from(controller.selectedFriends);
                                      
//                                       final List<Map<String, dynamic>>? selectedFriends = await Navigator.push<List<Map<String, dynamic>>>(
//                                         context,
//                                         MaterialPageRoute(
//                                           builder: (_) => SelectFriendPage(
//                                             title: Language.of(context, previousPrivacy),
//                                             initialSelectedIds: previousSelectedFriends
//                                                 .map((f) => (f['id'] ?? f['_id']).toString())
//                                                 .toList(),
//                                           ),
//                                         ),
//                                       );
//                                       if (selectedFriends != null) {
//                                         controller.setPrivacyWithFriends(previousPrivacy, selectedFriends);
//                                       }
//                                     },
//                                     child: CircleAvatar(
//                                       radius: 22.r,
//                                       backgroundColor: cs.surfaceContainerHighest,
//                                       child: Icon(
//                                         Icons.add_outlined, 
//                                         color: cs.onSurface,
//                                         size: 20.sp
//                                       ),
//                                     ),
//                                   );
//                                 }

//                                 final friend = controller.selectedFriends[index];
//                                 final String friendId = (friend['id'] ?? friend['_id']).toString();
//                                 return SizedBox(
//                                   width: 60.w,
//                                   child: Stack(
//                                     clipBehavior: Clip.none,
//                                     alignment: Alignment.center,
//                                     children: [
//                                       Column(
//                                         mainAxisSize: MainAxisSize.min,
//                                         children: [
//                                           CircleAvatar(
//                                             radius: 20.r,
//                                             backgroundColor: cs.primaryContainer,
//                                             backgroundImage: friend['avatar'] != null &&
//                                                     friend['avatar'].toString().isNotEmpty
//                                                 ? NetworkImage(friend['avatar'])
//                                                 : null,
//                                             child: (friend['avatar'] == null ||
//                                                     friend['avatar'].toString().isEmpty)
//                                                 ? Text(
//                                                     friend['name']!
//                                                         .substring(0, 1)
//                                                         .toUpperCase(),
//                                                     style: TextStyle(
//                                                       color: cs.onPrimaryContainer,
//                                                       fontWeight: FontWeight.bold,
//                                                       fontSize: 14.sp,
//                                                     ),
//                                                   )
//                                                 : null,
//                                           ),
//                                           SizedBox(height: 4.h),
//                                           Text(
//                                             friend['name']!,
//                                             style: TextStyle(
//                                               fontSize: 10.sp,
//                                               color: cs.onSurface,
//                                             ),
//                                             maxLines: 1,
//                                             overflow: TextOverflow.ellipsis,
//                                             textAlign: TextAlign.center,
//                                           ),
//                                         ],
//                                       ),
//                                       // Close (x) badge
//                                       Positioned(
//                                         top: -2.h,
//                                         right: 4.w,
//                                         child: GestureDetector(
//                                           onTap: () {
//                                             final updatedList = List<Map<String, dynamic>>.from(controller.selectedFriends);
//                                             updatedList.removeWhere((f) => (f['id'] ?? f['_id']).toString() == friendId);
//                                             if (updatedList.isEmpty) {
//                                               controller.setPrivacy('friends');
//                                             } else {
//                                               controller.setPrivacyWithFriends(controller.privacy, updatedList);
//                                             }
//                                           },
//                                           child: Container(
//                                             padding: EdgeInsets.all(2.w),
//                                             decoration: BoxDecoration(
//                                               color: cs.surfaceContainerHighest,
//                                               shape: BoxShape.circle,
//                                               border: Border.all(
//                                                 color: cs.surface,
//                                                 width: 1.5,
//                                               ),
//                                             ),
//                                             child: Icon(
//                                               Icons.close_outlined,
//                                               size: 10.sp,
//                                               color: cs.onSurfaceVariant,
//                                             ),
//                                           ),
//                                         ),
//                                       ),
//                                     ],
//                                   ),
//                                 );
//                               },
//                             ),
//                           ),
//                         ],

//                         SizedBox(height: 20.h),

//                         TextField(
//                           controller: controller.contentController,
//                           maxLines: null,
//                           minLines: 5,
//                           style: TextStyle(
//                             fontSize: 16.sp,
//                             color: cs.onSurface,
//                             height: 1.4,
//                           ),
//                           decoration: InputDecoration(
//                             hintText: Language.of(context, 'what_s_on_your_mind'),
//                             hintStyle: TextStyle(
//                               fontSize: 16.sp,
//                               color: Colors.grey.shade500,
//                             ),
//                             border: InputBorder.none,
//                           ),
//                         ),
//                       ],
//                     ),
//                   ),

//                   if (controller.pickedImages.isNotEmpty) ...[
//                     SizedBox(height: 16.h),
//                     SizedBox(
//                       height: 90.h,
//                       child: ListView.separated(
//                         scrollDirection: Axis.horizontal,
//                         padding: EdgeInsets.only(
//                           left: 16.w,
//                           right: 16.w,
//                           top: 6.h,
//                         ),
//                         itemCount: controller.pickedImages.length + 1,
//                         separatorBuilder: (_, _) => SizedBox(width: 12.w),
//                         itemBuilder: (context, index) {
//                           if (index == controller.pickedImages.length) {
//                             return GestureDetector(
//                               onTap: () => controller.pickImages(),
//                               child: Container(
//                                 width: 80.h,
//                                 height: 80.h,
//                                 decoration: BoxDecoration(
//                                   color: cs.surfaceContainerHighest,
//                                   borderRadius: BorderRadius.circular(12.r),
//                                   border: Border.all(
//                                     color: cs.outlineVariant.withValues(alpha: 0.5),
//                                     width: 1,
//                                   ),
//                                 ),
//                                 child: Icon(
//                                   Icons.add_a_photo_outlined,
//                                   color: cs.onSurfaceVariant,
//                                   size: 24.sp,
//                                 ),
//                               ),
//                             );
//                           }

//                           final imageFile = controller.pickedImages[index];
//                           return Stack(
//                             clipBehavior: Clip.none,
//                             children: [
//                               // Image
//                               GestureDetector(
//                                 onTap: () {
//                                   Navigator.push(
//                                     context,
//                                     MaterialPageRoute(
//                                       builder: (context) => ImagePreviewScreen(
//                                         images: controller.pickedImages,
//                                         initialIndex: index,
//                                       ),
//                                     ),
//                                   );
//                                 },
//                                 child: ClipRRect(
//                                   borderRadius: BorderRadius.circular(12.r),
//                                   child: SizedBox(
//                                     width: 80.h,
//                                     height: 80.h,
//                                     child: kIsWeb
//                                         ? Image.network(
//                                             imageFile.path,
//                                             fit: BoxFit.cover,
//                                           )
//                                         : Image.file(
//                                             File(imageFile.path),
//                                             fit: BoxFit.cover,
//                                           ),
//                                   ),
//                                 ),
//                               ),
//                               // Remove button
//                               Positioned(
//                                 top: -4.h,
//                                 right: -4.w,
//                                 child: GestureDetector(
//                                   onTap: () => controller.removeImage(index),
//                                   child: Container(
//                                     padding: EdgeInsets.all(3.w),
//                                     decoration: BoxDecoration(
//                                       color: Colors.black.withValues(alpha: 0.6),
//                                       shape: BoxShape.circle,
//                                       border: Border.all(
//                                         color: Colors.white,
//                                         width: 1.5,
//                                       ),
//                                     ),
//                                     child: Icon(
//                                       Icons.close_outlined,
//                                       size: 12.sp,
//                                       color: Colors.white,
//                                     ),
//                                   ),
//                                 ),
//                               ),
//                             ],
//                           );
//                         },
//                       ),
//                     ),
//                   ],
//                       ],
//                     ),
//                   ),
//                 ),
                
//                 SizedBox(height: 10.h),

//                 Container(
//                   padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
//                   decoration: BoxDecoration(
//                     border: Border(top: BorderSide(color: cs.outlineVariant, width: 0.5)),
//                   ),
//                   child: GestureDetector(
//                     onTap: () => controller.pickImages(),
//                     child: Row(
//                       children: [
//                         Text(
//                         Language.of(context, 'choose_photos_from_the_album'),
//                           style: TextStyle(
//                             fontSize: 15.sp,
//                             fontWeight: FontWeight.w500,
//                             color: cs.onSurface,
//                           ),
//                         ),
//                         const Spacer(),
//                         Icon(
//                           Icons.image_outlined,
//                           size: 25.sp,
//                           color: Colors.green,
//                         ),
//                       ],
//                     ),
//                   ),
//                 ),
//                 SizedBox(height: 10.h),
                
//               ], 
//             ),
//           ),
//         ),
//       ),
//     );
//   }
// }

























import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:socialnetwork/app/pages/post/content/user/user_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/widgets/bottomsheet/post_friend.dart';
import 'package:socialnetwork/app/pages/select/friend/friend_page.dart';
import 'package:socialnetwork/app/widgets/image/image_preview.dart';
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
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
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
                      Text(
                        Language.of(context, 'create_post'),
                        style: TextStyle(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  Text(
                    Language.of(context, 'privacy'),
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(height: 10.h),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ChoiceChip(
                        label: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.public_outlined, 
                              size: 14.sp,
                              color: controller.privacy == 'public' ? Colors.white : cs.onSurface,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              Language.of(context, 'public'),
                              style: TextStyle(
                                color: controller.privacy == 'public' ? Colors.white : cs.onSurface,
                              ),
                            ),
                          ],
                        ),
                        selected: controller.privacy == 'public',
                        onSelected: (selected) {
                          if (selected) controller.setPrivacy('public');
                        },
                        selectedColor: Colors.blue,
                        checkmarkColor: Colors.white,
                        labelStyle: TextStyle(
                          color: controller.privacy == 'public' ? Colors.white : cs.onSurface,
                          fontSize: 12.sp,
                        ),
                      ),
                      ChoiceChip(
                        label: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.people_alt_outlined,
                              size: 14.sp,
                              color: (controller.privacy == 'friends' ||
                                      controller.privacy == 'friends_except' ||
                                      controller.privacy == 'specific_friends')
                                  ? Colors.white
                                  : cs.onSurface,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              Language.of(context, 'friend'),
                              style: TextStyle(
                                color: (controller.privacy == 'friends' ||
                                        controller.privacy == 'friends_except' ||
                                        controller.privacy == 'specific_friends')
                                    ? Colors.white
                                    : cs.onSurface,
                              ),
                            ),
                          ],
                        ),
                        selected: controller.privacy == 'friends' ||
                            controller.privacy == 'friends_except' ||
                            controller.privacy == 'specific_friends',
                        onSelected: (_) async {
                          controller.setPrivacy('friends');
                          
                          final result = await showModalBottomSheet<Map<String, dynamic>>(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => const PostFriendBottomSheet(),
                          );
                          if (result != null) {
                            if (result['privacy'] == 'friends') {
                              controller.setPrivacy('friends');
                            } else if (result['action'] == 'open_friends_except') {
                              if (!context.mounted) return;
                              final List<Map<String, dynamic>>? selectedFriends = await Navigator.push<List<Map<String, dynamic>>>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => SelectFriendPage(
                                    title: Language.of(context, 'friends_except'),
                                    initialSelectedIds: controller.selectedFriends
                                        .map((f) => (f['id'] ?? f['_id']).toString())
                                        .toList(),
                                  ),
                                ),
                              );
                              if (selectedFriends != null) {
                                controller.setPrivacyWithFriends('friends_except', selectedFriends);
                              } else {
                                controller.setPrivacy('friends');
                              }
                            } else if (result['action'] == 'open_specific_friends') {
                              if (!context.mounted) return;
                              final List<Map<String, dynamic>>? selectedFriends = await Navigator.push<List<Map<String, dynamic>>>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => SelectFriendPage(
                                    title: Language.of(context, 'specific_friends'),
                                    initialSelectedIds: controller.selectedFriends
                                        .map((f) => (f['id'] ?? f['_id']).toString())
                                        .toList(),
                                  ),
                                ),
                              );
                              if (selectedFriends != null) {
                                controller.setPrivacyWithFriends('specific_friends', selectedFriends);
                              } else {
                                controller.setPrivacy('friends');
                              }
                            }
                          } else {
                            controller.setPrivacy('friends');
                          }
                        },
                        selectedColor: Colors.blue,
                        checkmarkColor: Colors.white,
                        labelStyle: TextStyle(
                          color: (controller.privacy == 'friends' ||
                                  controller.privacy == 'friends_except' ||
                                  controller.privacy == 'specific_friends')
                              ? Colors.white
                              : cs.onSurface,
                          fontSize: 12.sp,
                        ),
                      ),
                      //SizedBox(width: 5.w),
                      ChoiceChip(
                        label: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.lock_outlined, 
                              size: 14.sp,
                              color: controller.privacy == 'private' ? Colors.white : cs.onSurface,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              Language.of(context, 'private'),
                              style: TextStyle(
                                color: controller.privacy == 'private' ? Colors.white : cs.onSurface,
                              ),
                            ),
                          ],
                        ),
                        selected: controller.privacy == 'private',
                        onSelected: (selected) {
                          if (selected) controller.setPrivacy('private');
                        },
                        selectedColor: Colors.blue,
                        checkmarkColor: Colors.white,
                        labelStyle: TextStyle(
                          color: controller.privacy == 'private' ? Colors.white : cs.onSurface,
                          fontSize: 12.sp,
                        ),
                      ),
                    ],
                  ),

                  if ((controller.privacy == 'friends_except' ||
                      controller.privacy == 'specific_friends') &&
                      controller.selectedFriends.isNotEmpty) ...[
                    SizedBox(height: 16.h),
                    Text(
                      controller.privacy == 'friends_except'
                          ? Language.of(context, 'friends_except')
                          : Language.of(context, 'specific_friends'),
                      style: TextStyle(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    SizedBox(
                      height: 75.h,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: controller.selectedFriends.length + 1,
                        separatorBuilder: (_, _) => SizedBox(width: 12.w),
                        itemBuilder: (context, index) {
                          if (index == controller.selectedFriends.length) {
                            return GestureDetector(
                              onTap: () async {
                                final previousPrivacy = controller.privacy;
                                final previousSelectedFriends = List<Map<String, dynamic>>.from(controller.selectedFriends);
                                
                                final List<Map<String, dynamic>>? selectedFriends = await Navigator.push<List<Map<String, dynamic>>>(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => SelectFriendPage(
                                      title: Language.of(context, previousPrivacy),
                                      initialSelectedIds: previousSelectedFriends
                                          .map((f) => (f['id'] ?? f['_id']).toString())
                                          .toList(),
                                    ),
                                  ),
                                );
                                if (selectedFriends != null) {
                                  controller.setPrivacyWithFriends(previousPrivacy, selectedFriends);
                                }
                              },
                              child: CircleAvatar(
                                radius: 22.r,
                                backgroundColor: cs.surfaceContainerHighest,
                                child: Icon(
                                  Icons.add_outlined, 
                                  color: cs.onSurface,
                                  size: 20.sp
                                ),
                              ),
                            );
                          }

                          final friend = controller.selectedFriends[index];
                          final String friendId = (friend['id'] ?? friend['_id']).toString();
                          return SizedBox(
                            width: 60.w,
                            child: Stack(
                              clipBehavior: Clip.none,
                              alignment: Alignment.center,
                              children: [
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    CircleAvatar(
                                      radius: 20.r,
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
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14.sp,
                                              ),
                                            )
                                          : null,
                                    ),
                                    SizedBox(height: 4.h),
                                    Text(
                                      friend['name']!,
                                      style: TextStyle(
                                        fontSize: 10.sp,
                                        color: cs.onSurface,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),

                                Positioned(
                                  top: -2.h,
                                  right: 4.w,
                                  child: GestureDetector(
                                    onTap: () {
                                      final updatedList = List<Map<String, dynamic>>.from(controller.selectedFriends);
                                      updatedList.removeWhere((f) => (f['id'] ?? f['_id']).toString() == friendId);
                                      if (updatedList.isEmpty) {
                                        controller.setPrivacy('friends');
                                      } else {
                                        controller.setPrivacyWithFriends(controller.privacy, updatedList);
                                      }
                                    },
                                    child: Container(
                                      padding: EdgeInsets.all(2.w),
                                      decoration: BoxDecoration(
                                        color: cs.surfaceContainerHighest,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: cs.surface,
                                          width: 1.5,
                                        ),
                                      ),
                                      child: Icon(
                                        Icons.close_outlined,
                                        size: 10.sp,
                                        color: cs.onSurface,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],

                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          //SizedBox(height: 20.h),

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
                              hintText: Language.of(context, 'what_s_on_your_mind'),
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
                              // Image
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

