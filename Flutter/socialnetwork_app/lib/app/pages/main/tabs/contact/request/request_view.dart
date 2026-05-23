
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/tabs/contact/request/request_controller.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';

class ContactRequestView extends StatefulWidget {
  const ContactRequestView({super.key});

  @override
  State<ContactRequestView> createState() => _ContactRequestViewState();
}

class _ContactRequestViewState extends State<ContactRequestView> {
  late final ContactRequestController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ContactRequestController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        if (_controller.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (_controller.requests.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.person_off_outlined,
                    size: 48.sp, color: cs.onSurfaceVariant),
                SizedBox(height: 12.h),
                Text('No friend requests',
                    style: TextStyle(
                        color: cs.onSurfaceVariant, fontSize: 14.sp)),
              ],
            ),
          );
        }

        return ListView.separated(
          itemCount: _controller.requests.length,
          separatorBuilder: (_, __) => SizedBox(height: 10.h),
          itemBuilder: (context, index) {
            final request = _controller.requests[index];
            final requestId = request['_id'] as String;
            final sender = request['sender'] as Map<String, dynamic>? ?? {};
            final name = sender['full_name'] as String? ?? sender['username'] as String? ?? 'Unknown';
            final avatarUrl = sender['avatar'] as String? ?? '';
            final createdAt = request['createdAt'] as String? ?? '';
            return Container(
              padding: EdgeInsets.all(10.w),
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12.r),
                boxShadow: [
                  BoxShadow(
                    color: cs.shadow.withValues(alpha: 0.06),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => UserPage(userData: sender),
                        ),
                      );
                    },
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24.r,
                          backgroundColor: cs.primaryContainer,
                          backgroundImage: avatarUrl.isNotEmpty
                              ? NetworkImage(avatarUrl)
                              : null,
                          child: avatarUrl.isEmpty
                              ? Text(
                                  name.substring(0, 1).toUpperCase(),
                                  style: TextStyle(color: cs.onPrimaryContainer),
                                )
                              : null,
                        ),
                        SizedBox(width: 10.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: TextStyle(
                                  fontSize: 15.sp,
                                  fontWeight: FontWeight.bold,
                                  color: cs.onSurface,
                                ),
                              ),
                              if (createdAt.isNotEmpty)
                                Text(
                                  _controller.getTimeAgo(createdAt),
                                  style: TextStyle(
                                    fontSize: 13.sp,
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_ios_rounded, size: 14.sp, color: cs.onSurfaceVariant.withOpacity(0.5)),
                      ],
                    ),
                  ),
                  SizedBox(height: 10.h),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _controller.acceptRequest(requestId),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                          ).copyWith(
                            overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                          ),
                          child: const Text('Confirm'),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _controller.rejectRequest(requestId),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey,
                            foregroundColor: Colors.white,
                          ).copyWith(
                            overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                          ),
                          child: const Text('Reject'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
