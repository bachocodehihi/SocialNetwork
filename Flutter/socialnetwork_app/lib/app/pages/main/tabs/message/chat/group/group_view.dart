import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import 'package:socialnetwork/app/pages/main/tabs/message/chat/group/group_controller.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class ChatGroupView extends StatefulWidget {
  final String conversationId;
  final String groupName;
  final String? groupAvatar;
  final bool isGroup;

  const ChatGroupView({
    super.key,
    required this.conversationId,
    required this.groupName,
    this.groupAvatar,
    this.isGroup = true,
  });

  @override
  State<ChatGroupView> createState() => _ChatGroupViewState();
}

class _ChatGroupViewState extends State<ChatGroupView> {
  late final ChatGroupController _controller;
  final ScrollController _scrollController = ScrollController();
  bool _showScrollButton = false;

  @override
  void initState() {
    super.initState();
    _controller = ChatGroupController();
    _controller.init(widget.conversationId);
    _controller.addListener(_onControllerChanged);
    _scrollController.addListener(_onScroll);
  }

  void _onControllerChanged() {
    if (_scrollController.hasClients && 
        _scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 100) {
      _scrollToBottom();
    }
    setState(() {});
  }

  void _onScroll() {
    final show = _scrollController.hasClients && 
                 _scrollController.offset > 200;
    if (show != _showScrollButton) {
      setState(() => _showScrollButton = show);
    }
    
    if (_scrollController.position.pixels <= 0 && 
        !_controller.isLoading) {
      _controller.fetchOlderMessages();
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _controller.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        elevation: 0.5,
        scrolledUnderElevation: 2,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_outlined, size: 20, color: cs.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            // Group avatar
            CircleAvatar(
              radius: 18.r,
              backgroundImage: widget.groupAvatar != null && widget.groupAvatar!.isNotEmpty
                  ? NetworkImage(widget.groupAvatar!)
                  : null,
              backgroundColor: cs.primaryContainer,
              child: (widget.groupAvatar == null || widget.groupAvatar!.isEmpty)
                  ? Text(
                      widget.groupName.substring(0, 1).toUpperCase(),
                      style: TextStyle(
                        color: cs.onPrimaryContainer,
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    )
                  : null,
            ),
            SizedBox(width: 10.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.groupName,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: cs.onSurface,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (widget.isGroup)
                    ListenableBuilder(
                      listenable: _controller,
                      builder: (context, _) {
                        final typingCount = _controller.typingUsers.length;
                        if (typingCount > 0) {
                          return Text(
                            typingCount == 1 
                                ? 'Someone is typing...' 
                                : '$typingCount people are typing...',
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: cs.primary,
                              fontStyle: FontStyle.italic,
                            ),
                          );
                        }
                        return SizedBox.shrink();
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.phone_outlined, color: cs.onSurfaceVariant),
            onPressed: () async {
              await CallService().startGroupCall(
                conversationId: widget.conversationId,
                groupName: widget.groupName,
                groupAvatar: widget.groupAvatar,
              );
              Navigator.pushNamed(context, Routes.callOutgoing);
            },
          ),
          IconButton(
            icon: Icon(Icons.videocam_outlined, color: cs.onSurfaceVariant),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.more_vert_outlined, color: cs.onSurfaceVariant),
            onPressed: () {
              _showGroupInfo(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListenableBuilder(
              listenable: _controller,
              builder: (context, _) {
                if (_controller.isLoading && _controller.messages.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (_controller.error != null) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.error_outline_rounded, 
                            color: cs.error, size: 48.sp),
                        SizedBox(height: 8.h),
                        Text(
                          'Lỗi: ${_controller.error}',
                          style: TextStyle(color: cs.error),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 12.h),
                        ElevatedButton(
                          onPressed: () => _controller.init(widget.conversationId),
                          child: const Text('Thử lại'),
                        ),
                      ],
                    ),
                  );
                }

                if (_controller.messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.chat_bubble_outline_rounded,
                            size: 48.sp, color: cs.onSurfaceVariant),
                        SizedBox(height: 8.h),
                        Text(
                          'Chưa có tin nhắn nào',
                          style: TextStyle(color: cs.onSurfaceVariant),
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          'Hãy bắt đầu cuộc trò chuyện!',
                          style: TextStyle(
                            color: cs.onSurfaceVariant,
                            fontSize: 12.sp,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return Stack(
                  children: [
                    ListView.builder(
                      controller: _scrollController,
                      padding: EdgeInsets.symmetric(
                        horizontal: 16.w, 
                        vertical: 12.h
                      ),
                      itemCount: _controller.messages.length,
                      itemBuilder: (context, index) {
                        final msg = _controller.messages[index];
                        final isMe = _controller.isMessageFromMe(msg);
                        final content = msg['content'] ?? '';
                        final createdAt = msg['createdAt'] != null
                            ? DateTime.tryParse(msg['createdAt'])?.toLocal()
                            : null;
                        final sender = msg['sender'] as Map<String, dynamic>?;
                        final senderName = sender?['username'] ?? 'Unknown';
                        final senderAvatar = sender?['avatar'];

                        final prevMsgSenderId = index == 0
                            ? null
                            : _extractSenderId(_controller.messages[index - 1]['sender']);
                        final msgSenderId = _extractSenderId(msg['sender']);
                        final showAvatar = index == 0 || prevMsgSenderId != msgSenderId;

                        // Show date separator
                        final showDate = index == 0 || 
                            (createdAt != null && _shouldShowDateSeparator(
                              createdAt, 
                              _controller.messages[index - 1]['createdAt']
                            ));
 
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (showDate && createdAt != null)
                              _DateSeparator(date: createdAt),
                            
                            _MessageBubble(
                              content: content,
                              isMe: isMe,
                              time: createdAt != null 
                                  ? DateFormat('HH:mm').format(createdAt) 
                                  : '',
                              avatar: isMe ? null : senderAvatar,
                              username: isMe ? null : senderName,
                              isTemp: msg['isTemp'] == true,
                              showAvatar: showAvatar,
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                );
              },
            ),
          ),

          Container(
            padding: EdgeInsets.symmetric(
              horizontal: 16.w, 
              vertical: 8.h
            ),
            decoration: BoxDecoration(
              color: cs.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.emoji_emotions_outlined, 
                        color: cs.onSurfaceVariant),
                    onPressed: () {},
                  ),
                  
                  // Text input
                  Expanded(
                    child: TextField(
                      controller: _controller.messageController,
                      decoration: InputDecoration(
                        hintText: 'Nhắn tin...',
                        hintStyle: TextStyle(
                          fontSize: 14.sp,
                          color: cs.onSurfaceVariant.withValues(alpha: 0.6),
                        ),
                        filled: true,
                        fillColor: cs.surfaceContainerHighest,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16.w,
                          vertical: 10.h,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24.r),
                          borderSide: BorderSide.none,
                        ),
                        isDense: true,
                      ),
                      maxLines: 4,
                      minLines: 1,
                      textInputAction: TextInputAction.send,
                      onChanged: _controller.onTypingChanged,
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                  
                  // Send button
                  SizedBox(width: 8.w),
                  ListenableBuilder(
                    listenable: _controller,
                    builder: (context, _) {
                      final hasText = _controller.messageController.text.trim().isNotEmpty;
                      return GestureDetector(
                        onTap: hasText ? _handleSend : null,
                        child: CircleAvatar(
                          radius: 22.r,
                          backgroundColor: hasText ? cs.primary : cs.surfaceContainerHighest,
                          child: Icon(
                            Icons.send_rounded,
                            color: hasText ? cs.onPrimary : cs.onSurfaceVariant,
                            size: 20.sp,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  bool _shouldShowDateSeparator(DateTime current, String? previous) {
    if (previous == null) return true;
    final prevDate = DateTime.tryParse(previous)?.toLocal();
    if (prevDate == null) return true;
    
    return current.year != prevDate.year ||
           current.month != prevDate.month ||
           current.day != prevDate.day;
  }

  String _extractSenderId(dynamic sender) {
    if (sender == null) return '';
    if (sender is Map) return sender['_id']?.toString() ?? '';
    return sender.toString();
  }

  void _handleSend() {
    final content = _controller.messageController.text;
    if (content.trim().isEmpty) return;
    
    _controller.sendMessage(content);
  }

  void _showGroupInfo(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.all(20.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40.w,
              height: 4.h,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2.r),
              ),
            ),
            SizedBox(height: 16.h),
            
            Row(
              children: [
                CircleAvatar(
                  radius: 24.r,
                  backgroundImage: widget.groupAvatar != null && widget.groupAvatar!.isNotEmpty
                      ? NetworkImage(widget.groupAvatar!)
                      : null,
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  child: (widget.groupAvatar == null || widget.groupAvatar!.isEmpty)
                      ? Text(
                          widget.groupName.substring(0, 1).toUpperCase(),
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                            fontWeight: FontWeight.bold,
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
                        widget.groupName,
                        style: TextStyle(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        'Group Chat',
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 20.h),
            
            _InfoOption(
              icon: Icons.people_outline_rounded,
              title: 'Members',
              subtitle: 'View all members',
              onTap: () {
                Navigator.pop(context);
              },
            ),
            _InfoOption(
              icon: Icons.notifications_outlined,
              title: 'Notifications',
              subtitle: 'Customize notifications',
              onTap: () {
              },
            ),
            _InfoOption(
              icon: Icons.search_rounded,
              title: 'Search in chat',
              onTap: () {
                Navigator.pop(context);
              },
            ),
            
            SizedBox(height: 16.h),
            Divider(height: 1),
            SizedBox(height: 8.h),
            
            _InfoOption(
              icon: Icons.exit_to_app_rounded,
              title: 'Leave group',
              titleStyle: TextStyle(color: Theme.of(context).colorScheme.error),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }


}

class _DateSeparator extends StatelessWidget {
  final DateTime date;
  
  const _DateSeparator({required this.date});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final formatted = DateFormat('EEEE, MMMM d').format(date);
    
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 16.h),
      child: Center(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: cs.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Text(
            formatted,
            style: TextStyle(
              fontSize: 11.sp,
              color: cs.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final String content;
  final bool isMe;
  final String time;
  final String? avatar;
  final String? username;
  final bool isTemp;
  final bool showAvatar;

  const _MessageBubble({
    required this.content,
    required this.isMe,
    required this.time,
    this.avatar,
    this.username,
    this.isTemp = false,
    required this.showAvatar,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            if (showAvatar)
              CircleAvatar(
                radius: 16.r,
                backgroundImage: avatar != null && avatar.toString().isNotEmpty
                    ? NetworkImage(avatar!)
                    : null,
                backgroundColor: cs.primaryContainer,
                child: (avatar == null || avatar.toString().isEmpty)
                    ? Text(
                        (username ?? '?').substring(0, 1).toUpperCase(),
                        style: TextStyle(
                          color: cs.onPrimaryContainer,
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      )
                    : null,
              )
            else
              SizedBox(width: 32.r),
            SizedBox(width: 8.w),
          ],
          
          Flexible(
            child: Column(
              crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                // Username for group messages
                if (!isMe && showAvatar && username != null)
                  Padding(
                    padding: EdgeInsets.only(left: 4.w, bottom: 2.h),
                    child: Text(
                      username!,
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: cs.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  
                Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.7,
                  ),
                  padding: EdgeInsets.symmetric(
                    horizontal: 14.w,
                    vertical: 10.h,
                  ),
                  decoration: BoxDecoration(
                    color: isMe ? cs.primary : cs.surfaceContainerHighest,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isMe ? 16 : 4),
                      bottomRight: Radius.circular(isMe ? 4 : 16),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        content,
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: isMe ? cs.onPrimary : cs.onSurface,
                          height: 1.3,
                        ),
                      ),
                      if (isTemp)
                        Padding(
                          padding: EdgeInsets.only(top: 4.h),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 12,
                                height: 12,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: isMe 
                                      ? cs.onPrimary.withOpacity(0.7) 
                                      : cs.onSurfaceVariant,
                                ),
                              ),
                              SizedBox(width: 4.w),
                              Text(
                                'Sending...',
                                style: TextStyle(
                                  fontSize: 10.sp,
                                  color: isMe 
                                      ? cs.onPrimary.withOpacity(0.7) 
                                      : cs.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                
                Padding(
                  padding: EdgeInsets.only(top: 4.h, right: 4.w),
                  child: Text(
                    time,
                    style: TextStyle(
                      fontSize: 10.sp,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (isMe) SizedBox(width: 8.w),
        ],
      ),
    );
  }
}

class _InfoOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final TextStyle? titleStyle;
  final VoidCallback? onTap;

  const _InfoOption({
    required this.icon,
    required this.title,
    this.subtitle,
    this.titleStyle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: cs.primary, size: 24.sp),
      title: Text(
        title,
        style: titleStyle ?? TextStyle(
          fontSize: 14.sp,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: TextStyle(
                fontSize: 12.sp,
                color: cs.onSurfaceVariant,
              ),
            )
          : null,
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: cs.onSurfaceVariant,
        size: 20.sp,
      ),
      onTap: onTap,
    );
  }
}


