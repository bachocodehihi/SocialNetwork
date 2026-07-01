import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/contact/friend/friend_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/data/repositories/contact_repository_imp.dart';
import 'package:socialnetwork/data/network/api/contact_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/chat/user/user_page.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';
import 'package:socialnetwork/domain/usecases/contact_usecase.dart';
class ContactFriendView extends StatefulWidget {
  const ContactFriendView({super.key});
  @override
  State<ContactFriendView> createState() => _ContactFriendViewState();
}

class _ContactFriendViewState extends State<ContactFriendView> {
  late final ContactFriendController _controller;

  @override
  void initState() {
    super.initState();

    final repository = ContactRepositoryImp(ContactApi(DioClient.createDio()));
    final usecase = ContactUsecase(repository);
    _controller = ContactFriendController(usecase);
    
    _controller.fetchFriends();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, child) {
        if (_controller.isLoading) return Center(child: CircularProgressIndicator());
        if (_controller.error != null) return Center(child: Text('Lỗi: ${_controller.error}'));
        
        final friends = _controller.friends;
        if (friends.isEmpty) return Center(child: Text('No friends found'));
        
        return ListView.separated(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
          itemCount: friends.length,
          separatorBuilder: (_, _) => SizedBox(height: 12.h),
          itemBuilder: (context, index) {
            final friend = friends[index];

            return InkWell(
              onTap: () async {
                await Future.delayed(const Duration(milliseconds: 100));
                if (!context.mounted) return;
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => UserPage(userData: friend),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(12.r),
              child: Container(
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 25.r,
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                      backgroundImage: friend['avatar'] != null && friend['avatar'].toString().isNotEmpty
                        ? NetworkImage(friend['avatar']) 
                        : null,
                      child: (friend['avatar'] == null || friend['avatar'].toString().isEmpty)
                        ? Text(
                            friend['name']!.substring(0, 1).toUpperCase(),
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onPrimaryContainer,
                              fontWeight: FontWeight.w500,
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
                            friend['name']!,
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            friend['status'] ?? 'Active',
                            style: TextStyle(
                              fontSize: 11.sp,
                              color: Theme.of(context).colorScheme.onSurfaceVariant.withValues(alpha: 0.65),
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ChatUserPage(
                              receiverId: friend['id'] ?? friend['_id'],
                              receiverName: friend['name'],
                              receiverAvatar: friend['avatar'] ?? '',
                              isFriend: true,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(horizontal: 16.w),
                        // shape: RoundedRectangleBorder(
                        //   borderRadius: BorderRadius.circular(12.r),
                        // ),
                        shape: const StadiumBorder(),
                      ).copyWith(
                        overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                      ),
                      child: Text(
                        Language.of(context, 'message'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
