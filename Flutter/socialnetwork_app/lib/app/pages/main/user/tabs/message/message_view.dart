import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/message_controller.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/chat/user/user_page.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/chat/group/group_page.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class MessageUserView extends StatefulWidget {
  const MessageUserView({super.key});
  @override
  State<MessageUserView> createState() => _MessageUserViewState();
}

class _MessageUserViewState extends State<MessageUserView> {
  late MessageController controller;

  @override
  void initState() {
    super.initState();
    controller = MessageController();
    controller.addListener(_onControllerUpdate);
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    controller.removeListener(_onControllerUpdate);
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: brightness == Brightness.dark
            ? Brightness.light
            : Brightness.dark,
      ),
    );
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: controller.refresh,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: kIsWeb ? 0 : 24.w,
                vertical: 16.h,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(cs),
                  SizedBox(height: 20.h),
                  _buildSearchBar(cs),
                  SizedBox(height: 20.h),
                  if (controller.onlineFriends.isNotEmpty) ...[
                    _buildOnlineFriendsList(cs),
                    SizedBox(height: 20.h),
                  ],
                  _buildConversationsList(cs),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(ColorScheme cs) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          Language.of(context, 'message'),
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.w500,
            color: cs.onSurface,
          ),
        ),
      ],
    );
  }

  Widget _buildSearchBar(ColorScheme cs) {
    return Container(
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: cs.shadow.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search messages...',
          hintStyle: TextStyle(color: cs.onSurfaceVariant.withValues(alpha: 0.7)),
          prefixIcon: Icon(Icons.search_outlined, color: cs.onSurfaceVariant),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        ),
      ),
    );
  }

  Widget _buildOnlineFriendsList(ColorScheme cs) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Online Friends',
          style: TextStyle(
            fontSize: 15.sp,
            fontWeight: FontWeight.w500,
            color: cs.onSurfaceVariant,
          ),
        ),
        SizedBox(height: 16.h),
        SizedBox(
          height: 110.h,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: controller.onlineFriends.length,
            separatorBuilder: (context, index) => SizedBox(width: 16.w),
            itemBuilder: (context, index) {
              final friend = controller.onlineFriends[index];
              final name = friend['username'] ?? friend['name'] ?? 'User';
              final avatar = friend['avatar'] ?? '';

              return GestureDetector(
                onTap: () => _navigateToChat(friend),
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 30.r,
                          backgroundColor: cs.primaryContainer,
                          backgroundImage: avatar.isNotEmpty
                              ? NetworkImage(avatar)
                              : null,
                          child: avatar.isEmpty
                              ? Text(
                                  name.substring(0, 1).toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 22.sp,
                                    fontWeight: FontWeight.w500,
                                    color: cs.onPrimaryContainer,
                                  ),
                                )
                              : null,
                        ),
                        Positioned(
                          right: 2.w,
                          bottom: 2.w,
                          child: Container(
                            width: 14.w,
                            height: 14.w,
                            decoration: BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                              border: Border.all(color: cs.surface, width: 2),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    SizedBox(
                      width: 70.w,
                      child: Text(
                        name,
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: cs.onSurface,
                          fontWeight: FontWeight.w500,
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
    );
  }

  Widget _buildConversationsList(ColorScheme cs) {
    if (controller.isLoading && controller.conversations.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (controller.conversations.isEmpty) {
      return Center(
        child: Column(
          children: [
            SizedBox(height: 40.h),
            Icon(
              Icons.chat_bubble_outline_rounded,
              size: 65.sp,
              color: cs.outline,
            ),

            SizedBox(height: 15.h),

            Text(
              'No conversations yet',
              style: TextStyle(color: cs.onSurfaceVariant, fontSize: 15.sp),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Chats',
          style: TextStyle(
            fontSize: 15.sp,
            fontWeight: FontWeight.w500,
            color: cs.onSurfaceVariant,
          ),
        ),

        SizedBox(height: 15.h),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: controller.conversations.length,
          separatorBuilder: (context, index) => SizedBox(height: 12.h),
          itemBuilder: (context, index) {
            final conv = controller.conversations[index];
            final lastMsg = conv['lastMessage'];
            final members = conv['members'] as List? ?? [];
            final otherMember = members.firstWhere(
              (m) => m['_id'] != controller.currentUserId,
              orElse: () => {},
            );

            final name = conv['isGroup'] == true
                ? (conv['name'] ?? 'Group Chat')
                : (otherMember['username'] ?? otherMember['name'] ?? 'User');

            final avatar = conv['isGroup'] == true
                ? (conv['avatar'] ?? '')
                : (otherMember['avatar'] ?? '');

            final isOnline = otherMember['isOnline'] == true;

            String lastText = '';
            String displayTime = '';

            if (lastMsg != null) {
              lastText = lastMsg['content'] ?? '';
              if (lastMsg['sender']['_id'] == controller.currentUserId) {
                lastText = 'You: $lastText';
              }
              displayTime = controller.getDisplayTime(
                lastMsg['createdAt'] ?? conv['updatedAt'],
              );
            }

            return InkWell(
              onTap: () {
                if (conv['isGroup'] == true) {
                  _navigateToGroupChat(
                    conversationId: conv['_id'] ?? '',
                    name: conv['name'] ?? 'Group Chat',
                    avatar: conv['avatar'] ?? '',
                  );
                } else {
                  _navigateToChat(otherMember, conversationId: conv['_id']);
                }
              },
              borderRadius: BorderRadius.circular(20.r),
              child: Container(
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(20.r),
                  border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 25.r,
                          backgroundColor: cs.primaryContainer,
                          backgroundImage: avatar.isNotEmpty
                              ? NetworkImage(avatar)
                              : null,
                          child: avatar.isEmpty
                              ? Text(
                                  name.substring(0, 1).toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 20.sp,
                                    fontWeight: FontWeight.w500,
                                    color: cs.onPrimaryContainer,
                                  ),
                                )
                              : null,
                        ),
                        if (isOnline)
                          Positioned(
                            right: 0,
                            bottom: 0,
                            child: Container(
                              width: 12.w,
                              height: 12.w,
                              decoration: BoxDecoration(
                                color: Colors.green,
                                shape: BoxShape.circle,
                                border: Border.all(color: cs.surface, width: 2),
                              ),
                            ),
                          ),
                      ],
                    ),

                    SizedBox(width: 15.w),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                name,
                                style: TextStyle(
                                  fontSize: 15.sp,
                                  fontWeight: FontWeight.w500,
                                  color: cs.onSurface,
                                ),
                              ),
                              Text(
                                displayTime,
                                style: TextStyle(
                                  fontSize: 11.sp,
                                  color: cs.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            lastText.isNotEmpty ? lastText : 'No messages yet',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 13.sp,
                              color: cs.onSurfaceVariant,
                              fontWeight:
                                  lastMsg != null &&
                                      lastMsg['readBy'] != null &&
                                      !(lastMsg['readBy'] as List).contains(
                                        controller.currentUserId,
                                      )
                                  ? FontWeight.w500
                                  : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  void _navigateToChat(Map<String, dynamic> user, {String? conversationId}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => ChatUserPage(
          receiverId: user['_id'] ?? '',
          receiverName: user['username'] ?? user['name'] ?? 'User',
          receiverAvatar: user['avatar'] ?? '',
          isFriend:
              true,
        ),
      ),
    ).then((_) => controller.refresh());
  }

  void _navigateToGroupChat({
    required String conversationId,
    required String name,
    required String avatar,
  }) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => ChatGroupPage(
          conversationId: conversationId,
          groupName: name,
          groupAvatar: avatar,
        ),
      ),
    ).then((_) => controller.refresh());
  }
  
}
